import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Module } from "node:module";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const utilityPath = resolve(testDirectory, "../src/lib/ai/gemini-model-fallback.ts");
const utilitySource = readFileSync(utilityPath, "utf8");
const compiledUtility = ts.transpileModule(utilitySource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const utilityModule = new Module(utilityPath);
utilityModule.filename = utilityPath;
utilityModule.paths = Module._nodeModulePaths(dirname(utilityPath));
utilityModule._compile(compiledUtility, utilityPath);

const {
  classifyGeminiFailure,
  GeminiServiceError,
  runGeminiModelFallback,
} = utilityModule.exports;

const models = ["gemini-3.5-flash-lite", "gemini-3.8-flash"];

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

test("uses the primary image model when it succeeds", async () => {
  const attempted = [];
  const result = await runGeminiModelFallback({
    models,
    attempt: async (model) => {
      attempted.push(model);
      return "primary result";
    },
  });

  assert.deepEqual(attempted, [models[0]]);
  assert.equal(result.value, "primary result");
  assert.equal(result.model, models[0]);
  assert.equal(result.usedFallback, false);
});

test("falls back after a temporary 503/overload response", async () => {
  const attempted = [];
  const fallbackEvents = [];
  const result = await runGeminiModelFallback({
    models,
    attempt: async (model) => {
      attempted.push(model);
      if (model === models[0]) throw httpError(503, "The model is overloaded.");
      return "fallback result";
    },
    onFallback: (event) => fallbackEvents.push(event),
  });

  assert.deepEqual(attempted, models);
  assert.equal(result.value, "fallback result");
  assert.equal(result.model, models[1]);
  assert.equal(result.usedFallback, true);
  assert.equal(fallbackEvents[0].reason, "overloaded");
});

test("falls back after a 429 rate limit", async () => {
  const attempted = [];
  await runGeminiModelFallback({
    models,
    attempt: async (model) => {
      attempted.push(model);
      if (model === models[0]) throw httpError(429, "Quota exceeded.");
      return "ok";
    },
  });

  assert.deepEqual(attempted, models);
});

test("falls back after a request timeout", async () => {
  const attempted = [];
  const timeout = new Error("The operation timed out.");
  timeout.name = "TimeoutError";
  assert.equal(classifyGeminiFailure(timeout).reason, "timeout");

  await runGeminiModelFallback({
    models,
    attempt: async (model) => {
      attempted.push(model);
      if (model === models[0]) throw timeout;
      return "ok";
    },
  });

  assert.deepEqual(attempted, models);
});

test("tries the alternate model for an unavailable model ID", async () => {
  const attempted = [];
  await runGeminiModelFallback({
    models,
    attempt: async (model) => {
      attempted.push(model);
      if (model === models[0]) {
        throw httpError(404, "models/gemini-3.5-flash-lite is not found for generateContent.");
      }
      return "ok";
    },
  });

  assert.deepEqual(attempted, models);
});

test("does not switch models for invalid-request errors", async () => {
  const attempted = [];
  await assert.rejects(
    () =>
      runGeminiModelFallback({
        models,
        attempt: async (model) => {
          attempted.push(model);
          throw httpError(400, "Invalid image MIME type.");
        },
      }),
    (error) => error instanceof GeminiServiceError && !error.retryable
  );

  assert.deepEqual(attempted, [models[0]]);
});

test("stops after one failed fallback and returns a safe retryable error", async () => {
  const attempted = [];
  await assert.rejects(
    () =>
      runGeminiModelFallback({
        models,
        attempt: async (model) => {
          attempted.push(model);
          throw httpError(model === models[0] ? 503 : 500, "Temporary provider failure.");
        },
      }),
    (error) => {
      assert.ok(error instanceof GeminiServiceError);
      assert.equal(error.retryable, true);
      assert.deepEqual(error.attemptedModels, models);
      assert.doesNotMatch(error.message, /Temporary provider failure/);
      return true;
    }
  );

  assert.deepEqual(attempted, models);
});

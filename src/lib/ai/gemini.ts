import {
  runGeminiModelFallback,
} from "@/lib/ai/gemini-model-fallback";

export { GeminiServiceError } from "@/lib/ai/gemini-model-fallback";

/** The REST endpoint supplies the `models/` path segment; entries stay bare IDs. */
export const GEMINI_IMAGE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
] as const;

// Keep text chat on its existing preferred model while sharing the bounded
// transient-error policy. Image analysis uses the explicit fast/fallback pair above.
const GEMINI_TEXT_MODELS = ["gemini-3.6-flash", "gemini-2.5-flash"] as const;
const GEMINI_REQUEST_TIMEOUT_MS = 15_000;
const MAX_PROVIDER_ERROR_CHARS = 4_000;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (
    !key ||
    key.trim() === "" ||
    key === "your_gemini_api_key" ||
    key === "your-gemini-api-key"
  ) {
    throw new Error("GEMINI_API_KEY environment variable is not configured in .env or .env.local.");
  }
  return key.trim();
}

export function maskApiKey(text: string, apiKey?: string): string {
  if (!text) return "";
  let sanitized = text;
  if (apiKey && apiKey.length > 4) {
    sanitized = sanitized.replaceAll(apiKey, "[MASKED_API_KEY]");
  }
  return sanitized.replace(/AIzaSy[A-Za-z0-9_-]{33}/g, "[MASKED_API_KEY]");
}

interface GeminiCandidate {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

interface GeminiErrorPayload {
  error?: {
    code?: number;
    status?: string;
    message?: string;
  };
}

class GeminiApiAttemptError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, message: string, code = "") {
    super(message);
    this.name = "GeminiApiAttemptError";
    this.status = status;
    this.code = code;
  }
}

async function requestGeminiModel(
  requestBody: object,
  modelName: string,
  apiKey: string
): Promise<GeminiCandidate> {
  // Gemini REST takes the model name after `/models/`; do not prefix the ID itself.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(GEMINI_REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const responseText = (await response.text()).slice(0, MAX_PROVIDER_ERROR_CHARS);
    let message = responseText || "Gemini request failed.";
    let providerCode = "";
    try {
      const parsed = JSON.parse(responseText) as GeminiErrorPayload;
      message = parsed.error?.message || message;
      providerCode = parsed.error?.status || "";
    } catch {
      // Keep a bounded plain-text provider message for failure classification only.
    }
    throw new GeminiApiAttemptError(response.status, message, providerCode);
  }

  return (await response.json()) as GeminiCandidate;
}

async function postGeminiWithFallback(
  requestBody: object,
  task: string,
  models: readonly string[]
): Promise<GeminiCandidate> {
  const apiKey = getApiKey();
  const { value } = await runGeminiModelFallback({
    models,
    attempt: (model) => requestGeminiModel(requestBody, model, apiKey),
    onAttempt: (model, attemptNumber, attemptLimit) => {
      console.info(
        `[Gemini] task=${task} model=${model} attempt=${attemptNumber}/${attemptLimit}`
      );
    },
    onFallback: ({ fromModel, toModel, status, reason }) => {
      console.warn(
        `[Gemini] task=${task} fallback=${fromModel}->${toModel} status=${status} reason=${reason}`
      );
    },
    onFailure: (model, failure) => {
      console.error(
        `[Gemini] task=${task} model=${model} failed status=${failure.status} reason=${failure.reason}`
      );
    },
  });
  return value;
}

export async function analyzeImageWithGemini(
  base64Image: string,
  mimeType: string,
  promptText: string,
  task = "image-analysis"
) {
  const requestBody = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  };

  const data = await postGeminiWithFallback(requestBody, task, GEMINI_IMAGE_MODELS);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text;
}

export async function generateTextWithGemini(promptText: string) {
  const requestBody = {
    contents: [{ parts: [{ text: promptText }] }],
  };

  const data = await postGeminiWithFallback(requestBody, "agronomist-chat", GEMINI_TEXT_MODELS);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text;
}

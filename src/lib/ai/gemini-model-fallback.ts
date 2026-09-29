export type GeminiFailureReason =
  | "model_unavailable"
  | "overloaded"
  | "rate_limited"
  | "timeout"
  | "temporary_server_error"
  | "network_error"
  | "invalid_request"
  | "permission_denied"
  | "api_error";

export interface GeminiFailureClassification {
  retryable: boolean;
  status: number;
  reason: GeminiFailureReason;
}

export interface GeminiFallbackEvent {
  fromModel: string;
  toModel: string;
  status: number;
  reason: GeminiFailureReason;
}

export class GeminiServiceError extends Error {
  readonly status: number;
  readonly isBusy: boolean;
  readonly retryable: boolean;
  readonly reason: GeminiFailureReason;
  readonly attemptedModels: readonly string[];

  constructor(failure: GeminiFailureClassification, attemptedModels: readonly string[]) {
    super(
      failure.retryable
        ? "Gemini models are temporarily unavailable. Please try again."
        : "Gemini could not process this request. Check the image and try again."
    );
    this.name = "GeminiServiceError";
    this.status = failure.status;
    this.isBusy = failure.retryable;
    this.retryable = failure.retryable;
    this.reason = failure.reason;
    this.attemptedModels = attemptedModels;
  }
}

function readFailureDetails(error: unknown): {
  status?: number;
  message: string;
  code: string;
  name: string;
} {
  if (!error || typeof error !== "object") {
    return { message: String(error ?? ""), code: "", name: "" };
  }

  const candidate = error as {
    status?: unknown;
    message?: unknown;
    code?: unknown;
    name?: unknown;
    providerStatus?: unknown;
  };
  return {
    status: typeof candidate.status === "number" ? candidate.status : undefined,
    message: typeof candidate.message === "string" ? candidate.message : "",
    code: typeof candidate.code === "string" ? candidate.code : "",
    name: typeof candidate.name === "string" ? candidate.name : "",
  };
}

export function classifyGeminiFailure(error: unknown): GeminiFailureClassification {
  const { status, message, code, name } = readFailureDetails(error);
  const details = `${message} ${code}`.toLowerCase();

  if (name === "TimeoutError" || name === "AbortError" || status === 408 || status === 504) {
    return { retryable: true, status: status ?? 504, reason: "timeout" };
  }

  if (
    /(?:model|models\/[\w.-]+).{0,120}(?:not found|not available|unavailable|does not exist|not supported)|(?:not found|not available|unavailable|does not exist).{0,120}(?:model|models\/)/i.test(
      details
    ) ||
    code.toLowerCase() === "not_found_model"
  ) {
    return { retryable: true, status: status ?? 404, reason: "model_unavailable" };
  }

  if (
    code.toLowerCase() === "resource_exhausted" ||
    status === 429
  ) {
    return { retryable: true, status: status ?? 429, reason: "rate_limited" };
  }

  if (/overload(?:ed)?|high demand|capacity exhausted|temporarily unavailable/i.test(details)) {
    return { retryable: true, status: status ?? 503, reason: "overloaded" };
  }

  if (status !== undefined && status >= 500 && status <= 599) {
    return { retryable: true, status, reason: "temporary_server_error" };
  }

  if (name === "TypeError" && status === undefined) {
    return { retryable: true, status: 503, reason: "network_error" };
  }

  if (status === 400 || status === 413 || status === 422) {
    return { retryable: false, status, reason: "invalid_request" };
  }

  if (status === 401 || status === 403) {
    return { retryable: false, status, reason: "permission_denied" };
  }

  return { retryable: false, status: status ?? 502, reason: "api_error" };
}

export async function runGeminiModelFallback<T>(options: {
  models: readonly string[];
  attempt: (model: string) => Promise<T>;
  onAttempt?: (model: string, attemptNumber: number, attemptLimit: number) => void;
  onFallback?: (event: GeminiFallbackEvent) => void;
  onFailure?: (model: string, failure: GeminiFailureClassification) => void;
}): Promise<{ value: T; model: string; usedFallback: boolean }> {
  const models = options.models.filter(Boolean);
  if (models.length === 0) {
    throw new GeminiServiceError(
      { retryable: false, status: 500, reason: "api_error" },
      []
    );
  }

  const attemptedModels: string[] = [];
  for (let index = 0; index < models.length; index += 1) {
    const model = models[index];
    attemptedModels.push(model);
    options.onAttempt?.(model, index + 1, models.length);

    try {
      return {
        value: await options.attempt(model),
        model,
        usedFallback: index > 0,
      };
    } catch (error) {
      const failure = classifyGeminiFailure(error);
      const nextModel = models[index + 1];
      if (failure.retryable && nextModel) {
        options.onFallback?.({
          fromModel: model,
          toModel: nextModel,
          status: failure.status,
          reason: failure.reason,
        });
        continue;
      }

      options.onFailure?.(model, failure);
      throw new GeminiServiceError(failure, attemptedModels);
    }
  }

  throw new GeminiServiceError(
    { retryable: false, status: 502, reason: "api_error" },
    attemptedModels
  );
}

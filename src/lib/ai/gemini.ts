// Supported Google Gemini Models (Primary + Active Fallbacks)
export const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
] as const;

export class GeminiServiceError extends Error {
  status: number;
  isBusy: boolean;

  constructor(message: string, status: number, isBusy = false) {
    super(message);
    this.name = "GeminiServiceError";
    this.status = status;
    this.isBusy = isBusy;
  }
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === "" || key === "your_gemini_api_key" || key === "your-gemini-api-key") {
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

/**
 * Executes a Gemini API POST request with exponential backoff and model fallback on HTTP 503 / 429.
 */
async function postGeminiWithRetry(requestBody: object, maxRetries = GEMINI_MODELS.length): Promise<GeminiCandidate> {
  const apiKey = getApiKey();
  let lastError: Error | null = null;
  let lastStatus = 500;
  let isBusy = false;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Select model candidate for this attempt
    const modelName = GEMINI_MODELS[attempt % GEMINI_MODELS.length];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }

      lastStatus = response.status;
      const errText = await response.text();
      let googleMessage = "";

      try {
        const parsed = JSON.parse(errText);
        if (parsed?.error?.message) {
          googleMessage = parsed.error.message;
        }
      } catch {
        // Non-JSON response
      }

      const rawErrorMessage = googleMessage || errText || "Request failed.";
      const safeErrorMessage = maskApiKey(rawErrorMessage, apiKey);

      // Identify 503 Service Unavailable / 429 Rate Limit / High Demand
      const is503OrBusy =
        response.status === 503 ||
        response.status === 429 ||
        safeErrorMessage.toLowerCase().includes("high demand") ||
        safeErrorMessage.toLowerCase().includes("overloaded") ||
        safeErrorMessage.toLowerCase().includes("capacity");

      if (is503OrBusy) {
        isBusy = true;
        console.warn(
          `Gemini API [${modelName}] high demand / 503 on attempt ${attempt + 1}/${maxRetries}. Retrying...`
        );
      } else {
        console.error(`Gemini API Error [HTTP ${response.status}] model=${modelName}:`, safeErrorMessage);
      }

      lastError = new GeminiServiceError(
        is503OrBusy
          ? "The model is currently experiencing high demand. Please try again in a few moments."
          : safeErrorMessage,
        response.status,
        is503OrBusy
      );

      // If it's a non-retryable error (e.g. 400 Bad Request or 401 Unauthorized), fail fast
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        throw lastError;
      }
    } catch (err: unknown) {
      if (err instanceof GeminiServiceError && (err.status === 400 || err.status === 401 || err.status === 403)) {
        throw err;
      }

      const message = err instanceof Error ? err.message : String(err);
      const safeMsg = maskApiKey(message, apiKey);
      lastError = err instanceof GeminiServiceError ? err : new GeminiServiceError(safeMsg, lastStatus, isBusy);
    }

    // Wait with exponential backoff before next attempt
    if (attempt < maxRetries - 1) {
      const delayMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw (
    lastError ||
    new GeminiServiceError(
      "The AI service is currently busy. Please try again in a few moments.",
      lastStatus,
      isBusy
    )
  );
}

export async function analyzeImageWithGemini(
  base64Image: string,
  mimeType: string,
  promptText: string
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
  };

  const data = await postGeminiWithRetry(requestBody);
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return rawText;
}

export async function generateTextWithGemini(promptText: string) {
  const requestBody = {
    contents: [{ parts: [{ text: promptText }] }],
  };

  const data = await postGeminiWithRetry(requestBody);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text;
}

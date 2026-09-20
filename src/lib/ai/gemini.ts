import { PROMPTS } from "./prompts";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === "" || key === "your_gemini_api_key" || key === "your-gemini-api-key") {
    throw new Error("GEMINI_API_KEY environment variable is not configured in .env or .env.local.");
  }
  return key.trim();
}

function maskApiKey(text: string, apiKey: string): string {
  if (!text) return "";
  let sanitized = text;
  if (apiKey && apiKey.length > 4) {
    sanitized = sanitized.replaceAll(apiKey, "[MASKED_API_KEY]");
  }
  return sanitized.replace(/AIzaSy[A-Za-z0-9_-]{33}/g, "[MASKED_API_KEY]");
}

export async function analyzeImageWithGemini(
  base64Image: string,
  mimeType: string,
  promptText: string
) {
  const apiKey = getApiKey();

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
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
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let googleMessage = "";
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.error?.message) {
        googleMessage = parsed.error.message;
      }
    } catch {
      // Not JSON
    }

    const rawErrorMessage = googleMessage || errText || "Request failed.";
    const safeErrorMessage = maskApiKey(rawErrorMessage, apiKey);

    console.error(`Gemini API Error [HTTP ${response.status}]:`, safeErrorMessage);
    throw new Error(`Gemini API Error (HTTP ${response.status}): ${safeErrorMessage}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return rawText;
}

export async function generateTextWithGemini(promptText: string) {
  const apiKey = getApiKey();

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let googleMessage = "";
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.error?.message) {
        googleMessage = parsed.error.message;
      }
    } catch {
      // Not JSON
    }

    const rawErrorMessage = googleMessage || errText || "Request failed.";
    const safeErrorMessage = maskApiKey(rawErrorMessage, apiKey);

    console.error(`Gemini API Error [HTTP ${response.status}]:`, safeErrorMessage);
    throw new Error(`Gemini API Error (HTTP ${response.status}): ${safeErrorMessage}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text;
}

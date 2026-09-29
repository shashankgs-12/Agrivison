import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini, GeminiServiceError } from "@/lib/ai/gemini";
import { PROMPTS } from "@/lib/ai/prompts";
import { auth } from "@/auth";
import { z } from "zod";

const localizedTextSchema = z.union([
  z.string().min(1),
  z.record(z.string(), z.string()),
]);

const diseaseResultSchema = z.object({
  disease: localizedTextSchema,
  scientificName: z.string().optional(),
  confidence: z
    .preprocess(
      (value) =>
        typeof value === "string" ? Number.parseFloat(value.replace(/%$/, "")) : value,
      z.number().finite().min(0).max(100)
    ),
  severity: z
    .preprocess((value) => {
      const normalized = String(value ?? "").trim().toLowerCase();
      if (["moderate", "moderately severe"].includes(normalized)) return "medium";
      if (normalized === "severe") return "high";
      if (["none", "healthy", "no disease"].includes(normalized)) return "low";
      return normalized;
    }, z.enum(["low", "medium", "high", "critical"])),
  symptoms: localizedTextSchema.optional(),
  treatment: z
    .object({
      organic: localizedTextSchema.optional(),
      chemical: localizedTextSchema.optional(),
    })
    .passthrough()
    .optional(),
  medicineRecommendation: localizedTextSchema.optional(),
  prevention: localizedTextSchema.optional(),
  immediateAction: localizedTextSchema.optional(),
}).passthrough();

class InvalidDiseaseResponseError extends Error {
  constructor() {
    super("The AI returned an unreadable disease diagnosis.");
    this.name = "InvalidDiseaseResponseError";
  }
}

function parseDiseaseResponse(rawText: string) {
  const codeBlock = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = (codeBlock?.[1] ?? rawText).trim();
  const start = text.indexOf("{");
  if (start < 0) throw new InvalidDiseaseResponseError();

  let depth = 0;
  let inString = false;
  let escaped = false;
  let end = -1;

  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        end = index + 1;
        break;
      }
    }
  }

  if (end < 0) throw new InvalidDiseaseResponseError();

  const candidate = text.slice(start, end);
  let repaired = "";
  inString = false;
  escaped = false;

  for (let index = 0; index < candidate.length; index += 1) {
    const character = candidate[index];
    if (inString) {
      if (escaped) {
        escaped = false;
        repaired += character;
      } else if (character === "\\") {
        escaped = true;
        repaired += character;
      } else if (character === '"') {
        inString = false;
        repaired += character;
      } else if (character === "\n") repaired += "\\n";
      else if (character === "\r") repaired += "\\r";
      else if (character === "\t") repaired += "\\t";
      else repaired += character;
      continue;
    }

    if (character === '"') {
      inString = true;
      repaired += character;
    } else if (character === ",") {
      let next = index + 1;
      while (/\s/.test(candidate[next] ?? "")) next += 1;
      if (candidate[next] !== "}" && candidate[next] !== "]") repaired += character;
    } else {
      repaired += character;
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(repaired);
  } catch {
    throw new InvalidDiseaseResponseError();
  }

  const validation = diseaseResultSchema.safeParse(parsed);
  if (!validation.success) throw new InvalidDiseaseResponseError();
  return validation.data;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
    }

    const payload: unknown = await req.json();
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "A valid image is required." }, { status: 400 });
    }

    const { image, mimeType = "image/jpeg", language = "en" } = payload as {
      image?: unknown;
      mimeType?: unknown;
      language?: unknown;
    };

    if (typeof image !== "string" || image.trim() === "") {
      return NextResponse.json(
        { error: "Please upload or capture a leaf image first." },
        { status: 400 }
      );
    }

    const dataUriMatch = image.match(/^data:(image\/(?:jpeg|png|webp));base64,/i);
    const base64Data = dataUriMatch ? image.slice(dataUriMatch[0].length) : image;
    const detectedMime = dataUriMatch?.[1] || mimeType;
    if (
      typeof detectedMime !== "string" ||
      !["image/jpeg", "image/png", "image/webp"].includes(detectedMime.toLowerCase()) ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(base64Data) ||
      base64Data.length > 14 * 1024 * 1024
    ) {
      return NextResponse.json(
        { error: "Use a valid JPEG, PNG, or WebP image smaller than 10 MB." },
        { status: 400 }
      );
    }

    // Call Gemini API with Disease Detection Prompt
    const supportedLanguages = new Set(["en", "hi", "kn", "ml", "ta", "te"]);
    const safeLanguage =
      typeof language === "string" && supportedLanguages.has(language) ? language : "en";
    const rawResponse = await analyzeImageWithGemini(
      base64Data,
      detectedMime.toLowerCase(),
      PROMPTS.DISEASE_DETECTION(safeLanguage),
      "disease-detection"
    );

    if (!rawResponse) {
      throw new Error("No response generated from AI engine.");
    }

    const parsedData = parseDiseaseResponse(rawResponse);

    if (parsedData.confidence < 40) {
      return NextResponse.json(
        {
          success: false,
          retryable: true,
          error:
            "The AI could not confidently identify a disease from this image. Try a sharper close-up of the affected leaf.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, result: parsedData });
  } catch (error: unknown) {
    console.error("Disease Detection Error:", error);

    if (error instanceof GeminiServiceError) {
      const status = error.retryable ? (error.status === 504 ? 504 : 503) : 502;
      return NextResponse.json(
        {
          success: false,
          retryable: error.retryable,
          isBusy: error.retryable,
          error: error.retryable
            ? "Both AI models are temporarily unavailable. Your image is still selected; please try again shortly."
            : "The AI could not process this image. Please try again with a clear JPEG, PNG, or WebP leaf photo.",
        },
        { status }
      );
    }

    if (error instanceof InvalidDiseaseResponseError) {
      return NextResponse.json(
        {
          success: false,
          retryable: true,
          error:
            "The AI could not format this diagnosis correctly. Please try again with a clear, close-up crop photo.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process disease scan. Please ensure GEMINI_API_KEY is configured.",
      },
      { status: 500 }
    );
  }
}

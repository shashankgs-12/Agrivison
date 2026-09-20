import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini, GeminiServiceError } from "@/lib/ai/gemini";
import { PROMPTS } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType = "image/jpeg" } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Please upload or capture a leaf image first." },
        { status: 400 }
      );
    }

    // Strip data URI prefix if present
    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    // Call Gemini API with Disease Detection Prompt
    const rawResponse = await analyzeImageWithGemini(
      base64Data,
      mimeType,
      PROMPTS.DISEASE_DETECTION
    );

    if (!rawResponse) {
      throw new Error("No response generated from AI engine.");
    }

    // Clean JSON code fences if present
    let cleanedText = rawResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({ success: true, result: parsedData });
  } catch (error: unknown) {
    console.error("Disease Detection Error:", error);

    const isBusy =
      (error instanceof GeminiServiceError && (error.status === 503 || error.isBusy)) ||
      (error instanceof Error &&
        (error.message.includes("503") ||
          error.message.includes("high demand") ||
          error.message.includes("busy") ||
          error.message.includes("overloaded")));

    if (isBusy) {
      return NextResponse.json(
        {
          success: false,
          isBusy: true,
          error:
            "Disease detection is temporarily unavailable. The AI service is currently busy. Please try again in a few moments.",
        },
        { status: 503 }
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

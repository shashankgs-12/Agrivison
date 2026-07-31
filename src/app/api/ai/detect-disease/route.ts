import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini } from "@/lib/ai/gemini";
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

    // Call Gemini 2.5 API with Disease Detection Prompt
    const rawResponse = await analyzeImageWithGemini(
      base64Data,
      mimeType,
      PROMPTS.DISEASE_DETECTION
    );

    // Clean JSON code fences if present
    const cleanedText = rawResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error("Disease Detection Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to process disease scan. Please ensure GEMINI_API_KEY is configured.",
      },
      { status: 500 }
    );
  }
}

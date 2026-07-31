import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini } from "@/lib/ai/gemini";
import { PROMPTS } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType = "image/jpeg" } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Please upload or capture a plant image first." },
        { status: 400 }
      );
    }

    // Strip data URI prefix if present
    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    const rawResponse = await analyzeImageWithGemini(
      base64Data,
      mimeType,
      PROMPTS.PLANT_IDENTIFICATION
    );

    const cleanedText = rawResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({ success: true, result: parsedData });
  } catch (error: any) {
    console.error("Plant Identification Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to identify plant. Please ensure GEMINI_API_KEY is configured in your environment.",
      },
      { status: 500 }
    );
  }
}

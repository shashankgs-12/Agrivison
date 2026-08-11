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

    if (!rawResponse) {
      throw new Error("No response generated from AI engine.");
    }

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
    console.error("Plant Identification Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to identify plant. Please ensure GEMINI_API_KEY is configured in your environment.",
      },
      { status: 500 }
    );
  }
}

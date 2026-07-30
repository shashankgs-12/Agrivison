import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini } from "@/lib/ai/gemini";
import { PROMPTS } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType = "image/jpeg" } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image base64 payload is required." },
        { status: 400 }
      );
    }

    const rawResponse = await analyzeImageWithGemini(
      image,
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
        error: error.message || "Failed to identify plant.",
      },
      { status: 500 }
    );
  }
}

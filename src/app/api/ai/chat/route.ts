import { NextRequest, NextResponse } from "next/server";
import { generateTextWithGemini } from "@/lib/ai/gemini";
import { PROMPTS } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { message, language = "English" } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message content is required." },
        { status: 400 }
      );
    }

    const systemPrompt = PROMPTS.AGRONOMIST_CHAT(language);
    const fullPrompt = `${systemPrompt}\n\nFarmer Query: ${message}\n\nAI Agronomist Response:`;

    const aiResponse = await generateTextWithGemini(fullPrompt);

    return NextResponse.json({
      success: true,
      reply: aiResponse,
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to process chat message.",
      },
      { status: 500 }
    );
  }
}

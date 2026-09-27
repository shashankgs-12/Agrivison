import { NextRequest, NextResponse } from "next/server";
import { generateTextWithGemini } from "@/lib/ai/gemini";
import { PROMPTS } from "@/lib/ai/prompts";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
    }

    const payload: unknown = await req.json();
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "A valid chat message is required." }, { status: 400 });
    }

    const { message, language = "English" } = payload as {
      message?: unknown;
      language?: unknown;
    };

    if (typeof message !== "string" || !message.trim() || message.length > 4000) {
      return NextResponse.json(
        { error: "Enter a message of 1 to 4,000 characters." },
        { status: 400 }
      );
    }

    const safeLanguage =
      typeof language === "string" && language.length <= 40 ? language : "English";
    const systemPrompt = PROMPTS.AGRONOMIST_CHAT(safeLanguage);
    const fullPrompt = `${systemPrompt}\n\nFarmer Query: ${message.trim()}\n\nAI Agronomist Response:`;

    const aiResponse = await generateTextWithGemini(fullPrompt);

    return NextResponse.json({
      success: true,
      reply: aiResponse,
    });
  } catch (error: unknown) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process chat message.",
      },
      { status: 500 }
    );
  }
}

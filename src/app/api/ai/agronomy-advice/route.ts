import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { SUPPORTED_LANGUAGES } from "@/lib/utils/constants";
import {
  AgronomyAdvisorInputError,
  generateAgronomyAdvice,
  getAdvisorErrorResponse,
  type AgronomyAdvisorType,
} from "@/lib/ai/agronomy-advisor";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json({ error: "A valid advisor request is required." }, { status: 400 });
    }

    const body = payload as { type?: unknown; context?: unknown; language?: unknown };
    if (body.type !== "irrigation" && body.type !== "fertilizer") {
      return NextResponse.json({ error: "Choose an available advisor." }, { status: 400 });
    }

    const language = SUPPORTED_LANGUAGES.some((item) => item.code === body.language)
      ? body.language as "en" | "kn" | "hi" | "te" | "ta" | "ml"
      : "en";
    const recommendation = await generateAgronomyAdvice(body.type as AgronomyAdvisorType, body.context, language);
    return NextResponse.json({ success: true, recommendation });
  } catch (error) {
    const { status, message } = getAdvisorErrorResponse(error);
    if (error instanceof AgronomyAdvisorInputError) {
      console.warn("Agronomy advisor context validation failed for fields:", error.invalidFields);
    } else {
      console.error("Agronomy advisor request failed:", error instanceof Error ? error.name : "unknown error");
    }
    return NextResponse.json({
      error: message,
      ...(error instanceof AgronomyAdvisorInputError ? { fields: error.invalidFields } : {}),
    }, { status });
  }
}

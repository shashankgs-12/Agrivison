import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini, GeminiServiceError } from "@/lib/ai/gemini";
import { PROMPTS } from "@/lib/ai/prompts";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const plantResultSchema = z.object({
  isPlant: z.boolean().optional(),
  message: z.string().optional(),
  name: z.string().trim().optional(),
  scientificName: z.string().trim().optional(),
  confidence: z
    .preprocess(
      (value) =>
        typeof value === "string" ? Number.parseFloat(value.replace(/%$/, "")) : value,
      z.number().finite().min(0).max(100)
    )
    .optional(),
  family: z.string().trim().optional(),
  description: z.string().trim().optional(),
  visibleCharacteristics: z.string().trim().optional(),
  recommendedCare: z.string().trim().optional(),
  commonDiseases: z.string().trim().optional(),
  suitableSoil: z.string().trim().optional(),
  waterRequirement: z.string().trim().optional(),
  sunlightRequirement: z.string().trim().optional(),
}).passthrough();

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
    }

    const body = await req.json();
    const { image, mimeType = "image/jpeg", language = "en" } = body ?? {};

    if (!image || typeof image !== "string" || image.trim() === "") {
      return NextResponse.json(
        { error: "Please upload or capture a plant image first." },
        { status: 400 }
      );
    }

    const dataUriMatch = image.match(/^data:(image\/(?:jpeg|png|webp));base64,/i);
    const detectedMime = dataUriMatch?.[1] || mimeType;
    const base64Data = dataUriMatch ? image.slice(dataUriMatch[0].length) : image;
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

    const supportedLanguages = new Set(["en", "hi", "kn", "ml", "ta", "te"]);
    const safeLanguage =
      typeof language === "string" && supportedLanguages.has(language) ? language : "en";
    const promptText = typeof PROMPTS.PLANT_IDENTIFICATION === "function"
      ? PROMPTS.PLANT_IDENTIFICATION(safeLanguage)
      : PROMPTS.PLANT_IDENTIFICATION;

    const rawResponse = await analyzeImageWithGemini(
      base64Data,
      detectedMime.toLowerCase(),
      promptText,
      "crop-detection-and-plant-id"
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

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch {
      return NextResponse.json(
        { error: "Unable to parse AI response. Please upload a clearer plant photo." },
        { status: 502 }
      );
    }

    const validation = plantResultSchema.safeParse(parsedData);
    if (!validation.success) {
      return NextResponse.json(
        { error: "The AI returned an incomplete plant identification. Please retry with a clearer photo." },
        { status: 502 }
      );
    }
    const plantData = validation.data;
    if (
      plantData.isPlant === false ||
      !plantData.name ||
      plantData.confidence === undefined ||
      plantData.confidence < 40
    ) {
      return NextResponse.json(
        {
          success: false,
          isPlant: false,
          error:
            plantData.message ||
            "Unable to confidently identify the plant. Please upload a clearer plant photo.",
          result: null,
        },
        { status: 422 }
      );
    }

    // Keep optional fields empty when Gemini omitted them; do not invent care advice.
    const formattedResult = {
      name: plantData.name,
      scientificName: plantData.scientificName || "",
      confidence: plantData.confidence,
      family: plantData.family || "",
      description: plantData.description || "",
      visibleCharacteristics: plantData.visibleCharacteristics || "",
      recommendedCare: plantData.recommendedCare || "",
      commonDiseases: plantData.commonDiseases || "",
      suitableSoil: plantData.suitableSoil || "",
      waterRequirement: plantData.waterRequirement || "",
      sunlightRequirement: plantData.sunlightRequirement || "",
    };

    // Save scan to PostgreSQL database using Prisma safely
    try {
      let validUserId: string | null = null;
      if (session.user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { id: true },
        });
        if (dbUser) validUserId = dbUser.id;
      }

      await prisma.plantScan.create({
        data: {
          userId: validUserId,
          imageUrl: image.length > 500000 ? "" : image,
          plantName: formattedResult.name,
          scientificName: formattedResult.scientificName,
          confidence: Number(formattedResult.confidence),
          description: formattedResult.description,
          visibleCharacteristics: formattedResult.visibleCharacteristics,
          recommendedCare: formattedResult.recommendedCare,
          commonDiseases: formattedResult.commonDiseases,
          suitableSoil: formattedResult.suitableSoil,
          waterRequirement: formattedResult.waterRequirement,
          sunlightRequirement: formattedResult.sunlightRequirement,
          language: safeLanguage,
          rawResult: JSON.stringify(formattedResult),
        },
      });
    } catch (dbErr) {
      console.warn("Notice: Failed to persist plant scan to PostgreSQL:", dbErr);
    }

    return NextResponse.json({
      success: true,
      isPlant: true,
      result: formattedResult,
    });
  } catch (error: unknown) {
    console.error("Plant Identification Error:", error);

    if (error instanceof GeminiServiceError) {
      const status = error.retryable ? (error.status === 504 ? 504 : 503) : 502;
      return NextResponse.json(
        {
          success: false,
          retryable: error.retryable,
          isBusy: error.retryable,
          error: error.retryable
            ? "Both AI models are temporarily unavailable. Your image is still selected; please try again shortly."
            : "The AI could not process this image. Please try again with a clear JPEG, PNG, or WebP plant photo.",
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to identify plant. Please ensure GEMINI_API_KEY is configured in your environment.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
    }

    const scans = await prisma.plantScan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, scans });
  } catch (error: unknown) {
    console.error("Failed to fetch plant scans:", error);
    return NextResponse.json(
      { error: "Failed to retrieve plant scan history." },
      { status: 500 }
    );
  }
}

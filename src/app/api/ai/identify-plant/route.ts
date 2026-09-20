import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithGemini, GeminiServiceError } from "@/lib/ai/gemini";
import { PROMPTS } from "@/lib/ai/prompts";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { image, mimeType = "image/jpeg", language = "en", userId: bodyUserId } = body;

    const activeUserId = session?.user?.id || bodyUserId || null;

    if (!image || typeof image !== "string" || image.trim() === "") {
      return NextResponse.json(
        { error: "Please upload or capture a plant image first." },
        { status: 400 }
      );
    }

    // Determine mimeType from base64 header if present
    let detectedMime = mimeType;
    if (image.startsWith("data:")) {
      const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      if (match && match[1]) {
        detectedMime = match[1];
      }
    }

    // Strip data URI prefix if present
    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    // Validate size (max 10MB base64 ~ 13.3MB string)
    if (base64Data.length > 14 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Selected image exceeds the maximum size limit of 10MB. Please select a smaller photo." },
        { status: 400 }
      );
    }

    const promptText = typeof PROMPTS.PLANT_IDENTIFICATION === "function"
      ? PROMPTS.PLANT_IDENTIFICATION(language)
      : PROMPTS.PLANT_IDENTIFICATION;

    const rawResponse = await analyzeImageWithGemini(
      base64Data,
      detectedMime,
      promptText
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedData: any;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch {
      return NextResponse.json(
        { error: "Unable to parse AI response. Please upload a clearer plant photo." },
        { status: 500 }
      );
    }

    // If AI explicitly marked isPlant: false or confidence < 40%
    if (parsedData.isPlant === false || (typeof parsedData.confidence === "number" && parsedData.confidence < 40)) {
      return NextResponse.json({
        success: false,
        isPlant: false,
        error: parsedData.message || "Unable to confidently identify the plant. Please upload a clearer plant photo.",
        result: null,
      });
    }

    // Format fields cleanly
    const formattedResult = {
      name: parsedData.name || "Unknown Plant Species",
      scientificName: parsedData.scientificName || "N/A",
      confidence: parsedData.confidence || 92,
      family: parsedData.family || "N/A",
      description: parsedData.description || "No description available.",
      visibleCharacteristics: parsedData.visibleCharacteristics || "Leaf, stem, and flowering features.",
      recommendedCare: parsedData.recommendedCare || "Regular watering and proper sunlight.",
      commonDiseases: parsedData.commonDiseases || "None specified.",
      suitableSoil: parsedData.suitableSoil || parsedData.optimalSoil || "Well-drained soil.",
      waterRequirement: parsedData.waterRequirement || "Moderate watering.",
      sunlightRequirement: parsedData.sunlightRequirement || "Full sunlight.",
    };

    // Save scan to PostgreSQL database using Prisma safely
    try {
      let validUserId: string | null = null;
      if (activeUserId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: activeUserId },
          select: { id: true },
        });
        if (dbUser) validUserId = dbUser.id;
      }

      await prisma.plantScan.create({
        data: {
          userId: validUserId,
          imageUrl: image.length > 500000 ? image.slice(0, 500000) : image, // Truncate very large base64 if needed
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
          language: language,
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

    const isBusy =
      (error instanceof GeminiServiceError && (error.status === 503 || error.isBusy)) ||
      (error instanceof Error &&
        (error.message.includes("503") ||
          error.message.includes("high demand") ||
          error.message.includes("busy") ||
          error.message.includes("overloaded") ||
          error.message.includes("capacity")));

    if (isBusy) {
      return NextResponse.json(
        {
          success: false,
          isBusy: true,
          error:
            "Plant identification is temporarily unavailable. The AI service is currently busy. Please try again in a few moments.",
        },
        { status: 503 }
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

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const url = new URL(req.url);
    const userId = session?.user?.id || url.searchParams.get("userId");

    const scans = await prisma.plantScan.findMany({
      where: userId ? { userId } : undefined,
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

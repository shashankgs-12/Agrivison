import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchLiveWeather } from "@/lib/weather/api";
import { getCropLifecycleInfo } from "@/lib/crops/lifecycle";
import type { Crop } from "@/stores/crop-store";
import { SUPPORTED_LANGUAGES } from "@/lib/utils/constants";
import {
  AgronomyAdvisorInputError,
  generateAgronomyAdvice,
  getAdvisorErrorResponse,
  type AgronomyAdvisorType,
} from "@/lib/ai/agronomy-advisor";

export const maxDuration = 60;

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

    const body = payload as { type?: unknown; cropId?: unknown; language?: unknown };
    if (body.type !== "irrigation" && body.type !== "fertilizer") {
      return NextResponse.json({ error: "Choose an available advisor." }, { status: 400 });
    }
    if (typeof body.cropId !== "string" || !body.cropId.trim() || body.cropId.length > 100) {
      return NextResponse.json({ error: "Choose a valid crop." }, { status: 400 });
    }

    const cropRecord = await prisma.crop.findFirst({
      where: { id: body.cropId, farm: { ownerId: session.user.id } },
      include: { farm: true },
    });
    if (!cropRecord) {
      return NextResponse.json({ error: "The selected crop or its linked farm does not belong to this account.", fields: ["farmId"] }, { status: 400 });
    }
    if (cropRecord.farm.latitude === null || cropRecord.farm.longitude === null) {
      return NextResponse.json({ error: "Farm GPS coordinates are required for location-specific advice.", fields: ["farm.coordinates"] }, { status: 400 });
    }

    const crop = {
      id: cropRecord.id,
      farmId: String(cropRecord.farmId),
      farmName: cropRecord.farm.name,
      name: cropRecord.name,
      variety: cropRecord.variety ?? undefined,
      sowingDate: cropRecord.sowingDate,
      expectedHarvest: cropRecord.expectedHarvest ?? undefined,
      lifecycleType: cropRecord.lifecycleType as "ANNUAL" | "PERENNIAL",
      establishmentPeriodMonths: cropRecord.establishmentPeriodMonths ?? undefined,
      maturityPeriodMonths: cropRecord.maturityPeriodMonths ?? undefined,
      firstExpectedHarvest: cropRecord.firstExpectedHarvest ?? undefined,
      harvestIntervalMonths: cropRecord.harvestIntervalMonths ?? undefined,
      maintenanceSchedule: cropRecord.maintenanceSchedule as unknown as Crop["maintenanceSchedule"],
      growthStage: cropRecord.growthStage as Crop["growthStage"],
      area: cropRecord.area,
      waterNeed: cropRecord.waterNeed as Crop["waterNeed"],
      health: cropRecord.health as Crop["health"],
      diseaseStatus: cropRecord.diseaseStatus ?? undefined,
      createdAt: cropRecord.createdAt.toISOString(),
    } satisfies Crop;
    const lifecycle = getCropLifecycleInfo(crop);

    let liveWeather: Awaited<ReturnType<typeof fetchLiveWeather>> | null = null;
    try {
      const weather = await fetchLiveWeather(cropRecord.farm.latitude, cropRecord.farm.longitude);
      if (weather.source === "live") liveWeather = weather;
    } catch {
      // Keep the weather gap explicit; do not fall back to sample weather.
    }

    const missingInputs = [
      !crop.variety && "Crop variety has not been recorded.",
      !cropRecord.farm.soilType && "Farm soil type or a recent soil test has not been recorded.",
      !cropRecord.farm.waterSource && "Farm water source has not been recorded.",
      !liveWeather && "Live farm weather, humidity, and rainfall forecast are unavailable.",
      liveWeather && liveWeather.soilMoisture === null && "No soil-moisture estimate or field sensor reading is available.",
      "No irrigation application history is stored for this crop.",
      "No fertilizer application history is stored for this crop.",
      !crop.diseaseStatus && "No disease status or linked disease scan is stored for this crop.",
    ].filter((item): item is string => Boolean(item));

    const context = {
      crop: {
        id: crop.id, name: crop.name, variety: crop.variety ?? null,
        lifecycleType: crop.lifecycleType ?? "ANNUAL", plantingDate: crop.sowingDate,
        ageMonths: lifecycle.ageMonths, growthStage: cropRecord.growthStage,
        waterNeed: crop.waterNeed, areaAcres: crop.area,
      },
      farm: {
        name: cropRecord.farm.name, location: cropRecord.farm.location,
        latitude: cropRecord.farm.latitude, longitude: cropRecord.farm.longitude,
        soilType: cropRecord.farm.soilType, waterSource: cropRecord.farm.waterSource,
      },
      weather: liveWeather ? {
        temperatureC: liveWeather.temperature, humidityPercent: liveWeather.humidity,
        windKmh: liveWeather.windSpeed, rainfallProbabilityPercent: liveWeather.rainProbability,
        condition: liveWeather.condition, modelledSoilMoistureM3PerM3: liveWeather.soilMoisture,
        forecast: liveWeather.daily.slice(0, 7).map((day) => ({
          date: day.date, precipitationMm: day.precipitation, rainProbabilityPercent: day.rainProb,
        })),
      } : null,
      diseaseRecords: [],
      recordedDiseaseStatus: crop.diseaseStatus ?? null,
      soilTestAvailable: false,
      irrigationHistoryAvailable: false,
      fertilizerHistoryAvailable: false,
      missingInputs,
    };

    const language = SUPPORTED_LANGUAGES.some((item) => item.code === body.language)
      ? body.language as "en" | "kn" | "hi" | "te" | "ta" | "ml"
      : "en";
    const recommendation = await generateAgronomyAdvice(body.type as AgronomyAdvisorType, context, language);
    return NextResponse.json({
      success: true,
      recommendation: {
        ...recommendation,
        missingData: Array.from(new Set([...recommendation.missingData, ...missingInputs])).slice(0, 12),
      },
    });
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

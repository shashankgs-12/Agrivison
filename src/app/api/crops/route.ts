import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const cropSchema = z.object({
  farmId: z.string().regex(/^\d+$/),
  name: z.string().trim().min(1).max(120),
  variety: z.string().trim().max(120).optional(),
  sowingDate: z.string().date(),
  expectedHarvest: z.string().date().optional(),
  lifecycleType: z.enum(["ANNUAL", "PERENNIAL"]),
  establishmentPeriodMonths: z.number().int().positive().optional(),
  maturityPeriodMonths: z.number().int().positive().optional(),
  firstExpectedHarvest: z.string().date().optional(),
  harvestIntervalMonths: z.number().int().positive().optional(),
  maintenanceSchedule: z.object({
    irrigationCheckDays: z.number().int().nonnegative(), fertilizerReviewDays: z.number().int().nonnegative(),
    diseaseMonitoringDays: z.number().int().nonnegative(), pruningDays: z.number().int().nonnegative(),
    soilCareDays: z.number().int().nonnegative(),
  }).optional(),
  growthStage: z.enum(["Seedling", "Vegetative", "Flowering", "Fruiting", "Maturation", "Harvesting"]),
  area: z.number().finite().positive(),
  waterNeed: z.enum(["Low", "Medium", "High", "Critical"]),
  health: z.enum(["Excellent", "Good", "Fair", "Under Stress", "Diseased"]).optional(),
  diseaseStatus: z.string().trim().min(1).max(160).optional(),
});

function toClientCrop(crop: {
  id: string; farmId: number; name: string; variety: string | null; sowingDate: string;
  expectedHarvest: string | null; lifecycleType: string; establishmentPeriodMonths: number | null;
  maturityPeriodMonths: number | null; firstExpectedHarvest: string | null; harvestIntervalMonths: number | null;
  maintenanceSchedule: unknown; growthStage: string; area: number; waterNeed: string; health: string | null;
  diseaseStatus: string | null; createdAt: Date; farm: { ownerId: string | null; name: string; soilType: string | null };
}) {
  return {
    id: crop.id, farmId: String(crop.farmId), ownerId: crop.farm.ownerId ?? undefined,
    farmName: crop.farm.name, name: crop.name, variety: crop.variety ?? undefined,
    sowingDate: crop.sowingDate, expectedHarvest: crop.expectedHarvest ?? undefined,
    lifecycleType: crop.lifecycleType as "ANNUAL" | "PERENNIAL",
    establishmentPeriodMonths: crop.establishmentPeriodMonths ?? undefined,
    maturityPeriodMonths: crop.maturityPeriodMonths ?? undefined,
    firstExpectedHarvest: crop.firstExpectedHarvest ?? undefined,
    harvestIntervalMonths: crop.harvestIntervalMonths ?? undefined,
    maintenanceSchedule: crop.maintenanceSchedule as {
      irrigationCheckDays: number; fertilizerReviewDays: number; diseaseMonitoringDays: number;
      pruningDays: number; soilCareDays: number;
    } | undefined,
    growthStage: crop.growthStage as "Seedling" | "Vegetative" | "Flowering" | "Fruiting" | "Maturation" | "Harvesting",
    area: crop.area, waterNeed: crop.waterNeed as "Low" | "Medium" | "High" | "Critical",
    health: (crop.health as "Excellent" | "Good" | "Fair" | "Under Stress" | "Diseased" | null) ?? undefined,
    diseaseStatus: crop.diseaseStatus ?? undefined, soilType: crop.farm.soilType ?? undefined,
    createdAt: crop.createdAt.toISOString(),
  };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  try {
    const crops = await prisma.crop.findMany({
      where: { farm: { ownerId: userId } },
      include: { farm: { select: { ownerId: true, name: true, soilType: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ crops: crops.map(toClientCrop) });
  } catch (error) {
    console.error("Crop list failed:", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Crop records could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "A valid crop record is required." }, { status: 400 }); }
  const parsed = cropSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Complete the crop name, planting date, stage, area, water need, and farm.", fields: parsed.error.issues.map((issue) => issue.path.join(".")) }, { status: 400 });

  const farmId = Number(parsed.data.farmId);
  const farm = await prisma.farm.findFirst({ where: { id: farmId, ownerId: userId }, select: { id: true, area: true } });
  if (!farm) return NextResponse.json({ error: "The selected farm does not exist or does not belong to your account.", fields: ["farmId"] }, { status: 400 });
  if (parsed.data.area > farm.area) return NextResponse.json({ error: "Crop area cannot exceed the linked farm area.", fields: ["area"] }, { status: 400 });

  try {
    const crop = await prisma.crop.create({
      data: { ...parsed.data, farmId, variety: parsed.data.variety || null, health: parsed.data.health ?? null, diseaseStatus: parsed.data.diseaseStatus ?? null, maintenanceSchedule: parsed.data.maintenanceSchedule ?? undefined },
      include: { farm: { select: { ownerId: true, name: true, soilType: true } } },
    });
    return NextResponse.json({ crop: toClientCrop(crop) }, { status: 201 });
  } catch (error) {
    console.error("Crop save failed:", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Crop could not be saved." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateCentroid, calculateGeodesicArea, calculatePerimeter, toGeoJSONPolygon } from "@/lib/gis/geo-utils";

const pointSchema = z.tuple([
  z.number().finite().min(-90).max(90),
  z.number().finite().min(-180).max(180),
]);
const createFarmSchema = z.object({
  requestKey: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  location: z.string().trim().min(1).max(500),
  boundary: z.array(pointSchema).min(3).max(10000),
  soilType: z.string().trim().max(120).optional().nullable(),
  waterSource: z.string().trim().max(120).optional().nullable(),
  surveyMethod: z.enum(["manual", "live-gps"]),
});

function toClientFarm(farm: {
  id: number; ownerId: string | null; name: string; location: string;
  latitude: number | null; longitude: number | null; boundary: unknown;
  area: number; areaHectares: number | null; perimeterMeters: number | null;
  soilType: string | null; waterSource: string | null; surveyMethod: string | null;
  status: string; createdAt: Date; crops: Array<{ name: string }>;
}) {
  const geoJSON = farm.boundary as { type?: string; coordinates?: number[][][] } | null;
  const ring = geoJSON?.type === "Polygon" ? geoJSON.coordinates?.[0] : undefined;
  const boundary = ring?.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [];
  return {
    id: String(farm.id),
    ownerId: farm.ownerId ?? undefined,
    name: farm.name,
    location: farm.location,
    coordinates: farm.latitude !== null && farm.longitude !== null
      ? { lat: farm.latitude, lng: farm.longitude }
      : null,
    boundary,
    geoJSONBoundary: geoJSON,
    area: farm.area,
    areaHectares: farm.areaHectares,
    perimeterMeters: farm.perimeterMeters,
    soilType: farm.soilType ?? undefined,
    waterSource: farm.waterSource ?? undefined,
    surveyMethod: farm.surveyMethod ?? undefined,
    status: farm.status,
    crop: farm.crops[0]?.name,
    createdAt: farm.createdAt.toISOString(),
  };
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  try {
    const farms = await prisma.farm.findMany({
      where: { ownerId: userId },
      include: { crops: { select: { name: true }, orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ farms: farms.map(toClientFarm) });
  } catch (error) {
    console.error("Farm list failed:", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Farm records could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "A valid farm record is required." }, { status: 400 }); }
  const parsed = createFarmSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Complete the farm name, location, survey boundary, and survey method.", fields: parsed.error.issues.map((issue) => issue.path.join(".")) }, { status: 400 });
  }

  const existing = await prisma.farm.findUnique({ where: { requestKey: parsed.data.requestKey } });
  if (existing) {
    if (existing.ownerId !== userId) return NextResponse.json({ error: "This survey submission key is already in use." }, { status: 409 });
    return NextResponse.json({ farm: toClientFarm({ ...existing, crops: [] }) });
  }

  const points = parsed.data.boundary as [number, number][];
  const geoJSON = toGeoJSONPolygon(points);
  const area = calculateGeodesicArea(points);
  const perimeter = calculatePerimeter(points, true);
  const coordinates = calculateCentroid(points);
  if (!geoJSON || !Number.isFinite(area.acres) || area.acres <= 0 || perimeter.meters <= 0) {
    return NextResponse.json({ error: "The selected boundary must form a valid polygon with measurable area." }, { status: 400 });
  }

  try {
    const farm = await prisma.farm.create({
      data: {
        ownerId: userId,
        requestKey: parsed.data.requestKey,
        name: parsed.data.name,
        location: parsed.data.location,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        boundary: geoJSON,
        area: area.acres,
        areaHectares: area.hectares,
        perimeterMeters: perimeter.meters,
        soilType: parsed.data.soilType || null,
        waterSource: parsed.data.waterSource || null,
        surveyMethod: parsed.data.surveyMethod,
      },
      include: { crops: { select: { name: true }, take: 1 } },
    });
    return NextResponse.json({ farm: toClientFarm(farm) }, { status: 201 });
  } catch (error) {
    const record = error && typeof error === "object" ? error as Record<string, unknown> : {};
    if (record.code === "P2002") {
      const duplicate = await prisma.farm.findUnique({ where: { requestKey: parsed.data.requestKey }, include: { crops: { select: { name: true }, take: 1 } } });
      if (duplicate?.ownerId === userId) return NextResponse.json({ farm: toClientFarm(duplicate) });
    }
    console.error("Farm save failed:", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Farm survey could not be saved. Please retry." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { fetchLiveWeather } from "@/lib/weather/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    const lat = latParam === null ? 12.9716 : Number(latParam);
    const lng = lngParam === null ? 77.5946 : Number(lngParam);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return NextResponse.json(
        { error: "Latitude and longitude must be valid geographic coordinates." },
        { status: 400 }
      );
    }

    const weatherData = await fetchLiveWeather(lat, lng);
    return NextResponse.json({ success: true, weather: weatherData });
  } catch (error: unknown) {
    console.error("Weather API Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch live weather data." },
      { status: 500 }
    );
  }
}

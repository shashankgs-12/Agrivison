import { NextRequest, NextResponse } from "next/server";
import { fetchWeatherForLocation } from "@/lib/weather/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "12.5218");
    const lng = parseFloat(searchParams.get("lng") || "76.8951");

    const weatherData = await fetchWeatherForLocation(lat, lng);
    return NextResponse.json({ success: true, weather: weatherData });
  } catch (error: any) {
    console.error("Weather API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch weather." },
      { status: 500 }
    );
  }
}

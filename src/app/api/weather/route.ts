import { NextRequest, NextResponse } from "next/server";
import { fetchLiveWeather } from "@/lib/weather/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    const lat = latParam ? parseFloat(latParam) : 12.9716;
    const lng = lngParam ? parseFloat(lngParam) : 77.5946;

    const weatherData = await fetchLiveWeather(lat, lng);
    return NextResponse.json({ success: true, weather: weatherData });
  } catch (error: any) {
    console.error("Weather API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch live weather data." },
      { status: 500 }
    );
  }
}

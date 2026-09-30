import { NextResponse, type NextRequest } from "next/server";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2 || query.length > 160) {
    return NextResponse.json({ error: "Enter a location with at least 2 characters." }, { status: 400 });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "5");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url, {
      headers: { "User-Agent": "AgriVisionAI/2.0 (map location search)" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Location search is temporarily unavailable. Try again." }, { status: 502 });
    }

    const results = (await response.json()) as NominatimResult[];
    const seenLabels = new Set<string>();
    return NextResponse.json({
      results: results
        .filter((item) => {
          const lat = Number(item.lat);
          const lng = Number(item.lon);
          return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
        })
        .map((item) => ({
          lat: Number(item.lat),
          lng: Number(item.lon),
          label: item.display_name.trim(),
          type: item.type,
        }))
        .filter((item) => {
          const key = item.label.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ");
          if (seenLabels.has(key)) return false;
          seenLabels.add(key);
          return true;
        })
        .slice(0, 5),
    });
  } catch (error) {
    console.warn("Map location search failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Could not search for that location. Check your connection and retry." }, { status: 503 });
  }
}

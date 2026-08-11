/**
 * Production-grade GIS calculations for agricultural land mapping.
 */

// Earth radius in meters (WGS84 ellipsoid mean radius)
const EARTH_RADIUS = 6378137;

/**
 * Calculates geodesic area of a polygon using the Spherical Shoelace formula.
 * @param coords Array of [lat, lng] points defining the closed/unclosed polygon.
 * @returns Area object with acres, hectares, and square meters.
 */
export function calculateGeodesicArea(coords: [number, number][]): {
  acres: number;
  hectares: number;
  sqMeters: number;
} {
  if (!coords || coords.length < 3) {
    return { acres: 0, hectares: 0, sqMeters: 0 };
  }

  let areaSqMeters = 0;
  const numPoints = coords.length;

  for (let i = 0; i < numPoints; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % numPoints];

    const lat1 = (p1[0] * Math.PI) / 180;
    const lat2 = (p2[0] * Math.PI) / 180;
    const lon1 = (p1[1] * Math.PI) / 180;
    const lon2 = (p2[1] * Math.PI) / 180;

    areaSqMeters += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  areaSqMeters = Math.abs((areaSqMeters * EARTH_RADIUS * EARTH_RADIUS) / 2);

  const acres = Number((areaSqMeters / 4046.8564224).toFixed(2));
  const hectares = Number((areaSqMeters / 10000).toFixed(2));
  const sqMeters = Number(areaSqMeters.toFixed(1));

  return { acres, hectares, sqMeters };
}

/**
 * Calculates the Haversine distance between two coordinates in meters.
 */
export function calculateHaversineDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

/**
 * Calculates the total perimeter of a polyline/polygon in meters.
 * @param coords Array of [lat, lng] points.
 * @param isClosed Whether to include distance from last point back to first point.
 */
export function calculatePerimeter(
  coords: [number, number][],
  isClosed = true
): { meters: number; kilometers: number } {
  if (!coords || coords.length < 2) return { meters: 0, kilometers: 0 };

  let totalMeters = 0;
  const count = coords.length;

  for (let i = 0; i < count - 1; i++) {
    totalMeters += calculateHaversineDistance(coords[i], coords[i + 1]);
  }

  if (isClosed && count > 2) {
    totalMeters += calculateHaversineDistance(coords[count - 1], coords[0]);
  }

  const meters = Number(totalMeters.toFixed(1));
  const kilometers = Number((totalMeters / 1000).toFixed(2));

  return { meters, kilometers };
}

/**
 * Calculates the geographic centroid (center of mass) of a polygon or array of points.
 */
export function calculateCentroid(coords: [number, number][]): { lat: number; lng: number } {
  if (!coords || coords.length === 0) {
    return { lat: 12.9716, lng: 77.5946 };
  }

  let sumLat = 0;
  let sumLng = 0;

  coords.forEach(([lat, lng]) => {
    sumLat += lat;
    sumLng += lng;
  });

  return {
    lat: Number((sumLat / coords.length).toFixed(6)),
    lng: Number((sumLng / coords.length).toFixed(6)),
  };
}

/**
 * Formats a list of [lat, lng] pairs into standard GeoJSON Polygon geometry format.
 */
export function toGeoJSONPolygon(coords: [number, number][]) {
  if (coords.length < 3) return null;

  // GeoJSON uses [longitude, latitude] format
  const ring = coords.map(([lat, lng]) => [lng, lat]);

  // Ensure ring is closed
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]]);
  }

  return {
    type: "Polygon",
    coordinates: [ring],
  };
}

/**
 * Reverse geocodes lat, lng using OpenStreetMap Nominatim with fail-safe fallback.
 */
export async function reverseGeocodeAddress(
  lat: number,
  lng: number
): Promise<string> {
  const safeLat = typeof lat === "number" && !isNaN(lat) ? lat : 12.9716;
  const safeLng = typeof lng === "number" && !isNaN(lng) ? lng : 77.5946;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${safeLat}&lon=${safeLng}&format=json`,
      {
        headers: {
          "User-Agent": "AgriVisionAI/2.0 (Agricultural GIS Platform)",
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    }
  } catch (err) {
    console.warn("Reverse geocoding network error:", err);
  }

  return `${safeLat.toFixed(4)}°, ${safeLng.toFixed(4)}°`;
}

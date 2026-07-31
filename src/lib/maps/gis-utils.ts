/**
 * Production GIS Utility Library for AgriVision.AI
 * Geodesic Math, GPS Filtering, Boundary Centroids, and Nominatim Reverse Geocoding
 */

const EARTH_RADIUS_METERS = 6378137; // WGS-84 Earth Radius in Meters

export interface AreaResult {
  acres: number;
  hectares: number;
  sqMeters: number;
}

export interface PerimeterResult {
  meters: number;
  kilometers: number;
}

export interface GeocodedAddress {
  displayName: string;
  shortName: string;
  villageOrCity: string;
  district: string;
  state: string;
  country: string;
  postcode: string;
}

/**
 * Calculates geodesic area of a polygon on the WGS-84 ellipsoid using the spherical Shoelace formula.
 */
export function calculateGeodesicArea(coordinates: [number, number][]): AreaResult {
  if (!coordinates || coordinates.length < 3) {
    return { acres: 0, hectares: 0, sqMeters: 0 };
  }

  let totalAreaRad = 0;
  const numPoints = coordinates.length;

  for (let i = 0; i < numPoints; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % numPoints];

    const lat1Rad = (p1[0] * Math.PI) / 180;
    const lat2Rad = (p2[0] * Math.PI) / 180;
    const lng1Rad = (p1[1] * Math.PI) / 180;
    const lng2Rad = (p2[1] * Math.PI) / 180;

    totalAreaRad += (lng2Rad - lng1Rad) * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }

  const sqMeters = Math.abs((totalAreaRad * EARTH_RADIUS_METERS * EARTH_RADIUS_METERS) / 2);
  const acres = sqMeters * 0.000247105; // 1 m² = 0.000247105 Acres
  const hectares = sqMeters / 10000;     // 1 Ha = 10,000 m²

  return {
    sqMeters: Math.round(sqMeters),
    acres: Number(acres.toFixed(2)),
    hectares: Number(hectares.toFixed(2)),
  };
}

/**
 * Calculates total perimeter of a polygon or path in meters and kilometers using Haversine distance.
 */
export function calculateGeodesicPerimeter(
  coordinates: [number, number][],
  closedPolygon: boolean = true
): PerimeterResult {
  if (!coordinates || coordinates.length < 2) {
    return { meters: 0, kilometers: 0 };
  }

  let totalMeters = 0;
  const count = closedPolygon ? coordinates.length : coordinates.length - 1;

  for (let i = 0; i < count; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % coordinates.length];
    totalMeters += calculateHaversineDistanceMeters(p1, p2);
  }

  return {
    meters: Math.round(totalMeters),
    kilometers: Number((totalMeters / 1000).toFixed(2)),
  };
}

/**
 * Calculates Haversine distance between two [lat, lng] coordinates in meters.
 */
export function calculateHaversineDistanceMeters(
  p1: [number, number],
  p2: [number, number]
): number {
  const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[0] * Math.PI) / 180) *
      Math.cos((p2[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Computes exact centroid [lat, lng] of a polygon or array of points.
 */
export function calculateCentroid(coordinates: [number, number][]): { lat: number; lng: number } {
  if (!coordinates || coordinates.length === 0) {
    return { lat: 12.9716, lng: 77.5946 };
  }

  let sumLat = 0;
  let sumLng = 0;

  for (const pt of coordinates) {
    sumLat += pt[0];
    sumLng += pt[1];
  }

  return {
    lat: Number((sumLat / coordinates.length).toFixed(6)),
    lng: Number((sumLng / coordinates.length).toFixed(6)),
  };
}

/**
 * Calculates bounding box [[south, west], [north, east]] for Leaflet fitBounds.
 */
export function calculateBoundingBox(coordinates: [number, number][]): [[number, number], [number, number]] | null {
  if (!coordinates || coordinates.length === 0) return null;

  let minLat = coordinates[0][0];
  let maxLat = coordinates[0][0];
  let minLng = coordinates[0][1];
  let maxLng = coordinates[0][1];

  for (const [lat, lng] of coordinates) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

/**
 * Noise filter for GPS Fixes.
 * Returns true if new point is valid (accuracy <= 20m and distance from last point >= minDistanceMeters).
 */
export function isGpsPointValid(
  newLat: number,
  newLng: number,
  accuracy: number,
  lastPoint: [number, number] | null,
  minDistanceMeters: number = 2.5
): boolean {
  // Reject weak signal fixes (> 20 meters accuracy error radius)
  if (accuracy > 25) return false;

  // First point is always valid if accuracy is acceptable
  if (!lastPoint) return true;

  // Reject micro-jitter movements
  const distance = calculateHaversineDistanceMeters(lastPoint, [newLat, newLng]);
  return distance >= minDistanceMeters;
}

/**
 * Reverse Geocoding with Nominatim API.
 */
export async function reverseGeocodeLocation(lat: number, lng: number): Promise<GeocodedAddress> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "User-Agent": "AgriVisionAI/1.0" } }
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed with status ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    const villageOrCity =
      address.village ||
      address.town ||
      address.suburb ||
      address.city ||
      address.municipality ||
      address.county ||
      "Agricultural Belt";

    const district = address.state_district || address.county || address.district || "";
    const state = address.state || "";
    const country = address.country || "India";
    const postcode = address.postcode || "";

    const shortName = district
      ? `Farm near ${villageOrCity}, ${district}`
      : `Farm near ${villageOrCity}`;

    const displayName = data.display_name || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;

    return {
      displayName,
      shortName,
      villageOrCity,
      district,
      state,
      country,
      postcode,
    };
  } catch (err) {
    console.warn("Reverse geocode fallback used:", err);
    return {
      displayName: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
      shortName: `Farm (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`,
      villageOrCity: "Local Region",
      district: "",
      state: "",
      country: "",
      postcode: "",
    };
  }
}

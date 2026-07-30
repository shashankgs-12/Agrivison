/**
 * Earth radius in meters
 */
const EARTH_RADIUS = 6378137;

/**
 * Calculates geodesic area of a polygon using the Shoelace formula on a spherical earth
 * @param coordinates Array of [latitude, longitude] pairs
 * @returns Area in Acres
 */
export function calculatePolygonAreaInAcres(coordinates: [number, number][]): number {
  if (!coordinates || coordinates.length < 3) return 0;

  let totalAreaSquareMeters = 0;

  for (let i = 0; i < coordinates.length; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % coordinates.length];

    const lat1Rad = (p1[0] * Math.PI) / 180;
    const lat2Rad = (p2[0] * Math.PI) / 180;
    const lng1Rad = (p1[1] * Math.PI) / 180;
    const lng2Rad = (p2[1] * Math.PI) / 180;

    totalAreaSquareMeters +=
      (lng2Rad - lng1Rad) * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }

  totalAreaSquareMeters =
    (Math.abs(totalAreaSquareMeters) * EARTH_RADIUS * EARTH_RADIUS) / 2;

  // 1 Square Meter = 0.000247105 Acres
  const acres = totalAreaSquareMeters * 0.000247105;
  return Math.round(acres * 100) / 100;
}

/**
 * Calculates perimeter of a polygon in meters
 */
export function calculatePolygonPerimeterMeters(coordinates: [number, number][]): number {
  if (!coordinates || coordinates.length < 2) return 0;

  let totalMeters = 0;

  for (let i = 0; i < coordinates.length; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % coordinates.length];

    totalMeters += calculateHaversineDistanceMeters(p1, p2);
  }

  return Math.round(totalMeters);
}

/**
 * Haversine distance between two [lat, lng] points in meters
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
  return EARTH_RADIUS * c;
}

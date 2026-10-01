/** Farm records are loaded from the authenticated PostgreSQL API. */
export interface Farm {
  id: string;
  ownerId?: string;
  name: string;
  area: number;
  areaHectares?: number;
  perimeterMeters?: number;
  crop?: string;
  status: "Healthy" | "Alert Active" | "Optimal";
  location: string;
  soilType?: string;
  waterSource?: string;
  surveyMethod?: "manual" | "live-gps";
  geoJSONBoundary?: { type: "Polygon"; coordinates: number[][][] };
  coordinates: { lat: number; lng: number };
  boundary?: [number, number][];
  createdAt: string;
}

export interface Crop {
  id: string;
  farmId: string;
  name: Record<string, string>;
  scientificName?: string;
  variety?: string;
  sowingDate: string;
  expectedHarvest: string;
  growthStage: "germination" | "seedling" | "vegetative" | "flowering" | "fruiting" | "harvest";
}

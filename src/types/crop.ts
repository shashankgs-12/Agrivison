export interface Crop {
  id: string;
  farmId: string;
  name: Record<string, string>;
  scientificName?: string;
  variety?: string;
  sowingDate: string;
  expectedHarvest?: string;
  lifecycleType?: "ANNUAL" | "PERENNIAL";
  establishmentPeriodMonths?: number;
  maturityPeriodMonths?: number;
  firstExpectedHarvest?: string;
  harvestIntervalMonths?: number;
  maintenanceSchedule?: {
    irrigationCheckDays: number;
    fertilizerReviewDays: number;
    diseaseMonitoringDays: number;
    pruningDays: number;
    soilCareDays: number;
  };
  growthStage: "germination" | "seedling" | "vegetative" | "flowering" | "fruiting" | "harvest";
}

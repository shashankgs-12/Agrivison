/** Crop records are loaded from the authenticated PostgreSQL API. */
export interface Crop {
  id: string;
  ownerId?: string;
  farmId: string;
  farmName: string;
  name: string;
  variety?: string;
  sowingDate: string;
  expectedHarvest?: string;
  lifecycleType?: "ANNUAL" | "PERENNIAL";
  establishmentPeriodMonths?: number;
  maturityPeriodMonths?: number;
  firstExpectedHarvest?: string;
  harvestIntervalMonths?: number;
  maintenanceSchedule?: CropMaintenanceSchedule;
  growthStage: "Seedling" | "Vegetative" | "Flowering" | "Fruiting" | "Maturation" | "Harvesting";
  area: number;
  waterNeed: "Low" | "Medium" | "High" | "Critical";
  health?: "Excellent" | "Good" | "Fair" | "Under Stress" | "Diseased";
  diseaseStatus?: string;
  soilType?: string;
  createdAt: string;
}

export interface CropMaintenanceSchedule {
  irrigationCheckDays: number;
  fertilizerReviewDays: number;
  diseaseMonitoringDays: number;
  pruningDays: number;
  soilCareDays: number;
}

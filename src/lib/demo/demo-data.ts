import type { Farm } from "@/stores/farm-store";
import type { Crop } from "@/stores/crop-store";

export const DEMO_USER_ID = "agrivision-live-demo";

export function isDemoUserId(userId: string | null | undefined): boolean {
  return userId === DEMO_USER_ID;
}

const createdAt = "2026-11-14T08:00:00.000Z";
const center = { lat: 12.5218, lng: 76.8951 };

export const DEMO_FARMS: Farm[] = [
  {
    id: "demo-farm-1",
    name: "Mandya Paddy & Sugarcane Farm",
    location: "Mandya, Karnataka, India",
    coordinates: center,
    boundary: [
      [12.52123, 76.89449],
      [12.52123, 76.89571],
      [12.52237, 76.89571],
      [12.52237, 76.89449],
    ],
    area: 4,
    areaHectares: 1.62,
    perimeterMeters: 380,
    soilType: "Clay loam",
    waterSource: "Canal and farm pond",
    surveyMethod: "manual",
    status: "Healthy",
    crop: "Paddy and sugarcane",
    createdAt,
  },
];

export const DEMO_CROPS: Crop[] = [
  {
    id: "demo-paddy",
    farmId: DEMO_FARMS[0].id,
    farmName: DEMO_FARMS[0].name,
    name: "Paddy",
    variety: "Jyothi",
    sowingDate: "2026-09-10",
    expectedHarvest: "2027-01-05",
    lifecycleType: "ANNUAL",
    growthStage: "Vegetative",
    area: 2.5,
    waterNeed: "High",
    health: "Good",
    diseaseStatus: "Sample scan: no active disease detected",
    soilType: "Clay loam",
    createdAt,
  },
  {
    id: "demo-sugarcane",
    farmId: DEMO_FARMS[0].id,
    farmName: DEMO_FARMS[0].name,
    name: "Sugarcane",
    variety: "Co 86032",
    sowingDate: "2026-06-15",
    expectedHarvest: "2027-06-15",
    lifecycleType: "PERENNIAL",
    establishmentPeriodMonths: 3,
    maturityPeriodMonths: 12,
    firstExpectedHarvest: "2027-06-15",
    harvestIntervalMonths: 12,
    growthStage: "Vegetative",
    area: 1.5,
    waterNeed: "High",
    health: "Good",
    diseaseStatus: "Sample scan: no active disease detected",
    soilType: "Clay loam",
    createdAt,
  },
];

export const DEMO_IRRIGATION_RECOMMENDATION = {
  action: "INSUFFICIENT_DATA" as const,
  headline: "Check field moisture before irrigating",
  recommendation: "Walk both crop plots and check soil moisture near the root zone. Schedule irrigation only where the soil is drying and account for any recent rainfall.",
  why: "This read-only demo farm has no live soil sensor or irrigation log connected.",
  timing: "Review the field today and reassess after rainfall.",
  amountGuidance: "Use the locally recommended depth for the crop and soil; this demo does not provide a measured water dose.",
  missingData: ["No field sensor or irrigation history is connected in demo mode."],
};

export const DEMO_FERTILIZER_RECOMMENDATION = {
  nutrientFocus: "Review soil fertility before applying nutrients",
  recommendation: "Use a recent soil test to choose nutrient inputs for the paddy and sugarcane plots. Follow locally approved recommendations and the product label.",
  timing: "Plan a soil test before the next scheduled nutrient application.",
  applicationGuidance: "Do not apply fertilizer to saturated soil or immediately before heavy rain.",
  why: "No soil-test results or fertilizer application history are connected to this demo farm.",
  diseaseConsideration: "The demo scan history is illustrative and is not a verified crop diagnosis.",
  caution: "Confirm crop-specific rates with a local agronomist and the product label.",
  missingData: ["No current soil test or fertilizer history is available."],
};

import type { Crop, CropMaintenanceSchedule } from "@/stores/crop-store";

export type CropLifecycleType = "ANNUAL" | "PERENNIAL";

export const DEFAULT_CROP_MAINTENANCE: CropMaintenanceSchedule = {
  irrigationCheckDays: 7,
  fertilizerReviewDays: 90,
  diseaseMonitoringDays: 7,
  pruningDays: 180,
  soilCareDays: 30,
};

export function getCropMaintenanceDefaults(lifecycleType: CropLifecycleType): CropMaintenanceSchedule {
  return {
    ...DEFAULT_CROP_MAINTENANCE,
    pruningDays: lifecycleType === "PERENNIAL" ? 180 : 0,
  };
}

function dateAtMidnight(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatCropDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCropDateAfterDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatCropDate(date);
}

function addMonthsClamped(value: Date, months: number): Date {
  const result = new Date(value);
  const originalDay = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDayOfMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(originalDay, lastDayOfMonth));
  return result;
}

function monthsBetween(start: Date, end: Date): number {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
  if (end.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}

export interface CropLifecycleInfo {
  lifecycleType: CropLifecycleType;
  ageMonths: number;
  ageLabel: string;
  stage: string;
  progress: number;
  status: string;
  maturityDate: string | null;
  nextHarvestDate: string | null;
}

export function getCropLifecycleInfo(crop: Crop, now = new Date()): CropLifecycleInfo {
  const lifecycleType = crop.lifecycleType ?? "ANNUAL";
  const plantingDate = dateAtMidnight(crop.sowingDate);
  const ageMonths = plantingDate ? monthsBetween(plantingDate, now) : 0;
  const ageYears = Math.floor(ageMonths / 12);
  const remainingMonths = ageMonths % 12;
  const ageLabel = ageYears > 0
    ? `${ageYears} yr${ageYears === 1 ? "" : "s"}${remainingMonths ? ` ${remainingMonths} mo` : ""}`
    : `${ageMonths} month${ageMonths === 1 ? "" : "s"}`;

  if (lifecycleType === "PERENNIAL") {
    const establishmentMonths = Math.max(0, crop.establishmentPeriodMonths ?? 12);
    const maturityMonths = Math.max(establishmentMonths + 1, crop.maturityPeriodMonths ?? 36);
    const progress = Math.min(100, Math.round((ageMonths / maturityMonths) * 100));
    const stage = !plantingDate || plantingDate > now
      ? "Planned"
      : ageMonths < establishmentMonths
        ? "Establishment"
        : ageMonths < maturityMonths
          ? "Maturing"
          : "Mature · recurring production";
    const firstHarvest = crop.firstExpectedHarvest ? dateAtMidnight(crop.firstExpectedHarvest) : null;
    let nextHarvestDate: string | null = null;
    if (firstHarvest) {
      const intervalMonths = Math.max(1, crop.harvestIntervalMonths ?? 12);
      const next = new Date(firstHarvest);
      while (next < now) {
        const updated = addMonthsClamped(next, intervalMonths);
        next.setTime(updated.getTime());
      }
      nextHarvestDate = formatCropDate(next);
    }
    const maturityDate = plantingDate ? new Date(plantingDate) : null;
    if (maturityDate) {
      const updated = addMonthsClamped(maturityDate, maturityMonths);
      maturityDate.setTime(updated.getTime());
    }
    return {
      lifecycleType,
      ageMonths,
      ageLabel,
      stage,
      progress,
      status: "Active perennial",
      maturityDate: maturityDate ? formatCropDate(maturityDate) : null,
      nextHarvestDate,
    };
  }

  const harvestDate = dateAtMidnight(crop.expectedHarvest ?? "");
  const duration = plantingDate && harvestDate ? harvestDate.getTime() - plantingDate.getTime() : 0;
  const elapsed = plantingDate ? now.getTime() - plantingDate.getTime() : 0;
  const progress = duration > 0 ? Math.max(0, Math.min(100, Math.round((elapsed / duration) * 100))) : 0;
  const stage = !plantingDate || plantingDate > now
    ? "Planned"
    : progress < 15 ? "Seedling"
      : progress < 55 ? "Vegetative"
        : progress < 75 ? "Flowering"
          : progress < 92 ? "Fruiting"
            : "Harvest window";

  return {
    lifecycleType,
    ageMonths,
    ageLabel,
    stage,
    progress,
    status: "Active seasonal crop",
    maturityDate: crop.expectedHarvest || null,
    nextHarvestDate: crop.expectedHarvest || null,
  };
}

export interface CropCareReminder {
  activity: string;
  recommendation: string;
  nextDue: string;
}

function nextIntervalDate(start: Date, intervalDays: number, now: Date): Date {
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
  const elapsedMs = Math.max(0, now.getTime() - start.getTime());
  const intervalsElapsed = Math.ceil(elapsedMs / intervalMs);
  return new Date(start.getTime() + intervalsElapsed * intervalMs);
}

export function getCropCareReminders(crop: Crop, now = new Date()): CropCareReminder[] {
  const planted = dateAtMidnight(crop.sowingDate);
  if (!planted || planted > now) return [];
  const schedule = { ...getCropMaintenanceDefaults(crop.lifecycleType ?? "ANNUAL"), ...crop.maintenanceSchedule };
  const reminders: Array<{ activity: string; recommendation: string; days: number }> = [
    { activity: "Irrigation check", recommendation: "Check soil moisture and adjust irrigation to the crop and current weather.", days: schedule.irrigationCheckDays },
    { activity: "Nutrient review", recommendation: "Review crop nutrition and use soil-test guidance before applying fertilizer.", days: schedule.fertilizerReviewDays },
    { activity: "Disease monitoring", recommendation: "Inspect leaves, stems, and fruit for early signs of pests or disease.", days: schedule.diseaseMonitoringDays },
    { activity: "Soil care", recommendation: "Check weeds, mulch, drainage, and soil cover around the crop.", days: schedule.soilCareDays },
  ];

  if ((crop.lifecycleType ?? "ANNUAL") === "PERENNIAL" && schedule.pruningDays > 0) {
    reminders.push({ activity: "Pruning review", recommendation: "Review canopy health and prune only when appropriate for the crop and season.", days: schedule.pruningDays });
  }

  const results = reminders
    .filter((item) => Number.isFinite(item.days) && item.days > 0)
    .map((item) => ({
      activity: item.activity,
      recommendation: item.recommendation,
      nextDue: formatCropDate(nextIntervalDate(planted, item.days, now)),
    }));

  if ((crop.lifecycleType ?? "ANNUAL") === "PERENNIAL" && crop.firstExpectedHarvest && crop.harvestIntervalMonths) {
    const firstHarvest = dateAtMidnight(crop.firstExpectedHarvest);
    if (firstHarvest) {
      const nextHarvest = new Date(firstHarvest);
      const interval = Math.max(1, crop.harvestIntervalMonths);
      while (nextHarvest < now) {
        const updated = addMonthsClamped(nextHarvest, interval);
        nextHarvest.setTime(updated.getTime());
      }
      results.push({
        activity: "Harvest cycle",
        recommendation: "Plan harvest checks around the expected crop season and maturity signs.",
        nextDue: formatCropDate(nextHarvest),
      });
    }
  } else if ((crop.lifecycleType ?? "ANNUAL") === "ANNUAL" && crop.expectedHarvest) {
    results.push({ activity: "Harvest window", recommendation: "Check crop maturity and local harvest conditions.", nextDue: crop.expectedHarvest });
  }

  return results.sort((a, b) => a.nextDue.localeCompare(b.nextDue));
}

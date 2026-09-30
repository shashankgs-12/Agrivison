"use client";

import type { CropMaintenanceSchedule } from "@/stores/crop-store";
import { getCropMaintenanceDefaults, type CropLifecycleType } from "@/lib/crops/lifecycle";

export interface CropLifecycleFormValues {
  lifecycleType: CropLifecycleType;
  expectedHarvest: string;
  establishmentPeriodMonths: number;
  maturityPeriodMonths: number;
  firstExpectedHarvest: string;
  harvestIntervalMonths: number;
  maintenanceSchedule: CropMaintenanceSchedule;
}

const inputClass = "mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

export function CropLifecycleFields({
  value,
  onChange,
}: {
  value: CropLifecycleFormValues;
  onChange: (patch: Partial<CropLifecycleFormValues>) => void;
}) {
  const setMaintenance = (key: keyof CropMaintenanceSchedule, days: number) => {
    onChange({ maintenanceSchedule: { ...value.maintenanceSchedule, [key]: days } });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-slate-700 dark:text-slate-300">Crop lifecycle</label>
        <select
          value={value.lifecycleType}
          onChange={(event) => {
            const lifecycleType = event.target.value as CropLifecycleType;
            onChange({ lifecycleType, maintenanceSchedule: { ...getCropMaintenanceDefaults(lifecycleType), ...value.maintenanceSchedule, pruningDays: lifecycleType === "PERENNIAL" ? (value.maintenanceSchedule.pruningDays || 180) : 0 } });
          }}
          className={inputClass}
        >
          <option value="ANNUAL">Annual / short-duration</option>
          <option value="PERENNIAL">Perennial / long-duration</option>
        </select>
      </div>

      {value.lifecycleType === "ANNUAL" ? (
        <div>
          <label className="block text-slate-700 dark:text-slate-300">Expected harvest date</label>
          <input type="date" required value={value.expectedHarvest} onChange={(event) => onChange({ expectedHarvest: event.target.value })} className={inputClass} />
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">Perennial crops remain active after maturity. Set periods that fit this crop variety and your local growing conditions.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300">Establishment period (months)</label>
              <input type="number" min="0" max="240" value={value.establishmentPeriodMonths} onChange={(event) => onChange({ establishmentPeriodMonths: Number(event.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300">Maturity period (months)</label>
              <input type="number" min="1" max="600" value={value.maturityPeriodMonths} onChange={(event) => onChange({ maturityPeriodMonths: Number(event.target.value) })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300">First expected harvest (optional)</label>
              <input type="date" value={value.firstExpectedHarvest} onChange={(event) => onChange({ firstExpectedHarvest: event.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300">Recurring harvest every (months)</label>
              <input type="number" min="1" max="120" value={value.harvestIntervalMonths} onChange={(event) => onChange({ harvestIntervalMonths: Number(event.target.value) })} className={inputClass} />
            </div>
          </div>
        </div>
      )}

      <details className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <summary className="cursor-pointer select-none text-xs font-bold text-slate-700 dark:text-slate-200">Recurring care reminder intervals</summary>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <IntervalField label="Irrigation check (days)" value={value.maintenanceSchedule.irrigationCheckDays} onChange={(days) => setMaintenance("irrigationCheckDays", days)} />
          <IntervalField label="Nutrient review (days)" value={value.maintenanceSchedule.fertilizerReviewDays} onChange={(days) => setMaintenance("fertilizerReviewDays", days)} />
          <IntervalField label="Disease monitoring (days)" value={value.maintenanceSchedule.diseaseMonitoringDays} onChange={(days) => setMaintenance("diseaseMonitoringDays", days)} />
          <IntervalField label="Soil care (days)" value={value.maintenanceSchedule.soilCareDays} onChange={(days) => setMaintenance("soilCareDays", days)} />
          {value.lifecycleType === "PERENNIAL" && <IntervalField label="Pruning review (days)" value={value.maintenanceSchedule.pruningDays} onChange={(days) => setMaintenance("pruningDays", days)} />}
        </div>
      </details>
    </div>
  );
}

function IntervalField({ label, value, onChange }: { label: string; value: number; onChange: (days: number) => void }) {
  return (
    <label className="text-[11px] text-slate-600 dark:text-slate-300">
      {label}
      <input type="number" min="1" max="3650" value={value || ""} onChange={(event) => onChange(Number(event.target.value))} className={inputClass} />
    </label>
  );
}

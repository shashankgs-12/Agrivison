"use client";

import React from "react";
import { Droplets, CheckCircle, ShieldAlert, Plus, MapPin, Sprout } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFarms } from "@/hooks/use-farms";
import { useCrops } from "@/hooks/use-crops";
import { useWeatherStore } from "@/stores/weather-store";
import { useAuthStore } from "@/stores/auth-store";

export function IrrigationAdvice() {
  const { user } = useAuthStore();
  const { farms } = useFarms();
  const { crops } = useCrops();
  const { weather } = useWeatherStore();

  // 1. NO FARMS EXIST
  if (farms.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Droplets className="h-5 w-5 text-blue-600" />
          Smart Irrigation Advisor
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No farms found. Add a farm before using Smart Irrigation Advisor.
        </p>
        <Link href="/farms/add" className="inline-block pt-1">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
            <Plus className="h-4 w-4 mr-1" /> + Add Farm
          </Button>
        </Link>
      </div>
    );
  }

  // 2. FARMS EXIST BUT NO CROPS REGISTERED
  if (crops.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Droplets className="h-5 w-5 text-blue-600" />
          Smart Irrigation Advisor
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No crops registered. Register a crop to receive irrigation recommendations.
        </p>
        <Link href="/crops" className="inline-block pt-1">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
            <Plus className="h-4 w-4 mr-1" /> + Add Crop
          </Button>
        </Link>
      </div>
    );
  }

  // 3. CROPS EXIST -> Calculate real dynamic recommendation
  const rainProb = weather?.rainProbability ?? 20;
  const soilMoisture = weather?.soilMoisture ?? 45;

  const isRainyOrMoist = rainProb >= 40 || soilMoisture >= 65;
  const totalArea = crops.reduce((acc, c) => acc + (c.area || 1), 0);
  const waterSavedLiters = isRainyOrMoist ? Math.round(totalArea * 4200) : Math.round(totalArea * 1200);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Irrigation Advisor
            </h3>
          </div>
          <Link href="/irrigation" className="text-xs text-blue-600 font-bold hover:underline">
            View Advisor →
          </Link>
        </div>

        <div
          className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold ${
            isRainyOrMoist
              ? "bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300"
              : "bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300"
          }`}
        >
          {isRainyOrMoist ? (
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
          )}
          <div>
            <p className="font-bold">
              {isRainyOrMoist ? "Do Not Irrigate Today" : "Morning Irrigation Advised"}
            </p>
            <p className="text-[11px] opacity-90 mt-0.5">
              {isRainyOrMoist
                ? `Rain prob ${rainProb}% with soil moisture at ${soilMoisture}%.`
                : `Soil moisture at ${soilMoisture}%. Drip schedule recommended.`}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 pb-1">
          <span>Registered Fields</span>
          <span className="text-blue-600">~{waterSavedLiters.toLocaleString()} L Saved</span>
        </div>

        {crops.slice(0, 3).map((crop) => (
          <div
            key={crop.id}
            className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
          >
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">{crop.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">Stage: {crop.growthStage}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {isRainyOrMoist ? "No Action" : "Drip 20m"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

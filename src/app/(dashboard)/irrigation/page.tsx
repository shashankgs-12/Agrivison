"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Droplets,
  CloudRain,
  Sun,
  Wind,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Sprout,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFarms } from "@/hooks/use-farms";
import { useCrops } from "@/hooks/use-crops";
import { useAuthStore } from "@/stores/auth-store";
import { useWeatherStore } from "@/stores/weather-store";

export default function IrrigationPage() {
  const { user } = useAuthStore();
  const { farms } = useFarms();
  const { crops } = useCrops();

  const { weather, loading: weatherLoading, detectGPSAndFetch } = useWeatherStore();

  useEffect(() => {
    if (!weather) {
      detectGPSAndFetch();
    }
  }, []);

  // 1. NO FARMS EXIST
  if (farms.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
              <Droplets className="h-7 w-7 text-blue-600" />
              Smart Irrigation Advisor
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI-driven precision water management and weather-guided scheduling
            </p>
          </div>
        </div>

        {/* Empty State: No Farms */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-md dark:bg-slate-900 dark:border-slate-800 space-y-5">
          <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto dark:bg-blue-950/50 dark:text-blue-400">
            <MapPin className="h-10 w-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No farms found.
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Please add a farm before using Smart Irrigation Advisor.
            </p>
          </div>
          <Link href="/farms/add">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8">
              <Plus className="h-5 w-5 mr-2" />
              + Add Farm
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2. FARMS EXIST BUT NO CROPS REGISTERED
  if (crops.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
              <Droplets className="h-7 w-7 text-blue-600" />
              Smart Irrigation Advisor
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI-driven precision water management and weather-guided scheduling
            </p>
          </div>
        </div>

        {/* Empty State: No Crops */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-md dark:bg-slate-900 dark:border-slate-800 space-y-5">
          <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto dark:bg-emerald-950/50 dark:text-emerald-400">
            <Sprout className="h-10 w-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No crops registered.
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Register a crop to receive irrigation recommendations.
            </p>
          </div>
          <Link href="/crops">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8">
              <Plus className="h-5 w-5 mr-2" />
              + Add Crop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. CROPS EXIST -> Calculate Real Dynamic Irrigation Advice using Live Weather
  const currentTemp = weather?.temperature ?? 28;
  const currentHumidity = weather?.humidity ?? 60;
  const rainProb = weather?.rainProbability ?? 20;
  const soilMoisture = weather?.soilMoisture ?? 45;

  // Calculate dynamic water savings across registered crop acreage
  const totalArea = crops.reduce((sum, c) => sum + (c.area || 1), 0);
  const isRainyOrMoist = rainProb >= 40 || soilMoisture >= 65;
  const waterSavedLiters = isRainyOrMoist ? Math.round(totalArea * 4200) : Math.round(totalArea * 1200);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
            <Droplets className="h-7 w-7 text-blue-600" />
            Smart Irrigation Advisor
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live weather-driven soil moisture and crop water recommendations
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => detectGPSAndFetch()} disabled={weatherLoading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${weatherLoading ? "animate-spin" : ""}`} />
          Refresh Weather
        </Button>
      </div>

      {/* Main Advisory Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge className={isRainyOrMoist ? "bg-emerald-500 text-white font-bold" : "bg-amber-500 text-white font-bold"}>
                {isRainyOrMoist ? "DO NOT IRRIGATE TODAY" : "IRRIGATION RECOMMENDED"}
              </Badge>
              <span className="text-xs text-blue-200 font-semibold">
                📍 {weather?.locationName || "GPS Location"}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {isRainyOrMoist
                ? `High Rain Risk (${rainProb}%) & Soil Saturation (${soilMoisture}%)`
                : `Soil Moisture Low (${soilMoisture}%) & High Evaporation (${currentTemp}°C)`}
            </h2>
            <p className="text-xs text-blue-100 leading-relaxed font-medium">
              {isRainyOrMoist
                ? `Natural rainfall expected today. Postponing irrigation will prevent root rot and save approximately ${waterSavedLiters.toLocaleString()} Liters of water.`
                : `Calculated soil moisture is below optimal threshold. Schedule morning drip irrigation for registered crops.`}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center min-w-[160px]">
            <span className="text-3xl font-black text-emerald-300">
              {waterSavedLiters.toLocaleString()} L
            </span>
            <p className="text-[10px] text-blue-100 font-bold uppercase mt-0.5">Calculated Water Saved</p>
          </div>
        </div>
      </div>

      {/* Weather Parameters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Droplets className="h-3.5 w-3.5 text-blue-500" /> Soil Moisture
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1 dark:text-white">{soilMoisture}%</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <CloudRain className="h-3.5 w-3.5 text-indigo-500" /> Rain Probability
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1 dark:text-white">{rainProb}%</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Sun className="h-3.5 w-3.5 text-amber-500" /> Air Temperature
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1 dark:text-white">{currentTemp}°C</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Wind className="h-3.5 w-3.5 text-teal-500" /> Relative Humidity
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1 dark:text-white">{currentHumidity}%</p>
        </div>
      </div>

      {/* Field / Crop Specific Cards from Database ONLY */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sprout className="h-5 w-5 text-emerald-600" />
          Registered Crops Irrigation Status ({crops.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crops.map((crop) => {
            const cropFarm = farms.find((f) => f.id === crop.farmId);

            // Compute dynamic requirement per crop based on crop stage & weather
            const isHighNeedStage = ["Flowering", "Fruiting"].includes(crop.growthStage);
            const cropIrrigateNeeded = !isRainyOrMoist && (isHighNeedStage || soilMoisture < 50);

            return (
              <div
                key={crop.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {crop.name} {crop.variety ? `(${crop.variety})` : ""}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Farm: <span className="font-semibold text-slate-700 dark:text-slate-300">{crop.farmName || cropFarm?.name || "Registered Farm"}</span> • {crop.area} Acres
                    </p>
                  </div>
                  <Badge className={cropIrrigateNeeded ? "bg-amber-500 text-white font-bold" : "bg-emerald-600 text-white font-bold"}>
                    {cropIrrigateNeeded ? "Needs Water" : "Optimal Moisture"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-800">
                    <span className="text-slate-400 font-medium">Growth Stage</span>
                    <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{crop.growthStage}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-800">
                    <span className="text-slate-400 font-medium">Water Requirement</span>
                    <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{crop.waterNeed}</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-950 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-200 font-medium">
                  {cropIrrigateNeeded
                    ? `Apply 25 mm drip irrigation tomorrow morning during ${crop.growthStage} stage.`
                    : `Soil moisture levels for ${crop.name} are currently adequate.`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import {
  Cloud,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Locate,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useWeatherStore } from "@/stores/weather-store";
import Link from "next/link";

export function WeatherWidget() {
  const { weather, loading, detectGPSAndFetch } = useWeatherStore();

  useEffect(() => {
    if (!weather) {
      detectGPSAndFetch();
    }
  }, []);

  const temp = weather?.temperature ?? 26;
  const condition = weather?.condition ?? "Partly Cloudy";
  const humidity = weather?.humidity ?? 60;
  const wind = weather?.windSpeed ?? 12;
  const rainProb = weather?.rainProbability ?? 20;
  const locationName = weather?.locationName ?? "Detecting GPS...";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-green-700 p-5 text-white relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
            <MapPin className="h-3.5 w-3.5 text-amber-300" />
            <span className="truncate max-w-[180px]">{locationName}</span>
          </div>

          <button
            onClick={() => detectGPSAndFetch()}
            disabled={loading}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white transition-all"
            title="Refresh Live Weather"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Updating..." : "Live Weather"}</span>
          </button>
        </div>

        <div className="flex items-end gap-2 mt-2">
          <span className="text-4xl font-extrabold leading-none">{temp}°</span>
          <span className="text-sm text-emerald-100 pb-1">C</span>
        </div>
        <p className="text-xs font-bold text-emerald-100 mt-1 uppercase tracking-wider">
          {condition}
        </p>
      </div>

      {/* Weather Stats Grid */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
        <div className="p-3 text-center">
          <Droplets className="h-4 w-4 mx-auto text-blue-500 mb-1" />
          <p className="text-[10px] text-slate-400 font-medium">Humidity</p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{humidity}%</p>
        </div>
        <div className="p-3 text-center">
          <Wind className="h-4 w-4 mx-auto text-teal-500 mb-1" />
          <p className="text-[10px] text-slate-400 font-medium">Wind</p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{wind} km/h</p>
        </div>
        <div className="p-3 text-center">
          <CloudRain className="h-4 w-4 mx-auto text-indigo-500 mb-1" />
          <p className="text-[10px] text-slate-400 font-medium">Rain Risk</p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{rainProb}%</p>
        </div>
      </div>

      {/* Dynamic Agricultural Advisory Link */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600 dark:text-slate-400">
          Soil Temp: {weather?.soilTemp ?? 24}°C
        </span>
        <Link href="/weather" className="font-bold text-emerald-600 hover:underline">
          Full 7-Day Forecast →
        </Link>
      </div>
    </div>
  );
}

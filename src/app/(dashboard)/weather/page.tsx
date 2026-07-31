"use client";

import React, { useEffect } from "react";
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Locate,
  MapPin,
  RefreshCw,
  Eye,
  Thermometer,
} from "lucide-react";
import { useWeatherStore } from "@/stores/weather-store";
import { Button } from "@/components/ui/button";

export default function WeatherPage() {
  const { weather, loading, error, detectGPSAndFetch } = useWeatherStore();

  useEffect(() => {
    if (!weather) {
      detectGPSAndFetch();
    }
  }, []);

  const locationName = weather?.locationName ?? "Live GPS Location";
  const temp = weather?.temperature ?? 26;
  const feelsLike = weather?.feelsLike ?? temp;
  const condition = weather?.condition ?? "Partly Cloudy";
  const humidity = weather?.humidity ?? 60;
  const windSpeed = weather?.windSpeed ?? 12;
  const rainProb = weather?.rainProbability ?? 20;
  const soilMoisture = weather?.soilMoisture ?? 45;
  const soilTemp = weather?.soilTemp ?? 24;
  const uvIndex = weather?.uvIndex ?? 5;
  const sunrise = weather?.sunrise ?? "06:00 AM";
  const sunset = weather?.sunset ?? "06:30 PM";

  const dailyForecast = weather?.daily || [];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
            <CloudSun className="h-7 w-7 text-emerald-600" />
            Hyperlocal Weather & Agricultural Intelligence
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Open-Meteo live weather API & soil moisture monitoring for {locationName}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => detectGPSAndFetch()}
          disabled={loading}
          className="font-bold border-slate-300"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Updating Weather..." : "Refresh Live GPS Weather"}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300">
          ⚠️ {error}
        </div>
      )}

      {/* Main Weather Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-4 bottom-0 opacity-15 pointer-events-none">
          <CloudSun className="h-64 w-64" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-black/20 backdrop-blur-md px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-amber-300" />
            Live GPS Coordinates · {locationName}
          </span>

          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-black tracking-tight">{temp}°C</span>
            <div>
              <p className="text-xl font-bold text-emerald-100">{condition}</p>
              <p className="text-xs text-emerald-200">Feels like {feelsLike}°C</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/20 text-xs">
            <div>
              <p className="text-emerald-200 font-semibold">Humidity</p>
              <p className="text-xl font-bold">{humidity}%</p>
            </div>
            <div>
              <p className="text-emerald-200 font-semibold">Wind Speed</p>
              <p className="text-xl font-bold">{windSpeed} km/h</p>
            </div>
            <div>
              <p className="text-emerald-200 font-semibold">Rain Risk</p>
              <p className="text-xl font-bold">{rainProb}%</p>
            </div>
            <div>
              <p className="text-emerald-200 font-semibold">Soil Moisture</p>
              <p className="text-xl font-bold">{soilMoisture}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agricultural Advice Cards */}
      {weather?.agriculturalAdvice && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-blue-600 flex items-center gap-1.5">
              <Droplets className="h-4 w-4" /> Irrigation Advice
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {weather.agriculturalAdvice.irrigationReason}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-teal-600 flex items-center gap-1.5">
              <Wind className="h-4 w-4" /> Spraying Recommendation
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {weather.agriculturalAdvice.sprayingReason}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase text-amber-600 flex items-center gap-1.5">
              <Sun className="h-4 w-4" /> Harvesting Condition
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Condition rating: <strong>{weather.agriculturalAdvice.harvestingCondition}</strong> based on humidity ({humidity}%) and rain risk ({rainProb}%).
            </p>
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sun className="h-5 w-5 text-amber-500" />
          7-Day Hyperlocal Forecast
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {dailyForecast.map((day, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-1"
            >
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{day.dayName}</p>
              <CloudSun className="h-7 w-7 text-emerald-600 mx-auto my-1" />
              <p className="text-xs font-black text-slate-900 dark:text-white">
                {day.maxTemp}° / {day.minTemp}°
              </p>
              <p className="text-[11px] text-blue-600 font-bold dark:text-blue-400">💧 {day.rainProb}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

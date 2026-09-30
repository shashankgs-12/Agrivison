"use client";

import React, { useState } from "react";
import { Layers, Map as StreetMap, Satellite, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useFarms } from "@/hooks/use-farms";
import { useWeatherStore } from "@/stores/weather-store";
import type { MapMode } from "@/components/maps/gis-map-engine";
import { useLanguage } from "@/hooks/use-language";
import { getDashboardText } from "@/lib/i18n/localization";

const GISMapEngine = dynamic(() => import("@/components/maps/gis-map-engine"), {
  ssr: false,
  loading: () => <MapLoadingState />,
});

function MapLoadingState() {
  const { language } = useLanguage();
  const copy = getDashboardText(language);
  return (
    <div className="h-[22rem] sm:h-[26rem] xl:h-[30rem] w-full bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-bold animate-pulse">
      {copy.mapLoading}
    </div>
  );
}

export function LeafletFarmMap() {
  const { farms } = useFarms();
  const { weather, updateLocation } = useWeatherStore();
  const { language } = useLanguage();
  const copy = getDashboardText(language);
  const [mapMode, setMapMode] = useState<MapMode>("hybrid");

  const centerLat = weather?.latitude || (farms.length > 0 ? farms[0].coordinates.lat : 12.9716);
  const centerLng = weather?.longitude || (farms.length > 0 ? farms[0].coordinates.lng : 77.5946);

  const farmMarkers = farms.map((f) => ({
    id: f.id,
    name: f.name,
    lat: f.coordinates.lat,
    lng: f.coordinates.lng,
    area: f.area,
    status: f.status,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-3.5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {copy.mapTitle}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              📍 {weather?.locationName || copy.selectedLocation} · {copy.satelliteHint}
            </p>
          </div>
        </div>

        <div role="group" aria-label="Map style" className="grid w-full grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950/60 sm:w-auto">
          <button
            type="button"
            aria-pressed={mapMode === "street"}
            title="Street map with roads and place names"
            onClick={() => setMapMode("street")}
            className={`flex min-h-10 items-center justify-center gap-1 rounded-lg px-2.5 text-xs font-bold transition-colors ${
              mapMode === "street"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <StreetMap className="h-3.5 w-3.5" /> {copy.street}
          </button>
          <button
            type="button"
            aria-pressed={mapMode === "satellite"}
            title="Satellite imagery with place names"
            onClick={() => setMapMode("satellite")}
            className={`flex min-h-10 items-center justify-center gap-1 rounded-lg px-2.5 text-xs font-bold transition-colors ${
              mapMode === "satellite"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <Satellite className="h-3.5 w-3.5 text-amber-300" /> {copy.satellite}
          </button>
          <button
            type="button"
            aria-pressed={mapMode === "hybrid"}
            title="Satellite imagery with roads and place names"
            onClick={() => setMapMode("hybrid")}
            className={`flex min-h-10 items-center justify-center gap-1 rounded-lg px-2.5 text-xs font-bold transition-colors ${
              mapMode === "hybrid"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> {copy.hybrid}
          </button>
        </div>
      </div>

      <div className="relative h-[22rem] sm:h-[26rem] xl:h-[30rem] w-full">
        <GISMapEngine
          center={{ lat: centerLat, lng: centerLng }}
          zoom={13}
          mapMode={mapMode}
          showControls={false}
          isReadOnly={true}
          farmMarkers={farmMarkers}
          onLocationSelect={({ lat, lng, label }) => updateLocation(lat, lng, label)}
          height="h-full"
        />
      </div>
    </div>
  );
}

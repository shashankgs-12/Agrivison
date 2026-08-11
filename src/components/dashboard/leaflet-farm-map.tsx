"use client";

import React, { useState } from "react";
import { Layers, Satellite, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useFarms } from "@/hooks/use-farms";
import { useWeatherStore } from "@/stores/weather-store";
import type { MapMode } from "@/components/maps/gis-map-engine";

const GISMapEngine = dynamic(() => import("@/components/maps/gis-map-engine"), {
  ssr: false,
  loading: () => (
    <div className="h-72 md:h-96 w-full bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-bold animate-pulse">
      Loading GIS Map Engine...
    </div>
  ),
});

export function LeafletFarmMap() {
  const { farms } = useFarms();
  const { weather } = useWeatherStore();
  const [mapMode, setMapMode] = useState<MapMode>("satellite");

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
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Registered Farms Map (View Only)
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              📍 {weather?.locationName || "GPS Location"} · View registered land boundaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMapMode("street")}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              mapMode === "street"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <Layers className="h-3 w-3" /> Map
          </button>
          <button
            onClick={() => setMapMode("satellite")}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              mapMode === "satellite"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <Satellite className="h-3 w-3 text-amber-300" /> Satellite
          </button>
        </div>
      </div>

      <div className="relative h-72 md:h-96 w-full">
        <GISMapEngine
          center={{ lat: centerLat, lng: centerLng }}
          zoom={13}
          mapMode={mapMode}
          showControls={false}
          isReadOnly={true}
          farmMarkers={farmMarkers}
          height="h-full"
        />
      </div>
    </div>
  );
}

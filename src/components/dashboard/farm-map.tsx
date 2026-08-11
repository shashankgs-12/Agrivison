"use client";

import React, { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useFarms } from "@/hooks/use-farms";
import { useWeatherStore } from "@/stores/weather-store";

const GISMapEngine = dynamic(() => import("@/components/maps/gis-map-engine"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-bold animate-pulse">
      Loading GIS Map Engine...
    </div>
  ),
});

export function FarmMap() {
  const { farms } = useFarms();
  const { weather } = useWeatherStore();
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId);

  const centerLat = selectedFarm
    ? selectedFarm.coordinates.lat
    : weather?.latitude || (farms.length > 0 ? farms[0].coordinates.lat : 12.9716);
  const centerLng = selectedFarm
    ? selectedFarm.coordinates.lng
    : weather?.longitude || (farms.length > 0 ? farms[0].coordinates.lng : 77.5946);

  const farmMarkers = farms.map((f) => ({
    id: f.id,
    name: f.name,
    lat: f.coordinates.lat,
    lng: f.coordinates.lng,
    area: f.area,
    status: f.status,
  }));

  const activeBoundary = selectedFarm?.boundary || farms.find((f) => f.boundary && f.boundary.length >= 3)?.boundary;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Farm Land & Boundary Overview ({farms.length} Registered)
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              View-only map · Click + Add Farm to map new land
            </p>
          </div>
        </div>
        <Link href="/farms/add">
          <span className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-all">
            <Plus className="h-3.5 w-3.5" /> + Add Farm
          </span>
        </Link>
      </div>

      <GISMapEngine
        center={{ lat: centerLat, lng: centerLng }}
        zoom={14}
        mapMode="satellite"
        showControls={true}
        isReadOnly={true}
        farmMarkers={farmMarkers}
        polygonPoints={activeBoundary}
        onMarkerClick={(id) => setSelectedFarmId(id)}
        height="h-[350px]"
      />
    </div>
  );
}

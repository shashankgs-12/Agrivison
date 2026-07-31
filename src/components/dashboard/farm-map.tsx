"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFarms } from "@/hooks/use-farms";
import { useAuthStore } from "@/stores/auth-store";

const InteractiveFarmMap = dynamic(() => import("@/components/maps/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] w-full bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-500 font-bold dark:bg-slate-800 animate-pulse">
      Loading Live GPS Map...
    </div>
  ),
});

export function FarmMap() {
  const { user } = useAuthStore();
  const { farms } = useFarms();

  const farmMarkers = farms.map((f) => ({
    id: f.id,
    name: f.name,
    lat: f.coordinates.lat,
    lng: f.coordinates.lng,
    area: f.area,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Farm Map & Boundary Overview ({farms.length} Farms)
          </h3>
        </div>
        <Link href="/farms/add">
          <span className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Add Farm
          </span>
        </Link>
      </div>

      <InteractiveFarmMap farmMarkers={farmMarkers} interactive={false} />
    </div>
  );
}

"use client";

import React, { use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, MapPin, Sprout, Droplets, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFarms } from "@/hooks/use-farms";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

const InteractiveFarmMap = dynamic(() => import("@/components/maps/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-500 font-bold dark:bg-slate-800 animate-pulse">
      Loading GPS Boundary Map...
    </div>
  ),
});

export default function FarmDetailsPage({ params }: { params: Promise<{ farmId: string }> | { farmId: string } }) {
  const router = useRouter();
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { user } = useAuthStore();
  const { farms, deleteFarm } = useFarms();

  const farm = farms.find((f) => f.id === resolvedParams.farmId);

  if (!farm) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto text-center py-12">
        <MapPin className="h-12 w-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Farm Not Found</h2>
        <p className="text-xs text-slate-500">The farm requested does not exist or has been deleted.</p>
        <Link href="/farms">
          <Button className="bg-emerald-600 text-white font-bold">Back to Farms</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    deleteFarm(farm.id);
    router.push("/farms");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/farms">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
                {farm.name}
              </h1>
              <Badge className="bg-emerald-600 text-white font-bold">{farm.status}</Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              📍 {farm.location} • {farm.area} Acres
            </p>
          </div>
        </div>

        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete Farm
        </Button>
      </div>

      {/* Interactive GPS Map */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600" /> GPS Map & Location Coordinates
        </h3>
        <InteractiveFarmMap
          initialLat={farm.coordinates?.lat || 12.9716}
          initialLng={farm.coordinates?.lng || 77.5946}
          farmMarkers={[{ id: farm.id, name: farm.name, lat: farm.coordinates?.lat || 12.9716, lng: farm.coordinates?.lng || 77.5946, area: farm.area }]}
          interactive={false}
        />
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Area</span>
          <p className="text-base font-bold text-slate-900 mt-1 dark:text-white">{farm.area} Acres</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Soil Type</span>
          <p className="text-base font-bold text-slate-900 mt-1 dark:text-white">{farm.soilType || "Loamy Soil"}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Water Source</span>
          <p className="text-base font-bold text-slate-900 mt-1 dark:text-white">{farm.waterSource || "Borewell"}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Primary Crop</span>
          <p className="text-base font-bold text-slate-900 mt-1 dark:text-white">{farm.crop || "Registered Crops"}</p>
        </div>
      </div>
    </div>
  );
}

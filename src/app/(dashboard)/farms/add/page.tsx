"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  MapPin,
  Save,
  Footprints,
  PenTool,
  Locate,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFarmStore } from "@/stores/farm-store";
import { useAuthStore } from "@/stores/auth-store";

const InteractiveFarmMap = dynamic(() => import("@/components/maps/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-500 font-bold dark:bg-slate-800 animate-pulse">
      Initializing Interactive GPS Map...
    </div>
  ),
});

export default function AddFarmPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const addFarm = useFarmStore((state) => state.addFarm);

  const [farmName, setFarmName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [soilType, setSoilType] = useState("Loamy Soil");
  const [waterSource, setWaterSource] = useState("Borewell");
  const [areaAcres, setAreaAcres] = useState<number>(5.0);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });

  const handleLocationSelect = (data: { lat: number; lng: number; address: string }) => {
    setCoordinates({ lat: data.lat, lng: data.lng });
    setLocationAddress(data.address);
  };

  const handleSaveFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) return;

    addFarm({
      ownerId: user?.uid,
      name: farmName,
      area: areaAcres || 5.0,
      location: locationAddress || `${coordinates.lat.toFixed(3)}°, ${coordinates.lng.toFixed(3)}°`,
      status: "Healthy",
      soilType,
      waterSource,
      coordinates,
    });

    router.push("/farms");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/farms">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Farms
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
            <MapPin className="h-6 w-6 text-emerald-600" />
            Add New Farm Land
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Click on map to drop pin or draw boundary polygon for reverse geocoding
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Locate className="h-4 w-4 text-emerald-600" />
                Select Farm Location & Draw Polygon Boundary
              </h3>
            </div>

            <InteractiveFarmMap
              interactive={true}
              onLocationSelect={handleLocationSelect}
              onAreaCalculated={(acres) => setAreaAcres(acres > 0 ? acres : 5.0)}
            />
          </div>
        </div>

        {/* Form Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
            Farm Metadata
          </h3>

          <form onSubmit={handleSaveFarm} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Farm Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunrise Organic Plantation"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">
                Reverse Geocoded Location
              </label>
              <input
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="Click on map to auto-fill address"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-[11px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Soil Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <option value="Loamy Soil">Loamy Soil</option>
                  <option value="Black Cotton Soil">Black Cotton Soil</option>
                  <option value="Red Soil">Red Soil</option>
                  <option value="Clay Soil">Clay Soil</option>
                  <option value="Sandy Soil">Sandy Soil</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Water Source</label>
              <select
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                <option value="Borewell">Borewell</option>
                <option value="Canal">Canal</option>
                <option value="River">River</option>
                <option value="Rain-fed">Rain-fed</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Farm to Database
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

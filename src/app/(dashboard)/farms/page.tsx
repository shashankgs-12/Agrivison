"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  MapPin,
  LayoutGrid,
  Search,
  Trash2,
  Locate,
  Ruler,
  Layers,
  Sparkles,
  CloudSun,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFarms } from "@/hooks/use-farms";
import { useAuthStore } from "@/stores/auth-store";
import { useWeatherStore } from "@/stores/weather-store";

const GISMapEngine = dynamic(() => import("@/components/maps/gis-map-engine"), {
  ssr: false,
  loading: () => (
    <div className="h-[460px] w-full bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-bold animate-pulse">
      Loading GIS Map Engine...
    </div>
  ),
});

export default function FarmsPage() {
  const { user } = useAuthStore();
  const { farms, deleteFarm } = useFarms();
  const { weather, updateLocation } = useWeatherStore();

  const [view, setView] = useState<"grid" | "map">("grid");
  const [search, setSearch] = useState("");
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  const filteredFarms = farms.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.crop && f.crop.toLowerCase().includes(search.toLowerCase())) ||
      f.location.toLowerCase().includes(search.toLowerCase())
  );

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];

  const mapCenterLat = selectedFarm
    ? selectedFarm.coordinates.lat
    : weather?.latitude || 12.9716;
  const mapCenterLng = selectedFarm
    ? selectedFarm.coordinates.lng
    : weather?.longitude || 77.5946;

  const farmMarkers = farms.map((f) => ({
    id: f.id,
    name: f.name,
    lat: f.coordinates.lat,
    lng: f.coordinates.lng,
    area: f.area,
    status: f.status,
  }));

  const activeBoundary = selectedFarm?.boundary;

  const handleSelectFarm = (farm: { id: string; coordinates: { lat: number; lng: number }; location: string }) => {
    setSelectedFarmId(farm.id);
    setView("map");
    updateLocation(farm.coordinates.lat, farm.coordinates.lng, farm.location);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
            <MapPin className="h-7 w-7 text-emerald-600" />
            My Registered Farm Lands
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Registered GeoJSON land boundaries ({farms.length} Farms registered)
          </p>
        </div>
        <Link href="/farms/add">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md">
            <Plus className="h-4 w-4 mr-1" />
            + Add New Farm
          </Button>
        </Link>
      </div>

      {/* Search & View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search farm name, location, or crop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-slate-100 rounded-xl p-1 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setView("grid")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === "grid"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <LayoutGrid className="h-4 w-4 inline mr-1" /> Grid View
            </button>
            <button
              onClick={() => setView("map")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === "map"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <Locate className="h-4 w-4 inline mr-1" /> Interactive GIS Map
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Read-Only Map View */}
      {view === "map" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2 rounded-xl text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              Viewing: {selectedFarm?.name || "Select a farm marker"}
            </span>
            <span className="text-[11px] text-slate-300">
              📐 {selectedFarm?.area || 0} Acres • {selectedFarm?.location || ""}
            </span>
          </div>

          <GISMapEngine
            center={{ lat: mapCenterLat, lng: mapCenterLng }}
            zoom={15}
            mapMode="satellite"
            showControls={true}
            isReadOnly={true}
            farmMarkers={farmMarkers}
            polygonPoints={activeBoundary}
            onMarkerClick={(id) => {
              setSelectedFarmId(id);
              const f = farms.find((item) => item.id === id);
              if (f) updateLocation(f.coordinates.lat, f.coordinates.lng, f.location);
            }}
            height="h-[460px]"
          />
        </div>
      )}

      {/* Empty State */}
      {farms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-md dark:bg-slate-900 dark:border-slate-800 space-y-5">
          <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto dark:bg-emerald-950/50 dark:text-emerald-400">
            <MapPin className="h-10 w-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No Farm Lands Registered Yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Register your land boundary using live GPS field walk or manual polygon plotting.
            </p>
          </div>
          <Link href="/farms/add">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8">
              <Plus className="h-5 w-5 mr-2" />
              + Add Your First Farm
            </Button>
          </Link>
        </div>
      ) : (
        view !== "map" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFarms.map((farm) => {
              const isAlert = farm.status === "Alert Active";
              const hasBoundary = farm.boundary && farm.boundary.length >= 3;

              return (
                <div
                  key={farm.id}
                  onClick={() => handleSelectFarm(farm)}
                  className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer dark:bg-slate-900 flex flex-col justify-between space-y-4 group ${
                    isAlert ? "border-rose-300 dark:border-rose-900" : "border-slate-200/80 dark:border-slate-800 hover:border-emerald-500"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {farm.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                          📍 {farm.location}
                        </p>
                      </div>
                      <Badge className={isAlert ? "bg-rose-500 text-white font-bold text-[10px]" : "bg-emerald-600 text-white font-bold text-[10px]"}>
                        {farm.status}
                      </Badge>
                    </div>

                    {/* Farm Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 bg-slate-50 rounded-xl dark:bg-slate-800/80">
                        <span className="text-slate-400 font-medium text-[10px] uppercase">Land Area</span>
                        <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">
                          {farm.area} Acres
                        </p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl dark:bg-slate-800/80">
                        <span className="text-slate-400 font-medium text-[10px] uppercase">Boundary Status</span>
                        <p className="font-bold text-emerald-600 mt-0.5 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                          {hasBoundary ? "GeoJSON Mapped" : "Point Pin"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between dark:border-slate-800 text-xs font-semibold">
                    <span className="text-slate-500">
                      {farm.crop ? `🌾 ${farm.crop}` : "No crop assigned"}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-600 hover:underline">
                        Zoom to Farm →
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFarm(farm.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete farm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

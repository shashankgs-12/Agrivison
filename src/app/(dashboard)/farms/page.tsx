"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Plus,
  MapPin,
  LayoutGrid,
  List,
  Search,
  Trash2,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Locate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFarms } from "@/hooks/use-farms";
import { useAuthStore } from "@/stores/auth-store";

const InteractiveFarmMap = dynamic(() => import("@/components/maps/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-500 font-bold dark:bg-slate-800 animate-pulse">
      Loading Live GPS Map...
    </div>
  ),
});

export default function FarmsPage() {
  const { user } = useAuthStore();
  const { farms, deleteFarm } = useFarms();

  const [view, setView] = useState<"grid" | "list" | "map">("grid");
  const [search, setSearch] = useState("");

  const filteredFarms = farms.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.crop && f.crop.toLowerCase().includes(search.toLowerCase())) ||
      f.location.toLowerCase().includes(search.toLowerCase())
  );

  const farmMarkers = farms.map((f) => ({
    id: f.id,
    name: f.name,
    lat: f.coordinates.lat,
    lng: f.coordinates.lng,
    area: f.area,
  }));

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
            <MapPin className="h-7 w-7 text-emerald-600" />
            My Registered Farms
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            GPS mapped land boundaries for authenticated user ({farms.length} Farms registered)
          </p>
        </div>
        <Link href="/farms/add">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
            <Plus className="h-4 w-4 mr-1" />
            + Add New Farm
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search farm name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-slate-100 rounded-xl p-1 dark:bg-slate-800">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === "grid" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white" : "text-slate-500"
              }`}
            >
              <LayoutGrid className="h-4 w-4 inline mr-1" /> Grid
            </button>
            <button
              onClick={() => setView("map")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === "map" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white" : "text-slate-500"
              }`}
            >
              <Locate className="h-4 w-4 inline mr-1" /> Map View
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map View */}
      {view === "map" && (
        <div className="space-y-2">
          <InteractiveFarmMap farmMarkers={farmMarkers} interactive={false} />
        </div>
      )}

      {/* Zero Farms Empty State */}
      {farms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-md dark:bg-slate-900 dark:border-slate-800 space-y-5">
          <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto dark:bg-emerald-950/50 dark:text-emerald-400">
            <MapPin className="h-10 w-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No Farm Lands Registered
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You currently have 0 farms added to your account. Click below to map your first farm boundary using GPS.
            </p>
          </div>
          <Link href="/farms/add">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8">
              <Plus className="h-5 w-5 mr-2" />
              + Add Your First Farm
            </Button>
          </Link>
        </div>
      ) : view !== "map" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFarms.map((farm) => {
            const isAlert = farm.status === "Alert Active";

            return (
              <div
                key={farm.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all dark:bg-slate-900 flex flex-col justify-between space-y-4 ${
                  isAlert ? "border-rose-300 dark:border-rose-900" : "border-slate-200/80 dark:border-slate-800"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {farm.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        📍 {farm.location}
                      </p>
                    </div>
                    <Badge className={isAlert ? "bg-rose-500 text-white font-bold" : "bg-emerald-600 text-white font-bold"}>
                      {farm.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-800">
                      <span className="text-slate-400 font-medium">Area</span>
                      <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{farm.area} Acres</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-800">
                      <span className="text-slate-400 font-medium">Soil Type</span>
                      <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{farm.soilType || "Loamy"}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500">
                    {farm.crop ? `🌾 ${farm.crop}` : "No crop assigned"}
                  </span>
                  <button
                    onClick={() => deleteFarm(farm.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete farm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

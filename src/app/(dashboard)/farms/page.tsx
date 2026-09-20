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
  Sprout,
  X,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFarms } from "@/hooks/use-farms";
import { useCrops } from "@/hooks/use-crops";
import { useAuthStore } from "@/stores/auth-store";
import { useWeatherStore } from "@/stores/weather-store";
import { useFarmStore, Farm } from "@/stores/farm-store";
import { Crop } from "@/stores/crop-store";

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
  const { crops, addCrop } = useCrops();
  const updateFarm = useFarmStore((state) => state.updateFarm);
  const { weather, updateLocation } = useWeatherStore();

  const [view, setView] = useState<"grid" | "map">("grid");
  const [search, setSearch] = useState("");
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  // Quick Add Plant Modal State
  const [plantModalFarm, setPlantModalFarm] = useState<Farm | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    variety: "",
    sowingDate: new Date().toISOString().split("T")[0],
    expectedHarvest: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    growthStage: "Seedling" as Crop["growthStage"],
    area: 2,
    waterNeed: "Medium" as Crop["waterNeed"],
    health: "Excellent" as Crop["health"],
    diseaseStatus: "Healthy",
  });

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

  const handleOpenAddPlant = (e: React.MouseEvent, farm: Farm) => {
    e.stopPropagation();
    setPlantModalFarm(farm);
    setFormData((prev) => ({ ...prev, area: Math.min(farm.area, 5) }));
  };

  const handleCreatePlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantModalFarm || !formData.name.trim()) return;

    addCrop({
      ownerId: user?.uid,
      farmId: plantModalFarm.id,
      farmName: plantModalFarm.name,
      name: formData.name.trim(),
      variety: formData.variety.trim(),
      sowingDate: formData.sowingDate,
      expectedHarvest: formData.expectedHarvest,
      growthStage: formData.growthStage,
      area: Number(formData.area),
      waterNeed: formData.waterNeed,
      health: formData.health,
      diseaseStatus: formData.diseaseStatus,
    });

    updateFarm(plantModalFarm.id, { crop: formData.name.trim() });

    setSuccessMsg(`Plant "${formData.name}" added to ${plantModalFarm.name}!`);
    setTimeout(() => setSuccessMsg(null), 4000);
    setPlantModalFarm(null);
    setFormData({
      name: "",
      variety: "",
      sowingDate: new Date().toISOString().split("T")[0],
      expectedHarvest: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      growthStage: "Seedling",
      area: 2,
      waterNeed: "Medium",
      health: "Excellent",
      diseaseStatus: "Healthy",
    });
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
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md cursor-pointer">
            <Plus className="h-4 w-4 mr-1" />
            + Add New Farm
          </Button>
        </Link>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                view === "grid"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <LayoutGrid className="h-4 w-4 inline mr-1" /> Grid View
            </button>
            <button
              onClick={() => setView("map")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 cursor-pointer">
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
              const farmCropsList = crops.filter((c) => c.farmId === farm.id);

              return (
                <div
                  key={farm.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all dark:bg-slate-900 flex flex-col justify-between space-y-4 group ${
                    isAlert ? "border-rose-300 dark:border-rose-900" : "border-slate-200/80 dark:border-slate-800 hover:border-emerald-500"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/farms/${farm.id}`} className="hover:underline">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                            {farm.name}
                          </h3>
                        </Link>
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
                        <span className="text-slate-400 font-medium text-[10px] uppercase">Plants Registered</span>
                        <p className="font-bold text-emerald-600 mt-0.5 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                          🌱 {farmCropsList.length} Plant(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Add Plant & Details Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                        {farm.crop ? `🌾 ${farm.crop}` : "No crop assigned"}
                      </span>

                      <Button
                        onClick={(e) => handleOpenAddPlant(e, farm)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-1 px-2.5 h-7 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> + Add Plant
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <Link
                        href={`/farms/${farm.id}`}
                        className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        View Farm Details & Plants <ArrowRight className="h-3 w-3" />
                      </Link>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFarm(farm.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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

      {/* Add Plant to Specific Farm Modal */}
      {plantModalFarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-emerald-600" />
                  Add Plant to {plantModalFarm.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Register a plant directly into this farm land
                </p>
              </div>
              <button
                onClick={() => setPlantModalFarm(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlant} className="space-y-4 text-xs font-semibold">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  Target Farm: <strong>{plantModalFarm.name}</strong> ({plantModalFarm.area} Acres)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Plant / Crop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paddy, Wheat, Tomato"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Variety (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sona Masuri, Hybrid"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Sowing Date</label>
                  <input
                    type="date"
                    required
                    value={formData.sowingDate}
                    onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Expected Harvest</label>
                  <input
                    type="date"
                    required
                    value={formData.expectedHarvest}
                    onChange={(e) => setFormData({ ...formData, expectedHarvest: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Growth Stage</label>
                  <select
                    value={formData.growthStage}
                    onChange={(e) => setFormData({ ...formData, growthStage: e.target.value as Crop["growthStage"] })}
                    className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="Seedling">Seedling</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruiting">Fruiting</option>
                    <option value="Maturation">Maturation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    max={plantModalFarm.area}
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Water Need</label>
                  <select
                    value={formData.waterNeed}
                    onChange={(e) => setFormData({ ...formData, waterNeed: e.target.value as Crop["waterNeed"] })}
                    className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPlantModalFarm(null)}
                  className="flex-1 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Save Plant to Farm
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


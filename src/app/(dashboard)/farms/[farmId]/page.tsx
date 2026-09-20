"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, MapPin, Sprout, Droplets, Trash2, Plus, X, Calendar, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFarms } from "@/hooks/use-farms";
import { useCrops } from "@/hooks/use-crops";
import { useAuthStore } from "@/stores/auth-store";
import { useFarmStore } from "@/stores/farm-store";
import { Crop } from "@/stores/crop-store";
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
  const updateFarm = useFarmStore((state) => state.updateFarm);

  const farm = farms.find((f) => f.id === resolvedParams.farmId);
  const { crops: farmCrops, addCrop, deleteCrop } = useCrops(farm?.id);

  const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State for Adding Plant to Farm
  const [formData, setFormData] = useState(() => ({
    name: "",
    variety: "",
    sowingDate: new Date().toISOString().split("T")[0],
    expectedHarvest: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    growthStage: "Seedling" as Crop["growthStage"],
    area: farm ? Math.min(farm.area, 5) : 2,
    waterNeed: "Medium" as Crop["waterNeed"],
    health: "Excellent" as Crop["health"],
    diseaseStatus: "Healthy",
  }));

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

  const handleAddPlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addCrop({
      ownerId: user?.uid,
      farmId: farm.id,
      farmName: farm.name,
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

    // Update primary crop on farm
    updateFarm(farm.id, { crop: formData.name.trim() });

    setIsAddPlantModalOpen(false);
    setSuccessMsg(`Plant "${formData.name}" added successfully to ${farm.name}!`);
    setTimeout(() => setSuccessMsg(null), 4000);

    setFormData({
      name: "",
      variety: "",
      sowingDate: new Date().toISOString().split("T")[0],
      expectedHarvest: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      growthStage: "Seedling",
      area: Math.min(farm.area, 5),
      waterNeed: "Medium",
      health: "Excellent",
      diseaseStatus: "Healthy",
    });
  };

  const calculateProgress = (sowingDateStr: string, harvestDateStr: string): number => {
    try {
      const sowing = new Date(sowingDateStr).getTime();
      const harvest = new Date(harvestDateStr).getTime();
      const now = new Date().getTime();

      if (now <= sowing) return 0;
      if (now >= harvest) return 100;

      const totalDuration = harvest - sowing;
      const elapsed = now - sowing;

      return Math.min(100, Math.max(1, Math.round((elapsed / totalDuration) * 100)));
    } catch {
      return 45;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddPlantModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            + Add Plant to Farm
          </Button>

          <Button variant="destructive" size="sm" onClick={handleDelete} className="cursor-pointer">
            <Trash2 className="h-4 w-4 mr-1" /> Delete Farm
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

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
          <span className="text-[10px] text-slate-400 uppercase font-bold">Registered Plants</span>
          <p className="text-base font-bold text-emerald-600 mt-1 dark:text-emerald-400">{farmCrops.length} Plant(s)</p>
        </div>
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

      {/* Registered Plants / Crops in this Farm Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sprout className="h-6 w-6 text-emerald-600" />
              Plants & Crops in {farm.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage cultivated crops, growth stages, and water requirements for this specific land
            </p>
          </div>
          <Button
            onClick={() => setIsAddPlantModalOpen(true)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1" />
            + Add Plant to {farm.name}
          </Button>
        </div>

        {farmCrops.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
            <Sprout className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Plants Registered in {farm.name} Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto dark:text-slate-400">
              Add your first plant or crop to this farm to track growth progress, harvest schedules, and disease alerts.
            </p>
            <Button
              onClick={() => setIsAddPlantModalOpen(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Plant Now
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farmCrops.map((crop) => {
              const progress = calculateProgress(crop.sowingDate, crop.expectedHarvest);

              return (
                <div
                  key={crop.id}
                  className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-3 dark:bg-slate-800/80 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        🌾 {crop.name} {crop.variety ? `(${crop.variety})` : ""}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Planted: {crop.sowingDate} • Harvest: {crop.expectedHarvest}
                      </p>
                    </div>
                    <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                      {crop.health}
                    </Badge>
                  </div>

                  {/* Growth Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">Growth Stage: {crop.growthStage}</span>
                      <span className="text-emerald-600 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden dark:bg-slate-700">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 bg-white rounded-lg dark:bg-slate-900/60">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Allocated Area</span>
                      <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{crop.area} Acres</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg dark:bg-slate-900/60">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Water Need</span>
                      <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{crop.waterNeed}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <Link
                      href="/disease-detection"
                      className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" /> Scan Plant Health
                    </Link>
                    <button
                      onClick={() => deleteCrop(crop.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete plant"
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

      {/* Add Plant Modal */}
      {isAddPlantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-emerald-600" />
                  Add Plant to {farm.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Register a new plant or crop directly for this farm
                </p>
              </div>
              <button
                onClick={() => setIsAddPlantModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPlant} className="space-y-4 text-xs font-semibold">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  Farm Target: <strong>{farm.name}</strong> ({farm.area} Acres)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Plant / Crop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paddy, Wheat, Cotton"
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
                    max={farm.area}
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
                  onClick={() => setIsAddPlantModalOpen(false)}
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


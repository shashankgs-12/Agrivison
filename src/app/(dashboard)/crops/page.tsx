"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sprout,
  Plus,
  Calendar,
  MapPin,
  Droplets,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCrops } from "@/hooks/use-crops";
import { useFarms } from "@/hooks/use-farms";
import { useAuthStore } from "@/stores/auth-store";
import { Crop } from "@/stores/crop-store";

export default function CropsPage() {
  const { user } = useAuthStore();
  const { crops, addCrop, deleteCrop } = useCrops();
  const { farms } = useFarms();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    variety: "",
    farmId: "",
    sowingDate: new Date().toISOString().split("T")[0],
    expectedHarvest: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    growthStage: "Seedling" as Crop["growthStage"],
    area: 5,
    waterNeed: "Medium" as Crop["waterNeed"],
    health: "Excellent" as Crop["health"],
    diseaseStatus: "Healthy",
  });

  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.farmId) return;

    const selectedFarm = farms.find((f) => f.id === formData.farmId);

    addCrop({
      ownerId: user?.uid,
      farmId: formData.farmId,
      farmName: selectedFarm ? selectedFarm.name : "My Farm",
      name: formData.name,
      variety: formData.variety,
      sowingDate: formData.sowingDate,
      expectedHarvest: formData.expectedHarvest,
      growthStage: formData.growthStage,
      area: Number(formData.area),
      waterNeed: formData.waterNeed,
      health: formData.health,
      diseaseStatus: formData.diseaseStatus,
    });

    setIsAddModalOpen(false);
    setFormData({
      name: "",
      variety: "",
      farmId: "",
      sowingDate: new Date().toISOString().split("T")[0],
      expectedHarvest: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      growthStage: "Seedling",
      area: 5,
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
    } catch (e) {
      return 45;
    }
  };

  const filteredCrops = crops.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.farmName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
            <Sprout className="h-7 w-7 text-emerald-600" />
            Crop Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track growth stages, health, harvest dates, and field history
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
        >
          <Plus className="h-5 w-5 mr-1" />
          Register Crop
        </Button>
      </div>

      {/* Zero Crops Empty State */}
      {crops.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-md dark:bg-slate-900 dark:border-slate-800 space-y-5">
          <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto dark:bg-emerald-950/50 dark:text-emerald-400">
            <Sprout className="h-10 w-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No Crops Registered
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Start by adding your first crop to track growth cycles, water needs, and AI recommendations.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8"
          >
            <Plus className="h-5 w-5 mr-2" />
            + Add First Crop
          </Button>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filter crops by name or farm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 px-4 text-sm bg-white border border-slate-200 rounded-xl w-full max-w-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
            />
          </div>

          {/* Crop Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCrops.map((crop) => {
              const progress = calculateProgress(crop.sowingDate, crop.expectedHarvest);

              return (
                <div
                  key={crop.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {crop.farmName}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {crop.name} {crop.variety ? `(${crop.variety})` : ""}
                        </h3>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 font-bold border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                        {crop.health}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Growth Stage: {crop.growthStage}</span>
                        <span className="text-emerald-600 font-bold">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden dark:bg-slate-800">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Data Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-800/80">
                        <span className="text-slate-400 font-medium">Planting Date</span>
                        <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{crop.sowingDate}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-800/80">
                        <span className="text-slate-400 font-medium">Expected Harvest</span>
                        <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{crop.expectedHarvest}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-800/80">
                        <span className="text-slate-400 font-medium">Area</span>
                        <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{crop.area} Acres</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-800/80">
                        <span className="text-slate-400 font-medium">Water Need</span>
                        <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{crop.waterNeed}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Status: {crop.diseaseStatus || "Healthy"}
                    </span>
                    <button
                      onClick={() => deleteCrop(crop.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete crop"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Crop Registration Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                Register New Crop
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCrop} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Select Farm *</label>
                <select
                  required
                  value={formData.farmId}
                  onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white font-bold"
                >
                  <option value="">-- Choose Farm --</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.area} Acres)
                    </option>
                  ))}
                </select>
                {farms.length === 0 && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    No farms found. Please create a farm in the Farms tab first.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Crop Name *</label>
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
                    placeholder="e.g. Sona Masuri, Basmati"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Planting / Sowing Date</label>
                  <input
                    type="date"
                    required
                    value={formData.sowingDate}
                    onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Expected Harvest Date</label>
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
                    onChange={(e) => setFormData({ ...formData, growthStage: e.target.value as any })}
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
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Water Need</label>
                  <select
                    value={formData.waterNeed}
                    onChange={(e) => setFormData({ ...formData, waterNeed: e.target.value as any })}
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
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={farms.length === 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Crop
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

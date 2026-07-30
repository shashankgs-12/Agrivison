"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Sprout,
  Search,
  Filter,
  Calendar,
  Droplets,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const MOCK_CROPS = [
  {
    id: "crop-1",
    name: "Wheat (HD-2967)",
    farm: "Sunrise Agro Farm",
    field: "Field #2",
    stage: "Vegetative",
    progress: 65,
    sowingDate: "Nov 12, 2025",
    expectedHarvest: "Mar 25, 2026",
    health: "Alert Active",
    healthVariant: "rose" as const,
    waterNeed: "Moderate",
    image: "🌾",
  },
  {
    id: "crop-2",
    name: "Paddy (IR-64)",
    farm: "Green Valley Farm",
    field: "Field #1",
    stage: "Fruiting / Grain Fill",
    progress: 85,
    sowingDate: "Oct 05, 2025",
    expectedHarvest: "Feb 15, 2026",
    health: "Healthy",
    healthVariant: "emerald" as const,
    waterNeed: "High",
    image: "🌱",
  },
  {
    id: "crop-3",
    name: "Sugarcane (Co 0238)",
    farm: "Green Valley Farm",
    field: "Field #3",
    stage: "Germination",
    progress: 25,
    sowingDate: "Jan 10, 2026",
    expectedHarvest: "Nov 30, 2026",
    health: "Optimal",
    healthVariant: "emerald" as const,
    waterNeed: "Low",
    image: "🎍",
  },
  {
    id: "crop-4",
    name: "Maize (Hybrid HQPM-1)",
    farm: "Riverbank Plantation",
    field: "Field #1",
    stage: "Seedling",
    progress: 40,
    sowingDate: "Dec 01, 2025",
    expectedHarvest: "Apr 10, 2026",
    health: "Optimal",
    healthVariant: "emerald" as const,
    waterNeed: "Moderate",
    image: "🌽",
  },
];

export default function CropsPage() {
  const [search, setSearch] = useState("");

  const filteredCrops = MOCK_CROPS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.farm.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            Crop Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track growth stages, watering schedules, and harvest timelines
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Register New Crop
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search crops or farms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
          Filter Stage
        </Button>
      </div>

      {/* Crops List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCrops.map((crop) => (
          <Link key={crop.id} href={`/crops/${crop.id}`}>
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all group dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 text-2xl flex items-center justify-center dark:bg-emerald-950/50">
                    {crop.image}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors dark:text-white">
                      {crop.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      📍 {crop.farm} ({crop.field})
                    </p>
                  </div>
                </div>
                <Badge variant={crop.healthVariant}>{crop.health}</Badge>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">
                    Stage: <strong className="text-slate-900 dark:text-white">{crop.stage}</strong>
                  </span>
                  <span className="text-emerald-600 font-bold">{crop.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all"
                    style={{ width: `${crop.progress}%` }}
                  />
                </div>
              </div>

              {/* Metadata row */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Harvest: <strong className="text-slate-700 dark:text-slate-300">{crop.expectedHarvest}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Droplets className="h-3.5 w-3.5 text-blue-500" />
                  <span>Water: <strong className="text-slate-700 dark:text-slate-300">{crop.waterNeed}</strong></span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

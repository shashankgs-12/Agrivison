"use client";

import React, { useMemo } from "react";
import {
  MapPin,
  Maximize2,
  Sprout,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useFarms } from "@/hooks/use-farms";
import { useCrops } from "@/hooks/use-crops";
import { useDiseaseRecords } from "@/hooks/use-history";
import { useAuthStore } from "@/stores/auth-store";

export function StatCards() {
  const { user } = useAuthStore();
  const { farms } = useFarms();
  const { crops } = useCrops();
  const { diseaseRecords } = useDiseaseRecords();

  const totalFarmsCount = farms.length;
  const totalAreaAcres = farms.reduce((acc, f) => acc + (f.area || 0), 0).toFixed(1);
  const totalCropsCount = crops.length;

  const activeAlertsCount = diseaseRecords.filter(
    (r) => r.severity === "critical" || r.severity === "high"
  ).length;

  const STATS = [
    {
      id: "farms",
      title: "Total Farms",
      value: `${totalFarmsCount}`,
      change: totalFarmsCount === 0 ? "0 Farms added" : `${totalFarmsCount} active farms`,
      trend: totalFarmsCount > 0 ? "up" : "neutral",
      Icon: MapPin,
      color: "emerald",
    },
    {
      id: "area",
      title: "Total Area",
      value: `${totalAreaAcres} Acres`,
      change: totalFarmsCount === 0 ? "0.0 Acres" : "Total Cultivated Area",
      trend: "neutral",
      Icon: Maximize2,
      color: "blue",
    },
    {
      id: "crops",
      title: "Registered Crops",
      value: `${totalCropsCount}`,
      change: totalCropsCount === 0 ? "0 Crops registered" : `${totalCropsCount} active crops`,
      trend: totalCropsCount > 0 ? "up" : "neutral",
      Icon: Sprout,
      color: "amber",
    },
    {
      id: "alerts",
      title: "Disease Alerts",
      value: `${activeAlertsCount} Active`,
      change: activeAlertsCount > 0 ? "Action required" : "0 Critical alerts",
      trend: activeAlertsCount > 0 ? "down" : "up",
      Icon: AlertTriangle,
      color: activeAlertsCount > 0 ? "rose" : "emerald",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat) => {
        const Icon = stat.Icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : stat.trend === "down" ? TrendingDown : Minus;

        return (
          <div
            key={stat.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200 group dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                  stat.color === "emerald"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : stat.color === "blue"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    : stat.color === "amber"
                    ? "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                    : "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                  stat.color === "emerald"
                    ? "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/50"
                    : "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800"
                )}
              >
                <TrendIcon className="h-3 w-3" />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-semibold mb-0.5 dark:text-slate-400">
              {stat.title}
            </p>
            <p className="text-xl font-bold text-slate-900 tracking-tight dark:text-white">
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 dark:text-slate-500 font-medium">
              {stat.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}

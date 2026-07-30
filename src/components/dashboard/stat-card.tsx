"use client";

import React from "react";
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
import { useFarmStore } from "@/stores/farm-store";

export function StatCards() {
  const { farms } = useFarmStore();

  const totalFarmsCount = farms.length;
  const totalAreaAcres = farms.reduce((acc, f) => acc + f.area, 0).toFixed(1);
  const activeAlertsCount = farms.filter((f) => f.status === "Alert Active").length;

  const STATS = [
    {
      id: "farms",
      title: "Total Farms",
      value: `${totalFarmsCount} ${totalFarmsCount === 1 ? "Farm" : "Farms"}`,
      change: totalFarmsCount === 0 ? "No farms registered" : `${totalFarmsCount} active`,
      trend: totalFarmsCount > 0 ? "up" : "neutral",
      Icon: MapPin,
      color: "emerald",
    },
    {
      id: "area",
      title: "Total Area",
      value: `${totalAreaAcres} Acres`,
      change: totalFarmsCount === 0 ? "0.0 Cultivation" : "Active Cultivation",
      trend: "neutral",
      Icon: Maximize2,
      color: "blue",
    },
    {
      id: "crops",
      title: "Total Crops",
      value: totalFarmsCount === 0 ? "0 Varieties" : "8 Varieties",
      change: totalFarmsCount === 0 ? "No active crops" : "Wheat, Paddy, Sugarcane...",
      trend: totalFarmsCount > 0 ? "up" : "neutral",
      Icon: Sprout,
      color: "amber",
    },
    {
      id: "alerts",
      title: "Disease Alerts",
      value: `${activeAlertsCount} Active`,
      change: activeAlertsCount > 0 ? "Requires attention" : "All crops healthy",
      trend: activeAlertsCount > 0 ? "down" : "up",
      Icon: AlertTriangle,
      color: activeAlertsCount > 0 ? "rose" : "emerald",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat, i) => {
        const Icon = stat.Icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : stat.trend === "down" ? TrendingDown : Minus;

        return (
          <div
            key={stat.id}
            className="bg-white rounded-2xl border border-zinc-200/80 p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200 group dark:bg-black dark:border-zinc-800"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                  stat.color === "emerald"
                    ? "bg-[#008631]/10 text-[#00ab41]"
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
                  "flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full",
                  stat.color === "emerald"
                    ? "text-[#00ab41] bg-[#008631]/10"
                    : "text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-900"
                )}
              >
                <TrendIcon className="h-3 w-3" />
              </div>
            </div>
            <p className="text-xs text-zinc-500 font-semibold mb-0.5 dark:text-zinc-400">
              {stat.title}
            </p>
            <p className="text-xl font-bold text-zinc-900 tracking-tight dark:text-white">
              {stat.value}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1 dark:text-zinc-500">
              {stat.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}

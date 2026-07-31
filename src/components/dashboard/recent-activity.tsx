"use client";

import React, { useMemo } from "react";
import { Activity, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useFarms } from "@/hooks/use-farms";
import { useCrops } from "@/hooks/use-crops";
import { useDiseaseRecords, usePlantRecords } from "@/hooks/use-history";
import { useAuthStore } from "@/stores/auth-store";

export function RecentActivity() {
  const { user } = useAuthStore();
  const { farms } = useFarms();
  const { crops } = useCrops();
  const { diseaseRecords } = useDiseaseRecords();
  const { plantRecords } = usePlantRecords();

  // Synthesize real activity stream from user's database records
  const activities: Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    badge: string;
    badgeColor: "emerald" | "rose" | "blue" | "amber";
  }> = [];

  farms.slice(0, 2).forEach((f) => {
    activities.push({
      id: f.id,
      title: `Farm Registered: ${f.name}`,
      description: `${f.area} Acres located at ${f.location}`,
      time: f.createdAt || "Recently",
      badge: "Land",
      badgeColor: "emerald",
    });
  });

  crops.slice(0, 2).forEach((c) => {
    activities.push({
      id: c.id,
      title: `Crop Added: ${c.name}`,
      description: `Growing at ${c.farmName} (${c.growthStage} stage)`,
      time: c.createdAt || "Recently",
      badge: "Crop",
      badgeColor: "amber",
    });
  });

  diseaseRecords.slice(0, 2).forEach((d) => {
    activities.push({
      id: d.id,
      title: `Disease Scan: ${d.diseaseName}`,
      description: `Confidence ${d.confidence}% • Severity: ${d.severity}`,
      time: new Date(d.timestamp).toLocaleDateString(),
      badge: "AI Scan",
      badgeColor: "rose",
    });
  });

  plantRecords.slice(0, 2).forEach((p) => {
    activities.push({
      id: p.id,
      title: `Plant ID: ${p.plantName}`,
      description: `${p.scientificName} identified with ${p.confidence}% confidence`,
      time: new Date(p.timestamp).toLocaleDateString(),
      badge: "AI ID",
      badgeColor: "blue",
    });
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Farm Activity
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-0">
        {activities.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <Clock className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No recent activity records
            </p>
            <p className="text-[11px] text-slate-400">
              Add your first farm or perform an AI crop scan to populate your timeline.
            </p>
            <Link href="/farms/add">
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 hover:underline">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Farm
              </span>
            </Link>
          </div>
        ) : (
          activities.map((activity, i) => (
            <div key={activity.id} className="flex gap-3 py-3 relative">
              {i < activities.length - 1 && (
                <div className="absolute left-[11px] top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
              )}

              <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 relative z-10 dark:bg-emerald-900">
                <div className="h-2 w-2 rounded-full bg-emerald-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {activity.title}
                  </span>
                  <Badge variant={activity.badgeColor}>{activity.badge}</Badge>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 dark:text-slate-400 font-medium">
                  {activity.description}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 dark:text-slate-500 font-semibold">
                  {activity.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

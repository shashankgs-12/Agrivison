"use client";

import React from "react";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MOCK_RECENT_ACTIVITY } from "@/lib/mock-data";

const BADGE_VARIANT_MAP: Record<string, "emerald" | "rose" | "amber" | "blue" | "slate"> = {
  rose: "rose",
  blue: "blue",
  emerald: "emerald",
  amber: "amber",
};

export function RecentActivity() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Activity
          </h3>
        </div>
        <button className="text-xs text-emerald-600 font-semibold hover:underline">
          View All
        </button>
      </div>

      <div className="p-4 space-y-0">
        {MOCK_RECENT_ACTIVITY.map((activity, i) => (
          <div
            key={activity.id}
            className="flex gap-3 py-3 relative"
          >
            {/* Timeline line */}
            {i < MOCK_RECENT_ACTIVITY.length - 1 && (
              <div className="absolute left-[11px] top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
            )}

            {/* Timeline dot */}
            <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 relative z-10 dark:bg-emerald-900">
              <div className="h-2 w-2 rounded-full bg-emerald-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {activity.title}
                </span>
                <Badge variant={BADGE_VARIANT_MAP[activity.badgeColor] || "slate"}>
                  {activity.badge}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 dark:text-slate-400">
                {activity.description}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 dark:text-slate-500">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

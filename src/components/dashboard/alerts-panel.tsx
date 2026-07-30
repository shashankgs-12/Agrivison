"use client";

import React from "react";
import { AlertTriangle, ShieldAlert, CloudLightning } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MOCK_ALERTS } from "@/lib/mock-data";

const ALERT_STYLES: Record<string, { bg: string; border: string; icon: string; iconBg: string; IconComponent: React.ElementType }> = {
  critical: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    icon: "text-rose-600",
    iconBg: "bg-rose-100 dark:bg-rose-900",
    IconComponent: ShieldAlert,
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-600",
    iconBg: "bg-amber-100 dark:bg-amber-900",
    IconComponent: CloudLightning,
  },
};

export function AlertsPanel() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Active Alerts
          </h3>
        </div>
        <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full dark:bg-rose-900 dark:text-rose-300">
          {MOCK_ALERTS.length} Active
        </span>
      </div>

      <div className="p-4 space-y-3">
        {MOCK_ALERTS.map((alert) => {
          const style = ALERT_STYLES[alert.severity] || ALERT_STYLES.warning;
          const Icon = style.IconComponent;

          return (
            <div
              key={alert.id}
              className={cn(
                "rounded-lg border p-3 transition-all hover:shadow-sm",
                style.bg,
                style.border
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", style.iconBg)}>
                  <Icon className={cn("h-4 w-4", style.icon)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {alert.title}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 dark:text-slate-500">
                      {alert.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-1.5 dark:text-slate-400">
                    {alert.description}
                  </p>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    📍 {alert.field}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

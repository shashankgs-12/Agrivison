"use client";

import React from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useDiseaseRecords } from "@/hooks/use-history";
import { useAuthStore } from "@/stores/auth-store";

export function AlertsPanel() {
  const { user } = useAuthStore();
  const { diseaseRecords } = useDiseaseRecords();

  // Filter alerts for medium/high/critical severity
  const activeAlerts = diseaseRecords.filter(
    (r) => r.severity === "critical" || r.severity === "high" || r.severity === "medium"
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Active Crop Disease Alerts
          </h3>
        </div>
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            activeAlerts.length > 0
              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          )}
        >
          {activeAlerts.length} Active
        </span>
      </div>

      <div className="p-4 space-y-3">
        {activeAlerts.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No Active Disease Alerts
            </p>
            <p className="text-[11px] text-slate-400">
              Your registered crops are healthy and free of critical disease diagnoses.
            </p>
          </div>
        ) : (
          activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 dark:bg-rose-950/20 dark:border-rose-900 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  {alert.diseaseName}
                </span>
                <span className="text-[10px] uppercase font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded dark:bg-rose-900 dark:text-rose-200">
                  {alert.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                {alert.symptoms}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

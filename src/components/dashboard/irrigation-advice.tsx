"use client";

import React from "react";
import {
  Droplets,
  ShieldAlert,
  CheckCircle,
  CloudRain,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MOCK_IRRIGATION_ADVICE } from "@/lib/mock-data";

export function IrrigationAdvice() {
  const advice = MOCK_IRRIGATION_ADVICE;
  const isWarning = advice.status === "warning";

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Irrigation Advisor
          </h3>
        </div>

        {/* Decision Card */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg",
            isWarning
              ? "bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
              : "bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
          )}
        >
          {isWarning ? (
            <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
          )}
          <div>
            <p
              className={cn(
                "text-sm font-bold",
                isWarning ? "text-amber-800 dark:text-amber-300" : "text-emerald-800 dark:text-emerald-300"
              )}
            >
              {advice.recommendation}
            </p>
            <p className="text-xs text-slate-600 mt-0.5 dark:text-slate-400">
              {advice.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Water saved badge */}
      <div className="px-4 pt-3 flex items-center gap-2">
        <CloudRain className="h-4 w-4 text-blue-500" />
        <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
          💧 {advice.waterSaved}
        </span>
      </div>

      {/* Field statuses */}
      <div className="p-4 space-y-2">
        {advice.fieldStatuses.map((field, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
          >
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {field.name}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 dark:text-slate-400">
                {field.moisture}
              </p>
            </div>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full dark:text-emerald-300 dark:bg-emerald-900/50">
              {field.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

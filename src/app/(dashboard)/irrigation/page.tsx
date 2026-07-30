"use client";

import React from "react";
import {
  Droplets,
  ShieldAlert,
  CheckCircle,
  CloudRain,
  Calendar,
  Zap,
} from "lucide-react";
import { MOCK_IRRIGATION_ADVICE } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export default function IrrigationPage() {
  const advice = MOCK_IRRIGATION_ADVICE;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            Smart Irrigation Advisor
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Weather-aware watering recommendations to save water and optimize crop yield
          </p>
        </div>
        <Button size="sm">
          <Zap className="h-4 w-4" />
          Recalculate Schedule
        </Button>
      </div>

      {/* Primary recommendation banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 dark:bg-amber-950/30 dark:border-amber-700">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 dark:bg-amber-900 dark:text-amber-300">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Today&apos;s Recommendation
            </span>
            <h2 className="text-xl font-extrabold text-amber-950 dark:text-amber-100">
              {advice.recommendation}
            </h2>
            <p className="text-xs text-amber-900 mt-1 max-w-lg leading-relaxed dark:text-amber-200">
              {advice.reason}
            </p>
          </div>
        </div>
        <div className="bg-white px-4 py-3 rounded-xl border border-amber-200 text-center shrink-0 dark:bg-slate-900 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">Water Saved Today</span>
          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            {advice.waterSaved}
          </p>
        </div>
      </div>

      {/* Field breakdowns */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3 dark:text-white">
          Field Soil Moisture & Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {advice.fieldStatuses.map((field, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm dark:text-white">
                  {field.name}
                </h4>
                <Droplets className="h-4 w-4 text-blue-500" />
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Soil Moisture</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5 dark:text-slate-200">{field.moisture}</p>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-600 uppercase font-bold dark:text-emerald-400">Action</span>
                <p className="text-xs font-bold text-emerald-800 mt-0.5 dark:text-emerald-300">{field.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

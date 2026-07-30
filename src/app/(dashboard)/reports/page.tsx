"use client";

import React from "react";
import { FileBarChart, Download, Calendar, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            Agricultural Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Export farm yields, disease detection history, and irrigation summaries
          </p>
        </div>
        <Button size="sm">
          <Download className="h-4 w-4" />
          Export PDF Summary
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950/50">
              <FileBarChart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Season Yield Report</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Rabi 2025 - 2026 harvest projection</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
            Projected total production: 42.5 Quintals of Wheat and 120 Quintals of Sugarcane across 3 registered farms.
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Download Report
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center dark:bg-rose-950/50">
              <FileBarChart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Disease Audit Log</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">3 AI scans logged this season</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
            Detailed log of scanned leaves, AI confidence scores, detected pathogens, and fungicide spray records.
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Download Audit Log
          </Button>
        </div>
      </div>
    </div>
  );
}

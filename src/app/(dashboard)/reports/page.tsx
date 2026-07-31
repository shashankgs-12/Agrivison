"use client";

import React from "react";
import { FileBarChart, Download, Sprout, ShieldAlert, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useFarms } from "@/hooks/use-farms";
import { useCrops } from "@/hooks/use-crops";
import { useDiseaseRecords } from "@/hooks/use-history";

export default function ReportsPage() {
  const { user } = useAuthStore();
  const { farms } = useFarms();
  const { crops } = useCrops();
  const { diseaseRecords } = useDiseaseRecords();

  const totalArea = farms.reduce((acc, f) => acc + (f.area || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            Agricultural Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Export farm yields, disease detection history, and irrigation summaries for {user?.name || "Farmer"}
          </p>
        </div>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
          <Download className="h-4 w-4 mr-1.5" />
          Export PDF Summary
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Farm & Crop Yield Report */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950/50">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Farm & Crop Summary</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Active Land & Registered Crops</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
            {farms.length > 0
              ? `Registered ${farms.length} farm(s) covering ${totalArea.toFixed(1)} Acres with ${crops.length} active crop(s).`
              : `No farms registered yet. Add your first farm to generate personalized yield reports.`}
          </p>
          <Button variant="outline" size="sm" className="w-full font-bold">
            Download Yield Projections
          </Button>
        </div>

        {/* Disease & Health Audit Log */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center dark:bg-rose-950/50">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Disease Audit Log</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{diseaseRecords.length} AI scan(s) logged</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
            {diseaseRecords.length > 0
              ? `Logged ${diseaseRecords.length} leaf scan diagnosis record(s) with custom treatment and medicine recommendations.`
              : `No disease scans logged yet. Perform AI leaf scanning to populate your health audit log.`}
          </p>
          <Button variant="outline" size="sm" className="w-full font-bold">
            Download Audit Log
          </Button>
        </div>
      </div>
    </div>
  );
}

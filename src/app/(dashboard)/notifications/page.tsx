"use client";

import React from "react";
import { Bell, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useDiseaseRecords } from "@/hooks/use-history";
import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { diseaseRecords } = useDiseaseRecords();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-emerald-600" />
            Notifications & Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time updates regarding disease detections, weather warnings, and irrigation holds
          </p>
        </div>
      </div>

      {diseaseRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-md dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto dark:bg-emerald-950/50">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Notifications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All your registered crops and farms are clear. Scanning crops will populate diagnostic alerts here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {diseaseRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start gap-4 hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 dark:bg-rose-900/50 dark:text-rose-300">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Disease Scan: {record.diseaseName}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {new Date(record.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
                  {record.symptoms}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge className="bg-rose-500 text-white font-bold uppercase text-[10px]">
                    {record.severity} Severity
                  </Badge>
                  <span className="text-[10px] font-bold text-slate-500">
                    Confidence: {record.confidence}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { Bell, ShieldAlert, CloudLightning, Sprout, Check } from "lucide-react";
import { MOCK_ALERTS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            Notifications & Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time updates regarding disease detections, weather warnings, and irrigation holds
          </p>
        </div>
        <button className="text-xs text-emerald-600 font-bold hover:underline">
          Mark All as Read
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_ALERTS.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-start gap-4 hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 dark:bg-rose-900 dark:text-rose-300">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {alert.title}
                </h3>
                <span className="text-[10px] text-slate-400">{alert.time}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
                {alert.description}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="rose">📍 {alert.field}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

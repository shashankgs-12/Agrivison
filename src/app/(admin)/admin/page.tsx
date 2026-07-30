"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Sprout,
  AlertTriangle,
  Activity,
  BarChart3,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_STATS = [
  { label: "Total Farmers Registered", value: "14,280", change: "+12% this month", icon: Users, color: "blue" },
  { label: "Total Acreage Mapped", value: "85,400 Acres", change: "+3,200 Acres", icon: Sprout, color: "emerald" },
  { label: "AI Scans Processed", value: "142,900", change: "98.2% Accuracy", icon: Activity, color: "violet" },
  { label: "Active Disease Outbreaks", value: "4 Regional", change: "Alerts Dispatched", icon: AlertTriangle, color: "rose" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
              Admin Portal
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            System-wide platform monitoring, user roles, and disease outbreak heatmaps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button size="sm">
              <BarChart3 className="h-4 w-4" />
              System Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ADMIN_STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 font-medium dark:text-slate-400">
                  {stat.label}
                </span>
                <Icon className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 mb-3 dark:text-white">
            Recent Regional Disease Reports
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs dark:bg-rose-950/30 dark:border-rose-800">
              <span className="font-bold text-rose-800 dark:text-rose-300">Mandya District (Karnataka)</span>
              <p className="text-rose-900 mt-0.5 dark:text-rose-200">14 reports of Yellow Rust in Wheat fields. Broadcast alert sent to 820 farmers.</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs dark:bg-amber-950/30 dark:border-amber-800">
              <span className="font-bold text-amber-800 dark:text-amber-300">Raichur District (Karnataka)</span>
              <p className="text-amber-900 mt-0.5 dark:text-amber-200">Cotton Leaf Curl Virus reported in 6 locations. Officers assigned.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 mb-3 dark:text-white">
            AI Engine Status
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Gemini 2.5 Flash API</span>
              <span className="text-emerald-600 font-bold">🟢 Operational (99.9%)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">OpenWeatherMap API</span>
              <span className="text-emerald-600 font-bold">🟢 Operational</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Google Maps Geocoding</span>
              <span className="text-emerald-600 font-bold">🟢 Operational</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600 dark:text-slate-400">Firebase Cloud Messaging</span>
              <span className="text-emerald-600 font-bold">🟢 Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

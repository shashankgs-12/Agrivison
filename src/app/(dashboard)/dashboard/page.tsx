"use client";

import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  StatCards,
  FarmMap,
  WeatherWidget,
  IrrigationAdvice,
  RecentActivity,
  AlertsPanel,
  QuickActions,
} from "@/components/dashboard";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const displayName = user?.name ? user.name.split(" ")[0] : "Farmer";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 dark:text-slate-400">
            Real-time smart farming insights for your registered land.
          </p>
        </div>
        <Link href="/farms/add">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
            <Plus className="h-4 w-4 mr-1" />
            + Add Farm
          </Button>
        </Link>
      </div>

      {/* Real Stat Cards Row */}
      <StatCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) — Map + Activity */}
        <div className="lg:col-span-2 space-y-6">
          <FarmMap />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentActivity />
            <AlertsPanel />
          </div>
        </div>

        {/* Right Column (1/3) — Weather + Irrigation */}
        <div className="space-y-6">
          <WeatherWidget />
          <IrrigationAdvice />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}

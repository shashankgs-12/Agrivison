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
import { useLanguage } from "@/hooks/use-language";
import { getDashboardText } from "@/lib/i18n/localization";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { language } = useLanguage();
  const copy = getDashboardText(language);
  const displayName = user?.name ? user.name.split(" ")[0] : "Farmer";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="relative isolate overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 p-5 shadow-lg shadow-emerald-950/20 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              {copy.overview}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {copy.welcome}, {displayName} <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {copy.summary}
            </p>
          </div>
          <Link href="/farms/add" className="self-start sm:self-auto">
            <Button size="sm" className="min-h-11 rounded-xl bg-emerald-500 px-5 font-bold text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-400">
              <Plus className="mr-1 h-4 w-4" />
              {copy.addFarm}
            </Button>
          </Link>
        </div>
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

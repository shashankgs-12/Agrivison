"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Sprout, CloudSun, Droplets, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_FARMS } from "@/lib/mock-data";

export default function FarmDetailsPage({ params }: { params: { farmId: string } }) {
  const farm = MOCK_FARMS.find((f) => f.id === params.farmId) || MOCK_FARMS[0];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/farms">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            {farm.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            📍 Mandya District · {farm.area}
          </p>
        </div>
      </div>

      {/* Map card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="h-64 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 relative overflow-hidden dark:bg-slate-800 dark:border-slate-700">
          <MapPin className="h-10 w-10 text-emerald-600 animate-bounce" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Interactive GPS Boundary Polygon for {farm.name}
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sprout, Calendar, Droplets, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CropDetailsPage({ params }: { params: { cropId: string } }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/crops">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            Wheat (HD-2967)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Registered on Sunrise Agro Farm (Field #2)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 mb-2 dark:text-white">Crop Growth Timeline</h3>
        <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">Vegetative Stage — 65% Progress</p>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
          <div className="h-full bg-emerald-600 w-2/3" />
        </div>
      </div>
    </div>
  );
}

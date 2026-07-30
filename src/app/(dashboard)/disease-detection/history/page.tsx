"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Scan, History, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DiseaseHistoryPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/disease-detection">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            Disease Scan History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Past crop disease scans and AI diagnosis records
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center dark:bg-rose-950">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Yellow Rust (Puccinia striiformis)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Field #2 · Scanned Today at 10:30 AM</p>
          </div>
        </div>
        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full dark:bg-rose-950">
          94% Confidence
        </span>
      </div>
    </div>
  );
}

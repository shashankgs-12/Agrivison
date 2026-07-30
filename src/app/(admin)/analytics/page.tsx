"use client";

import React from "react";
import { BarChart3, TrendingUp, Globe, Activity } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
          System Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          AI usage metrics, disease detection volume, and language adoption statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <p className="text-xs text-slate-500">Most Diagnosed Disease</p>
          <p className="text-xl font-bold text-slate-900 mt-1 dark:text-white">Yellow Rust (42%)</p>
          <p className="text-[10px] text-slate-400 mt-1">Followed by Blast (28%) & Downy Mildew (15%)</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <p className="text-xs text-slate-500">Top Selected Language</p>
          <p className="text-xl font-bold text-slate-900 mt-1 dark:text-white">Kannada (ಕನ್ನಡ) 54%</p>
          <p className="text-[10px] text-slate-400 mt-1">Followed by Hindi (22%) & English (14%)</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <p className="text-xs text-slate-500">Avg AI Response Time</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">1.2 seconds</p>
          <p className="text-[10px] text-slate-400 mt-1">Gemini 2.5 Flash API inference</p>
        </div>
      </div>
    </div>
  );
}

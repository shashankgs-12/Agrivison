"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Globe, Languages, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguageStore, LanguagePreferences } from "@/stores/language-store";
import { SUPPORTED_LANGUAGES } from "@/lib/utils/constants";

const MODULES: { key: keyof LanguagePreferences; title: string; desc: string }[] = [
  {
    key: "dashboard",
    title: "Main Dashboard UI",
    desc: "Controls main menu items, navigation headers, and system chrome",
  },
  {
    key: "plantInfo",
    title: "Plant Identification & Agronomy",
    desc: "AI responses for plant species, soil needs, and growing seasons",
  },
  {
    key: "weather",
    title: "Weather Advisories & Reports",
    desc: "Local forecasts, rain alerts, and wind condition notes",
  },
  {
    key: "diseaseInfo",
    title: "Disease Diagnosis & Symptoms",
    desc: "AI identification of leaf symptoms, severity, and pathogens",
  },
  {
    key: "treatment",
    title: "Organic & Chemical Treatment Guides",
    desc: "Fungicide dosages, spray schedules, and organic remedies",
  },
  {
    key: "notifications",
    title: "Push & SMS Notifications",
    desc: "Severe weather alerts and harvest reminders sent to your phone",
  },
  {
    key: "chat",
    title: "AI Agronomist Chat Assistant",
    desc: "Language used by Gemini AI when answering your farming queries",
  },
];

export default function LanguageSettingsPage() {
  const { preferences, setPreference } = useLanguageStore();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            Per-Module Language Preferences
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Customize output languages individually across 6 Indian languages
          </p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 dark:bg-emerald-950/30 dark:border-emerald-800">
        <Languages className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-900 leading-relaxed dark:text-emerald-200">
          <strong>Smart Translation System:</strong> When Gemini AI diagnoses a crop disease or provides plant advice, it generates responses in all supported languages simultaneously. You can set different languages for different modules!
        </p>
      </div>

      {/* Module Language Cards */}
      <div className="space-y-4">
        {MODULES.map((mod) => (
          <div
            key={mod.key}
            className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 dark:bg-slate-900 dark:border-slate-800"
          >
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white">
                {mod.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
                {mod.desc}
              </p>
            </div>

            <select
              value={preferences[mod.key]}
              onChange={(e) => setPreference(mod.key, e.target.value)}
              className="h-10 px-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <Button className="w-full" size="lg">
        <Save className="h-4 w-4" />
        Save Language Preferences
      </Button>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Upload,
  Camera,
  Sparkles,
  History,
  Languages,
  BookOpen,
  Sprout,
  Sun,
  Droplets,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/stores/language-store";
import { SUPPORTED_LANGUAGES } from "@/lib/utils/constants";

export default function PlantIdentificationPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { preferences, setPreference } = useLanguageStore();

  const handleSimulateIdentify = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        name: {
          en: "Cotton (Gossypium hirsutum)",
          kn: "ಹತ್ತಿ",
          hi: "कपास (कपास का पौधा)",
          te: "ప్రత్తి పత్తి",
          ta: "பருத்தி",
          ml: "പരുത്തി",
        },
        confidence: 97,
        family: "Malvaceae",
        info: {
          growingSeason: "Kharif (June - Nov)",
          soil: "Deep Black Cotton Soil (Vertisols)",
          water: "500 - 700 mm total requirement",
          harvest: "150 - 180 days after sowing",
        },
      });
    }, 2000);
  };

  const currentLang = preferences.plantInfo || "en";

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            AI Plant Identifier
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Identify any crop or plant species instantly with growing tips
          </p>
        </div>
        <Link href="/plant-identification/history">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4" />
            ID History
          </Button>
        </Link>
      </div>

      {/* Per-Module Language Switcher */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center justify-between dark:bg-emerald-950/30 dark:border-emerald-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <Languages className="h-4 w-4 text-emerald-600" />
          <span>Plant Info Language:</span>
        </div>
        <select
          value={currentLang}
          onChange={(e) => setPreference("plantInfo", e.target.value)}
          className="h-8 px-2.5 text-xs font-bold bg-white text-emerald-900 border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-slate-900 dark:text-white dark:border-slate-700"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 text-center dark:bg-slate-900 dark:border-slate-800">
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-20 w-20 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md dark:bg-emerald-950/50 dark:text-emerald-400">
            <Sparkles className="h-10 w-10 animate-pulse-gentle" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Take or Upload Plant Photo
            </h3>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              Capture flower, leaf, or whole plant for high accuracy identification
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              className="flex-1"
              size="lg"
              onClick={handleSimulateIdentify}
              disabled={analyzing}
            >
              <Camera className="h-5 w-5" />
              {analyzing ? "Identifying..." : "Take Photo"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={handleSimulateIdentify}
              disabled={analyzing}
            >
              <Upload className="h-5 w-5" />
              Upload Image
            </Button>
          </div>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg overflow-hidden animate-fade-in dark:bg-slate-900 dark:border-slate-800">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-5 text-white flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold">
                Plant Identified
              </span>
              <h2 className="text-xl font-bold">
                {result.name[currentLang] || result.name.en}
              </h2>
              <p className="text-xs text-emerald-100 italic">Family: {result.family}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black">{result.confidence}%</span>
              <p className="text-[10px] text-emerald-200 uppercase font-bold">Accuracy</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
              <p className="text-[10px] uppercase font-bold text-slate-400">Growing Season</p>
              <p className="text-sm font-bold text-slate-800 mt-1 dark:text-slate-200">{result.info.growingSeason}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
              <p className="text-[10px] uppercase font-bold text-slate-400">Optimal Soil</p>
              <p className="text-sm font-bold text-slate-800 mt-1 dark:text-slate-200">{result.info.soil}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
              <p className="text-[10px] uppercase font-bold text-slate-400">Water Requirement</p>
              <p className="text-sm font-bold text-slate-800 mt-1 dark:text-slate-200">{result.info.water}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
              <p className="text-[10px] uppercase font-bold text-slate-400">Harvest Cycle</p>
              <p className="text-sm font-bold text-slate-800 mt-1 dark:text-slate-200">{result.info.harvest}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

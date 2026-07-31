"use client";

import React, { useState, useRef } from "react";
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
  AlertCircle,
  CheckCircle2,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/stores/language-store";
import { useHistoryStore } from "@/stores/history-store";
import { useAuthStore } from "@/stores/auth-store";
import { SUPPORTED_LANGUAGES } from "@/lib/utils/constants";
import { CameraModal } from "@/components/shared/camera-modal";

const LOADING_STAGES = [
  "Uploading Image...",
  "Analyzing Plant Features...",
  "Querying Gemini AI...",
  "Almost Done...",
];

export default function PlantIdentificationPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { preferences, setPreference } = useLanguageStore();
  const { addPlantRecord } = useHistoryStore();
  const { user } = useAuthStore();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (base64Image: string) => {
    setSelectedImage(base64Image);
    setResult(null);
    setErrorMsg(null);
  };

  const handleIdentify = async () => {
    if (!selectedImage) {
      setErrorMsg("Please upload or capture a plant image first.");
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);
    setLoadingStage(0);

    // Dynamic stage ticker for smooth UX
    const stageInterval = setInterval(() => {
      setLoadingStage((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await fetch("/api/ai/identify-plant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage }),
      });

      clearInterval(stageInterval);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Plant identification failed.");
      }

      setResult(data.result);

      // Save to store history
      addPlantRecord({
        userId: user?.uid,
        imageUrl: selectedImage,
        plantName: typeof data.result.name === "object" ? data.result.name.en : data.result.name,
        scientificName: data.result.scientificName || "",
        family: data.result.family || "",
        confidence: data.result.confidence || 95,
        growingSeason: data.result.growingSeason || "",
        optimalSoil: data.result.optimalSoil || "",
        waterRequirement: data.result.waterRequirement || "",
        harvestCycle: data.result.harvestCycle || "",
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to identify plant. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const currentLang = preferences.plantInfo || "en";

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
            <Sprout className="h-7 w-7 text-emerald-600" />
            AI Plant Identifier
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Identify any crop or plant species with full agronomic recommendations
          </p>
        </div>
        <Link href="/plant-identification/history">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-1" />
            ID History
          </Button>
        </Link>
      </div>

      {/* Language Selector */}
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

      {/* Upload/Camera Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 text-center dark:bg-slate-900 dark:border-slate-800 shadow-sm">
        <div className="max-w-md mx-auto space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          {selectedImage ? (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md">
              <img src={selectedImage} alt="Selected plant" className="w-full h-full object-cover" />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setResult(null);
                  setErrorMsg(null);
                }}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-2 rounded-full text-xs font-bold transition-all"
              >
                Change Image
              </button>
            </div>
          ) : (
            <div className="h-24 w-24 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md dark:bg-emerald-950/50 dark:text-emerald-400">
              <Sparkles className="h-12 w-12 animate-pulse" />
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedImage ? "Plant Photo Selected" : "Take or Upload Plant Photo"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              Capture flower, leaf, or full plant structure for high-accuracy identification
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              size="lg"
              onClick={() => setIsCameraOpen(true)}
              disabled={analyzing}
            >
              <Camera className="h-5 w-5 mr-2" />
              Take Photo
            </Button>
            <Button
              variant="outline"
              className="flex-1 font-bold border-slate-300"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={analyzing}
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Image
            </Button>
          </div>

          {selectedImage && (
            <Button
              onClick={handleIdentify}
              disabled={analyzing}
              className="w-full py-6 text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/20 hover:from-emerald-500 hover:to-teal-500"
            >
              <Sparkles className="h-5 w-5 mr-2 animate-spin-slow" />
              {analyzing ? LOADING_STAGES[loadingStage] : "Identify Plant with AI"}
            </Button>
          )}

          {/* Validation Warning */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading Animation Card */}
      {analyzing && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-lg dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-pulse">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto dark:bg-emerald-950/50">
            <Sparkles className="h-8 w-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {LOADING_STAGES[loadingStage]}
            </h3>
            <div className="w-full bg-slate-100 rounded-full h-2 max-w-xs mx-auto overflow-hidden dark:bg-slate-800">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((loadingStage + 1) / LOADING_STAGES.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Structured Result Output */}
      {result && !analyzing && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden animate-fade-in dark:bg-slate-900 dark:border-slate-800 space-y-0">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 p-6 text-white flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-200 font-extrabold">
                AI Plant Identified
              </span>
              <h2 className="text-2xl font-black mt-1">
                {typeof result.name === "object" ? result.name[currentLang] || result.name.en : result.name}
              </h2>
              <p className="text-xs text-emerald-100 italic mt-0.5">
                {result.scientificName} • Family: {result.family}
              </p>
            </div>
            <div className="text-right bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
              <span className="text-3xl font-black">{result.confidence}%</span>
              <p className="text-[10px] text-emerald-100 uppercase font-bold">Accuracy</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Overview / Description */}
            {result.description && (
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 dark:bg-emerald-950/20 dark:border-emerald-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Description
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {result.description}
                </p>
              </div>
            )}

            {/* Grid Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Sun className="h-3.5 w-3.5 text-amber-500" /> Growing Season
                </span>
                <p className="text-sm font-bold text-slate-800 mt-1 dark:text-slate-200">
                  {result.growingSeason || result.info?.growingSeason || "Kharif & Rabi"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-blue-500" /> Water Requirement
                </span>
                <p className="text-sm font-bold text-slate-800 mt-1 dark:text-slate-200">
                  {result.waterRequirement || result.info?.water || "450 - 650 mm"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Scissors className="h-3.5 w-3.5 text-emerald-500" /> Harvest Cycle
                </span>
                <p className="text-sm font-bold text-slate-800 mt-1 dark:text-slate-200">
                  {result.harvestCycle || result.info?.harvest || "120 - 140 Days"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Sprout className="h-3.5 w-3.5 text-green-600" /> Optimal Soil
                </span>
                <p className="text-sm font-bold text-slate-800 mt-1 dark:text-slate-200">
                  {result.optimalSoil || result.info?.soil || "Well-drained Loamy Soil"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-purple-500" /> NPK Requirement
                </span>
                <p className="text-sm font-bold text-slate-800 mt-1 dark:text-slate-200">
                  {result.npkRequirement || "100:50:50 NPK kg/ha"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Common Diseases
                </span>
                <p className="text-sm font-bold text-slate-800 mt-1 dark:text-slate-200">
                  {result.commonDiseases || "Blast, Leaf Spot, Rust"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}

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
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useLanguageStore } from "@/stores/language-store";
import { useHistoryStore } from "@/stores/history-store";
import { useAuthStore } from "@/stores/auth-store";
import { SUPPORTED_LANGUAGES } from "@/lib/utils/constants";
import { CameraModal } from "@/components/shared/camera-modal";
import { prepareImageForAnalysis } from "@/lib/ai/image-processing";

const LOADING_STAGES = [
  "Preparing the plant image...",
  "Analyzing with Gemini 3.5 Flash-Lite...",
  "Checking crop and plant features...",
  "Preparing the identification...",
];

export default function PlantIdentificationPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { preferences, setPreference } = useLanguageStore();
  const { addPlantRecord } = useHistoryStore();
  const { user } = useAuthStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type.toLowerCase())) {
      setErrorMsg("Please select a valid JPEG, PNG, or WebP image.");
      input.value = "";
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("This image is too large to process. Choose a photo under 20 MB.");
      input.value = "";
      return;
    }

    setProcessingImage(true);
    setErrorMsg(null);
    try {
      const image = await prepareImageForAnalysis(file);
      setSelectedImage(image);
      setResult(null);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not prepare this image.");
    } finally {
      setProcessingImage(false);
      input.value = "";
    }
  };

  const handleCameraCapture = async (base64Image: string) => {
    setProcessingImage(true);
    setErrorMsg(null);
    try {
      setSelectedImage(await prepareImageForAnalysis(base64Image));
      setResult(null);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not prepare this image.");
    } finally {
      setProcessingImage(false);
    }
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
    const stageInterval = window.setInterval(() => {
      setLoadingStage((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await fetch("/api/ai/identify-plant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selectedImage,
          language: currentLang,
        }),
        signal: AbortSignal.timeout(75_000),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        setResult(null);
        if (data.isPlant === false) {
          setErrorMsg(data.error || "Unable to confidently identify the plant. Please select a clearer photo of a plant leaf or crop.");
          return;
        }
        if (
          res.status === 503 ||
          data.isBusy ||
          (data.error &&
            (data.error.includes("503") ||
              data.error.includes("busy") ||
              data.error.includes("high demand") ||
              data.error.includes("temporarily unavailable")))
        ) {
          setErrorMsg(
            "Plant identification is temporarily unavailable. The AI service is currently busy. Please try again in a few moments."
          );
          return;
        }
        throw new Error(data.error || "Plant identification failed.");
      }

      setResult(data.result);

      // Save to client store history as fallback
      try {
        addPlantRecord({
          userId: user?.uid,
          // Keep the selected image in component state for this session only.
          // The history store strips data/blob URLs before updating or saving.
          imageUrl: selectedImage,
          plantName: typeof data.result.name === "object" ? data.result.name[currentLang] || data.result.name.en : data.result.name,
          scientificName: data.result.scientificName || "",
          family: data.result.family || "",
          confidence: data.result.confidence,
          growingSeason: data.result.visibleCharacteristics || "",
          optimalSoil: data.result.suitableSoil || "",
          waterRequirement: data.result.waterRequirement || "",
          harvestCycle: data.result.sunlightRequirement || "",
        });
      } catch (historyError) {
        console.warn("Plant identification succeeded, but scan history could not be saved.", historyError);
      }
    } catch (err: unknown) {
      setResult(null);
      const msg = err instanceof Error ? err.message : "Failed to identify plant.";
      if (
        msg.includes("503") ||
        msg.includes("busy") ||
        msg.includes("high demand") ||
        msg.includes("temporarily unavailable")
      ) {
        setErrorMsg(
          "Plant identification is temporarily unavailable. The AI service is currently busy. Please try again in a few moments."
        );
      } else {
        setErrorMsg(msg);
      }
    } finally {
      window.clearInterval(stageInterval);
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
          className="h-8 px-2.5 text-xs font-bold bg-white text-emerald-900 border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-slate-900 dark:text-white dark:border-slate-700 cursor-pointer"
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
            accept="image/jpeg,image/png,image/webp"
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
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-2 rounded-full text-xs font-bold transition-all cursor-pointer"
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
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
              size="lg"
              onClick={() => setIsCameraOpen(true)}
              disabled={analyzing || processingImage}
            >
              <Camera className="h-5 w-5 mr-2" />
              Take Photo
            </Button>
            <Button
              variant="outline"
              className="flex-1 font-bold border-slate-300 cursor-pointer"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={analyzing || processingImage}
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Image
            </Button>
          </div>

          {selectedImage && (
            <Button
              onClick={handleIdentify}
              disabled={analyzing || processingImage}
              className="w-full py-6 text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/20 hover:from-emerald-500 hover:to-teal-500 cursor-pointer"
            >
              <Sparkles className="h-5 w-5 mr-2 animate-spin-slow" />
              {processingImage
                ? "Optimizing image…"
                : analyzing
                  ? LOADING_STAGES[loadingStage]
                  : "Identify Plant with AI"}
            </Button>
          )}

          {/* Validation & API Warning */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold space-y-3 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                <span className="flex-1 leading-relaxed">{errorMsg}</span>
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleIdentify}
                  disabled={analyzing}
                  className="bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 font-bold cursor-pointer shadow-sm"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", analyzing && "animate-spin")} />
                  Try Again
                </Button>
              </div>
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              If Gemini 3.5 Flash-Lite is busy or unavailable, Gemini 3.8 Flash is tried automatically.
            </p>
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
                {result.scientificName} • Family: {result.family || "Botanical"}
              </p>
            </div>
            <div className="text-right bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
              <span className="text-3xl font-black">{result.confidence}%</span>
              <p className="text-[10px] text-emerald-100 uppercase font-bold">Accuracy</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Description */}
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

            {/* Recommended Care */}
            {result.recommendedCare && (
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 dark:bg-blue-950/20 dark:border-blue-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Recommended Care & Growing Guidelines
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {result.recommendedCare}
                </p>
              </div>
            )}

            {/* Grid Attributes (All 10 required fields) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Sprout className="h-3.5 w-3.5 text-emerald-500" /> Visible Characteristics
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-1 dark:text-slate-200">
                  {result.visibleCharacteristics || "Leaf structure & flowering features"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-blue-500" /> Water Requirement
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-1 dark:text-slate-200">
                  {result.waterRequirement || "Moderate regular watering"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Sun className="h-3.5 w-3.5 text-amber-500" /> Sunlight Requirements
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-1 dark:text-slate-200">
                  {result.sunlightRequirement || "Full sunlight to partial shade"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-green-600" /> Suitable Soil
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-1 dark:text-slate-200">
                  {result.suitableSoil || "Well-drained fertile loamy soil"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Common Diseases
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-1 dark:text-slate-200">
                  {result.commonDiseases || "Pest infestations, leaf spot, rust"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Scissors className="h-3.5 w-3.5 text-emerald-500" /> Family & Category
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-1 dark:text-slate-200">
                  {result.family || "Botanical Species"}
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

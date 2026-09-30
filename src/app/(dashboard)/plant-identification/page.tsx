"use client";

import React, { useEffect, useState, useRef } from "react";
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
  CircleHelp,
  X,
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
  const [showHelp, setShowHelp] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { preferences, setPreference } = useLanguageStore();
  const { addPlantRecord } = useHistoryStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!showHelp) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowHelp(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showHelp]);

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
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setShowHelp(true)} aria-label="Plant ID and crop options help">
            <CircleHelp className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Help</span>
          </Button>
          <Link href="/plant-identification/history">
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">ID History</span>
            </Button>
          </Link>
        </div>
      </div>

      {showHelp && (
        <div
          className="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setShowHelp(false); }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="plant-id-help-title"
            className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-2xl border border-slate-700 bg-slate-950 p-5 text-white shadow-2xl sm:rounded-2xl sm:p-6"
          >
            <div className="sticky top-0 -mx-5 -mt-5 mb-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Farmer’s quick guide</p>
                <h2 id="plant-id-help-title" className="mt-1 text-lg font-bold">Plant ID and crop options</h2>
              </div>
              <button type="button" onClick={() => setShowHelp(false)} aria-label="Close help" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-5 text-sm leading-6 text-slate-300">Use these fields to identify a plant and keep its farm record useful throughout the growing season.</p>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-300"><Sprout className="h-4 w-4" /> Plant identification</h3>
                {[
                  ["Take Photo / Upload Image", "Use a clear, close photo of leaves, fruit, flowers, or the whole plant. For example, photograph a leaf in daylight without covering its spots."],
                  ["Plant Info Language", "Choose the language you want the identification and care guidance written in."],
                  ["Identify Plant with AI", "Starts an image analysis. Keep in mind that a photo-based suggestion is a guide; check uncertain results with a local agriculture expert."],
                  ["Confidence", "How sure the model is about the identification. A lower number means you should compare more photos or ask an expert."],
                  ["Scientific name / Family", "The plant’s formal botanical name and its related plant group; useful when common names differ by region."],
                  ["Visible characteristics", "What the photo appears to show, such as leaf shape, stem, flower, or color."],
                  ["Care, soil, water, sunlight, diseases", "General plant guidance from the analysis. Match it to your local season and soil; the AI may not know your exact field conditions."],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                    <h4 className="text-xs font-bold text-white">{title}</h4>
                    <p className="mt-1 text-xs leading-5 text-slate-300">{description}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-300"><BookOpen className="h-4 w-4" /> Crop management</h3>
                {[
                  ["Farm, crop and variety", "Select the land where the crop is growing. Add a variety (for example, Sona Masuri rice) when you know it."],
                  ["Planting / sowing date", "The date seed was sown or the young plant was established in the field. Crop age and reminders are based on this date."],
                  ["Annual or perennial", "Annual crops are generally harvested within one growing cycle. Perennials such as coconut or coffee keep growing and producing for multiple years."],
                  ["Establishment and maturity periods", "For a perennial, the establishment period is when it is settling in after planting; maturity is the expected time until regular production begins."],
                  ["First and recurring harvest", "For a perennial, optionally enter the first expected harvest and how often harvests usually recur. These are planning estimates, not a crop end date."],
                  ["Growth stage and crop age", "Stage describes current development (such as seedling or flowering). Age is calculated from the planting date."],
                  ["Area and water need", "Enter the portion of the farm planted with this crop and its general water demand. This is not a soil-moisture measurement."],
                  ["Care reminder intervals", "Choose how often to review irrigation, nutrients, disease, soil, pruning, and harvest. A reminder means ‘check’; it does not mean automatically apply anything."],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                    <h4 className="text-xs font-bold text-white">{title}</h4>
                    <p className="mt-1 text-xs leading-5 text-slate-300">{description}</p>
                  </div>
                ))}
                <Link href="/crops" onClick={() => setShowHelp(false)} className="inline-flex min-h-10 items-center rounded-lg px-1 text-sm font-bold text-emerald-300 hover:text-emerald-200">Open Crop Management →</Link>
              </div>
            </div>
          </section>
        </div>
      )}

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

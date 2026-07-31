"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  Camera,
  Scan,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Droplets,
  History,
  Languages,
  AlertCircle,
  Pill,
  Leaf,
  FlaskConical,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguageStore } from "@/stores/language-store";
import { useHistoryStore } from "@/stores/history-store";
import { useAuthStore } from "@/stores/auth-store";
import { SUPPORTED_LANGUAGES } from "@/lib/utils/constants";
import { CameraModal } from "@/components/shared/camera-modal";

const SCANNING_STAGES = [
  "Uploading Leaf Image...",
  "Analyzing Symptoms...",
  "Classifying Pathogen with Gemini AI...",
  "Generating Treatment Plan...",
];

export default function DiseaseDetectionPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { preferences, setPreference } = useLanguageStore();
  const { addDiseaseRecord } = useHistoryStore();
  const { user } = useAuthStore();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a clear leaf image (JPG, PNG, WEBP).");
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

  const handleScan = async () => {
    if (!selectedImage) {
      setErrorMsg("Please upload or capture a crop leaf image first.");
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);
    setStageIndex(0);

    const ticker = setInterval(() => {
      setStageIndex((prev) => (prev < SCANNING_STAGES.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await fetch("/api/ai/detect-disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage }),
      });

      clearInterval(ticker);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Disease detection failed.");
      }

      setResult(data.result);

      // Save to store history
      const diseaseNameStr = typeof data.result.disease === "object"
        ? data.result.disease.en || "Disease Detected"
        : data.result.disease;

      const symptomsStr = typeof data.result.symptoms === "object"
        ? data.result.symptoms.en || ""
        : data.result.symptoms || "";

      const organicStr = typeof data.result.treatment?.organic === "object"
        ? data.result.treatment?.organic?.en || ""
        : data.result.treatment?.organic || "";

      const chemicalStr = typeof data.result.treatment?.chemical === "object"
        ? data.result.treatment?.chemical?.en || ""
        : data.result.treatment?.chemical || "";

      addDiseaseRecord({
        userId: user?.uid,
        imageUrl: selectedImage,
        diseaseName: diseaseNameStr,
        confidence: data.result.confidence || 94,
        severity: data.result.severity || "medium",
        symptoms: symptomsStr,
        organicTreatment: organicStr,
        chemicalTreatment: chemicalStr,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to scan disease. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const currentLang = preferences.diseaseInfo || "en";

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
      case "high":
        return <Badge className="bg-rose-500 text-white font-bold uppercase">Critical Risk</Badge>;
      case "medium":
        return <Badge className="bg-amber-500 text-white font-bold uppercase">Moderate Concern</Badge>;
      default:
        return <Badge className="bg-emerald-500 text-white font-bold uppercase">Low Severity</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
            <Scan className="h-7 w-7 text-rose-600" />
            AI Disease Scanner
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Instant leaf disease classification and treatment plans powered by Gemini 2.5 Flash
          </p>
        </div>
        <Link href="/disease-detection/history">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-1" />
            Scan History
          </Button>
        </Link>
      </div>

      {/* Language Switcher */}
      <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3 flex items-center justify-between dark:bg-rose-950/30 dark:border-rose-900">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-900 dark:text-rose-300">
          <Languages className="h-4 w-4 text-rose-600" />
          <span>Diagnosis Language:</span>
        </div>
        <select
          value={currentLang}
          onChange={(e) => setPreference("diseaseInfo", e.target.value)}
          className="h-8 px-2.5 text-xs font-bold bg-white text-rose-900 border border-rose-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 dark:bg-slate-900 dark:text-white dark:border-slate-700"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload/Camera Card */}
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
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-rose-500 shadow-md">
              <img src={selectedImage} alt="Selected leaf" className="w-full h-full object-cover" />
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
            <div className="h-24 w-24 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-md dark:bg-rose-950/50 dark:text-rose-400">
              <Scan className="h-12 w-12 animate-pulse" />
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedImage ? "Leaf Photo Selected" : "Take or Upload Crop Leaf Photo"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              Ensure clear lighting and close-up view of infected spots or discolored leaves
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold"
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
              onClick={handleScan}
              disabled={analyzing}
              className="w-full py-6 text-base font-bold bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-900/20 hover:from-rose-500 hover:to-red-500"
            >
              <Sparkles className="h-5 w-5 mr-2 animate-spin-slow" />
              {analyzing ? SCANNING_STAGES[stageIndex] : "Scan Disease with AI"}
            </Button>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading Progress State */}
      {analyzing && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-lg dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-pulse">
          <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto dark:bg-rose-950/50">
            <Scan className="h-8 w-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {SCANNING_STAGES[stageIndex]}
            </h3>
            <div className="w-full bg-slate-100 rounded-full h-2 max-w-xs mx-auto overflow-hidden dark:bg-slate-800">
              <div
                className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((stageIndex + 1) / SCANNING_STAGES.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Results Display */}
      {result && !analyzing && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden animate-fade-in dark:bg-slate-900 dark:border-slate-800 space-y-0">
          <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-800 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                <ShieldAlert className="h-8 w-8 text-rose-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest text-rose-200 font-extrabold">
                    AI Diagnosis Result
                  </span>
                  {getSeverityBadge(result.severity)}
                </div>
                <h2 className="text-2xl font-black mt-1">
                  {typeof result.disease === "object" ? result.disease[currentLang] || result.disease.en : result.disease}
                </h2>
                {result.scientificName && (
                  <p className="text-xs text-rose-100 italic mt-0.5">{result.scientificName}</p>
                )}
              </div>
            </div>
            <div className="text-right bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
              <span className="text-3xl font-black">{result.confidence}%</span>
              <p className="text-[10px] text-rose-200 uppercase font-bold">Confidence</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Symptoms */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Identified Symptoms
              </h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 leading-relaxed font-medium">
                {typeof result.symptoms === "object" ? result.symptoms[currentLang] || result.symptoms.en : result.symptoms}
              </p>
            </div>

            {/* Immediate Action if provided */}
            {result.immediateAction && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl dark:bg-amber-950/30 dark:border-amber-900">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase flex items-center gap-1.5 mb-1">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Immediate Action Required Today
                </h4>
                <p className="text-xs text-amber-950 dark:text-amber-200 font-medium">
                  {result.immediateAction}
                </p>
              </div>
            )}

            {/* Treatment recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 dark:bg-emerald-950/30 dark:border-emerald-800 space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase dark:text-emerald-300 flex items-center gap-1.5">
                  <Leaf className="h-4 w-4 text-emerald-600" /> Organic Treatment
                </span>
                <p className="text-xs text-emerald-950 leading-relaxed dark:text-emerald-200 font-medium">
                  {typeof result.treatment?.organic === "object"
                    ? result.treatment.organic[currentLang] || result.treatment.organic.en
                    : result.treatment?.organic}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 dark:bg-blue-950/30 dark:border-blue-800 space-y-2">
                <span className="text-xs font-bold text-blue-800 uppercase dark:text-blue-300 flex items-center gap-1.5">
                  <FlaskConical className="h-4 w-4 text-blue-600" /> Chemical Solution
                </span>
                <p className="text-xs text-blue-950 leading-relaxed dark:text-blue-200 font-medium">
                  {typeof result.treatment?.chemical === "object"
                    ? result.treatment.chemical[currentLang] || result.treatment.chemical.en
                    : result.treatment?.chemical}
                </p>
              </div>
            </div>

            {/* Medicine Recommendation & Prevention */}
            {(result.medicineRecommendation || result.prevention) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                {result.medicineRecommendation && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Pill className="h-3.5 w-3.5 text-purple-500" /> Recommended Spray/Medicine
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-1 dark:text-slate-200">
                      {result.medicineRecommendation}
                    </p>
                  </div>
                )}

                {result.prevention && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Long-Term Prevention
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-1 dark:text-slate-200">
                      {typeof result.prevention === "object" ? result.prevention[currentLang] || result.prevention.en : result.prevention}
                    </p>
                  </div>
                )}
              </div>
            )}
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

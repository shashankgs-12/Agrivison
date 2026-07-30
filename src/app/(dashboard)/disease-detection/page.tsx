"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguageStore } from "@/stores/language-store";
import { SUPPORTED_LANGUAGES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";

export default function DiseaseDetectionPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { preferences, setPreference } = useLanguageStore();

  const handleSimulateScan = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        disease: {
          en: "Yellow Rust (Puccinia striiformis)",
          kn: "ಹಳದಿ ತುಕ್ಕು ರೋಗ",
          hi: "पीला रतुआ (येलो रस्ट)",
          te: "పసుపు తుప్పు తెగులు",
          ta: "மஞ்சள் துரு நோய்",
          ml: "മഞ്ഞ തുരുമ്പ് രോഗം",
        },
        confidence: 94,
        severity: "critical",
        symptoms: {
          en: "Bright yellow streaks of pustules on leaf blades, parallel to veins. Severe chlorosis and leaf drying.",
          kn: "ಎಲೆಯ ಅಂಚುಗಳಿಗೆ ಸಮಾನಾಂತರವಾಗಿ ಹಳದಿ ಪಟ್ಟಿಗಳ ಪ್ರತ್ಯಕ್ಷತೆ.",
          hi: "पत्तियों पर पीली धारियां और फफोले दिखना।",
          te: "ఆకులపై పసుపు చారలు మరియు బుడగలు రావడము.",
          ta: "இலைகளில் மஞ்சள் கோடுகள் காணப்படுதல்.",
          ml: "ഇലകളിൽ മഞ്ഞ വരകളും കുമിളകളും കാണപ്പെടുന്നു.",
        },
        treatment: {
          organic: {
            en: "Spray Neem Seed Kernel Extract (5%) or Trichoderma viride formulations at 10g/L water.",
            kn: "ಬೇೇವಿನ ಎಣ್ಣೆ (5%) ಅಥವಾ ಟ್ರೈಕೋಡರ್ಮಾ ಲೇಪನ ಉಪಯೋಗಿಸಿ.",
            hi: "नीम के तेल (5%) का छिड़काव करें या ट्राइकोडर्मा का प्रयोग करें।",
            te: "వేప నూనె (5%) లేదా ట్రైకోడెర్మా పిచికారీ చేయండి.",
            ta: "வேப்ப எண்ணெய் (5%) தெளிக்கவும்.",
            ml: "വേപ്പെണ്ണ (5%) തളിക്കുക.",
          },
          chemical: {
            en: "Spray Propiconazole 25% EC @ 1ml/L water or Tebuconazole 50% + Trifloxystrobin 25% WG.",
            kn: "ಪ್ರೊಪಿಕೊನಜೋಲ್ 25% EC (1ml/L) ಸಿಂಪಡಿಸಿ.",
            hi: "प्रोपीकोनाज़ोल 25% EC 1ml/लीटर पानी में घोलकर छिड़कें।",
            te: "ప్రోపికోనాజోల్ 25% EC ని పిచికారీ చేయండి.",
            ta: "புரோபிகோனசோல் 25% EC தெளிக்கவும்.",
            ml: "പ്രൊപ്പികൊനാസോൾ 25% EC പ്രയോഗിക്കുക.",
          },
        },
      });
    }, 2000);
  };

  const currentLang = preferences.diseaseInfo || "en";

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            AI Disease Scanner
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Instant crop disease identification powered by Gemini 2.5 Flash
          </p>
        </div>
        <Link href="/disease-detection/history">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4" />
            Scan History
          </Button>
        </Link>
      </div>

      {/* Per-Module Language Switcher */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center justify-between dark:bg-emerald-950/30 dark:border-emerald-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <Languages className="h-4 w-4 text-emerald-600" />
          <span>Disease Diagnosis Language:</span>
        </div>
        <select
          value={currentLang}
          onChange={(e) => setPreference("diseaseInfo", e.target.value)}
          className="h-8 px-2.5 text-xs font-bold bg-white text-emerald-900 border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-slate-900 dark:text-white dark:border-slate-700"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Camera / Upload Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 text-center dark:bg-slate-900 dark:border-slate-800">
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-20 w-20 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-md dark:bg-rose-950/50 dark:text-rose-400">
            <Scan className="h-10 w-10 animate-pulse-gentle" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Take or Upload Crop Leaf Photo
            </h3>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
              Ensure clear lighting and close-up view of infected spots or leaves
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              className="flex-1"
              size="lg"
              onClick={handleSimulateScan}
              disabled={analyzing}
            >
              <Camera className="h-5 w-5" />
              {analyzing ? "Scanning with AI..." : "Take Photo"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="lg"
              onClick={handleSimulateScan}
              disabled={analyzing}
            >
              <Upload className="h-5 w-5" />
              Upload Image
            </Button>
          </div>
        </div>
      </div>

      {/* Analysis Result */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg overflow-hidden animate-fade-in dark:bg-slate-900 dark:border-slate-800">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-600 to-red-600 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-8 w-8" />
              <div>
                <span className="text-xs uppercase tracking-wider text-rose-200 font-bold">
                  Diagnosis Result
                </span>
                <h2 className="text-xl font-bold">
                  {result.disease[currentLang] || result.disease.en}
                </h2>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black">{result.confidence}%</span>
              <p className="text-[10px] text-rose-200 uppercase font-bold">Confidence</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Symptoms */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Identified Symptoms
              </h4>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                {result.symptoms[currentLang] || result.symptoms.en}
              </p>
            </div>

            {/* Treatment recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 dark:bg-emerald-950/30 dark:border-emerald-800">
                <span className="text-xs font-bold text-emerald-800 uppercase dark:text-emerald-300">
                  🌱 Organic Treatment
                </span>
                <p className="text-xs text-emerald-950 mt-1.5 leading-relaxed dark:text-emerald-200">
                  {result.treatment.organic[currentLang] || result.treatment.organic.en}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 dark:bg-blue-950/30 dark:border-blue-800">
                <span className="text-xs font-bold text-blue-800 uppercase dark:text-blue-300">
                  🧪 Chemical Treatment
                </span>
                <p className="text-xs text-blue-950 mt-1.5 leading-relaxed dark:text-blue-200">
                  {result.treatment.chemical[currentLang] || result.treatment.chemical.en}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

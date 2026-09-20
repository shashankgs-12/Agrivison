"use client";

import React, { useState } from "react";
import { Download, Sprout, ShieldAlert, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useFarms } from "@/hooks/use-farms";
import { useCrops } from "@/hooks/use-crops";
import { useDiseaseRecords } from "@/hooks/use-history";

export default function ReportsPage() {
  const { user } = useAuthStore();
  const { farms } = useFarms();
  const { crops } = useCrops();
  const { diseaseRecords } = useDiseaseRecords();
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const totalArea = farms.reduce((acc, f) => acc + (f.area || 0), 0);

  const triggerDownload = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Generate full summary text document & trigger download
    const dateStr = new Date().toLocaleDateString();
    let text = `====================================================\n`;
    text += `AGRIVISION.AI - COMPREHENSIVE AGRICULTURAL REPORT\n`;
    text += `Generated Date: ${dateStr}\n`;
    text += `Farmer Name: ${user?.name || "Farmer"}\n`;
    text += `Email: ${user?.email || "N/A"}\n`;
    text += `Location: ${user?.location || "Mandya District, KA"}\n`;
    text += `====================================================\n\n`;

    text += `1. FARM & LAND SUMMARY\n`;
    text += `Total Registered Farms: ${farms.length}\n`;
    text += `Total Cultivated Area: ${totalArea.toFixed(2)} Acres\n`;
    text += `Active Registered Crops: ${crops.length}\n\n`;

    if (farms.length > 0) {
      farms.forEach((f, idx) => {
        text += `   [Farm #${idx + 1}] ${f.name} - Location: ${f.location || "N/A"}, Area: ${f.area} Acres, Soil: ${f.soilType || "N/A"}\n`;
      });
      text += `\n`;
    }

    text += `2. CROP INVENTORY\n`;
    if (crops.length > 0) {
      crops.forEach((c, idx) => {
        text += `   [Crop #${idx + 1}] ${c.name} (Variety: ${c.variety || "Standard"}) - Health: ${c.health || "Good"}\n`;
      });
      text += `\n`;
    } else {
      text += `   No active crops recorded.\n\n`;
    }

    text += `3. DISEASE AUDIT LOG & HEALTH HISTORY\n`;
    text += `Total AI Scans Conducted: ${diseaseRecords.length}\n`;
    if (diseaseRecords.length > 0) {
      diseaseRecords.forEach((d, idx) => {
        text += `   [Scan #${idx + 1}] Date: ${new Date(d.timestamp).toLocaleDateString()} | Disease: ${d.diseaseName} (${d.confidence}% Confidence) | Severity: ${d.severity}\n`;
        text += `            Organic: ${d.organicTreatment} | Chemical: ${d.chemicalTreatment}\n`;
      });
    } else {
      text += `   No disease scans recorded yet.\n`;
    }

    triggerDownload(`AgriVision_Summary_Report_${Date.now()}.txt`, text, "text/plain");
    setDownloadMsg("Full summary report downloaded successfully!");
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  const handleDownloadYieldProjections = () => {
    let csv = "Farm ID,Farm Name,Location,Area (Acres),Soil Type,Estimated Yield (Tons),Crop Count\n";
    if (farms.length === 0) {
      csv += "SAMPLE-1,Green Field Demo,Mandya KA,5.0,Loamy Soil,12.5,2\n";
    } else {
      farms.forEach((f) => {
        const estYield = ((f.area || 1) * 2.5).toFixed(1);
        csv += `"${f.id}","${f.name}","${f.location || 'N/A'}",${f.area || 0},"${f.soilType || 'N/A'}",${estYield},${crops.length}\n`;
      });
    }

    triggerDownload(`Yield_Projections_${Date.now()}.csv`, csv, "text/csv");
    setDownloadMsg("Yield Projections CSV downloaded!");
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  const handleDownloadAuditLog = () => {
    let csv = "Scan ID,Date,Disease Name,Confidence (%),Severity,Crop Name,Organic Treatment,Chemical Treatment\n";
    if (diseaseRecords.length === 0) {
      csv += "SCAN-001,2026-09-20,Healthy Paddy Leaf,98,Normal,Paddy,Apply neem oil spray,Maintain balanced nitrogen fertilization\n";
    } else {
      diseaseRecords.forEach((d) => {
        csv += `"${d.id}","${new Date(d.timestamp).toLocaleDateString()}","${d.diseaseName}",${d.confidence},"${d.severity}","${d.cropName || 'Crop'}","${d.organicTreatment}","${d.chemicalTreatment}"\n`;
      });
    }

    triggerDownload(`Disease_Audit_Log_${Date.now()}.csv`, csv, "text/csv");
    setDownloadMsg("Disease Audit Log CSV downloaded!");
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            Agricultural Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Export farm yields, disease detection history, and irrigation summaries for {user?.name || "Farmer"}
          </p>
        </div>
        <Button
          onClick={handleExportPDF}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Export PDF / Summary
        </Button>
      </div>

      {downloadMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{downloadMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Farm & Crop Yield Report */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950/50">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Farm & Crop Summary</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Active Land & Registered Crops</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
            {farms.length > 0
              ? `Registered ${farms.length} farm(s) covering ${totalArea.toFixed(1)} Acres with ${crops.length} active crop(s).`
              : `No farms registered yet. Add your first farm to generate personalized yield reports.`}
          </p>
          <Button
            onClick={handleDownloadYieldProjections}
            variant="outline"
            size="sm"
            className="w-full font-bold cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/40"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download Yield Projections
          </Button>
        </div>

        {/* Disease & Health Audit Log */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center dark:bg-rose-950/50">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Disease Audit Log</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{diseaseRecords.length} AI scan(s) logged</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
            {diseaseRecords.length > 0
              ? `Logged ${diseaseRecords.length} leaf scan diagnosis record(s) with custom treatment and medicine recommendations.`
              : `No disease scans logged yet. Perform AI leaf scanning to populate your health audit log.`}
          </p>
          <Button
            onClick={handleDownloadAuditLog}
            variant="outline"
            size="sm"
            className="w-full font-bold cursor-pointer hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:hover:bg-rose-950/40"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download Audit Log
          </Button>
        </div>
      </div>
    </div>
  );
}


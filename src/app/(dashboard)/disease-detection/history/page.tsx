"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Scan, History, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useDiseaseRecords } from "@/hooks/use-history";
import { useAuthStore } from "@/stores/auth-store";

export default function DiseaseHistoryPage() {
  const { user } = useAuthStore();
  const { diseaseRecords, deleteDiseaseRecord: deleteRecord } = useDiseaseRecords();

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

      {diseaseRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-md dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto dark:bg-rose-950/50">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Disease Scans Recorded
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You haven&apos;t performed any disease scans yet. Upload a crop leaf image to receive immediate AI diagnosis and treatment plans.
            </p>
          </div>
          <Link href="/disease-detection">
            <Button className="bg-rose-600 hover:bg-rose-500 text-white font-bold">
              <Scan className="h-4 w-4 mr-2" />
              Scan Leaf Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {diseaseRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                {record.imageUrl ? (
                  <img
                    src={record.imageUrl}
                    alt={record.diseaseName}
                    className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center dark:bg-rose-950">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {record.diseaseName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Severity: <span className="font-semibold uppercase">{record.severity}</span> · {new Date(record.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full dark:bg-rose-950">
                  {record.confidence}% Confidence
                </span>
                <button
                  onClick={() => deleteRecord(record.id)}
                  className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, History } from "lucide-react";
import { Button } from "@/components/ui/button";

import { usePlantRecords } from "@/hooks/use-history";
import { useAuthStore } from "@/stores/auth-store";

export default function PlantHistoryPage() {
  const { user } = useAuthStore();
  const { plantRecords, deletePlantRecord: deleteRecord } = usePlantRecords();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/plant-identification">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            Plant Identification History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Previously identified plant species and saved crop guides
          </p>
        </div>
      </div>

      {plantRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-md dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto dark:bg-emerald-950/50">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Plant History Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You haven&apos;t identified any plants yet. Upload or take a plant photo to get instant AI botanical insights.
            </p>
          </div>
          <Link href="/plant-identification">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
              <Sparkles className="h-4 w-4 mr-2" />
              Identify Plant Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {plantRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                {record.imageUrl ? (
                  <img
                    src={record.imageUrl}
                    alt={record.plantName}
                    className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center dark:bg-emerald-950">
                    <Sparkles className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {record.plantName} ({record.scientificName})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Family: {record.family || "Botanical"} · {new Date(record.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full dark:bg-emerald-950">
                  {record.confidence}% Accuracy
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

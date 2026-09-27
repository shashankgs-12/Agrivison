"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Droplets, ShieldCheck, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCrops } from "@/hooks/use-crops";

function getProgress(sowingDate: string, harvestDate: string) {
  const start = Date.parse(sowingDate);
  const end = Date.parse(harvestDate);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;

  return Math.round(Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100)));
}

export default function CropDetailsPage() {
  const { cropId } = useParams<{ cropId: string }>();
  const { crops } = useCrops();
  const crop = crops.find((item) => item.id === cropId);

  if (!crop) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-12 text-center">
        <Sprout className="mx-auto h-12 w-12 text-slate-400" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Crop Not Found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This crop may have been removed or belongs to another account.
        </p>
        <Link href="/crops">
          <Button variant="outline">Back to Crops</Button>
        </Link>
      </div>
    );
  }

  const progress = getProgress(crop.sowingDate, crop.expectedHarvest);

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/crops">
          <Button variant="ghost" size="sm" aria-label="Back to crops">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {crop.name}{crop.variety ? ` (${crop.variety})` : ""}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{crop.farmName}</p>
        </div>
        <Badge className="ml-auto">{crop.health}</Badge>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900 dark:text-white">Crop Growth Timeline</h2>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {crop.growthStage}
          </span>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          role="progressbar"
          aria-label="Crop growth timeline"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-right text-xs text-slate-500 dark:text-slate-400">{progress}% of growing period</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <CalendarDays className="h-4 w-4 text-emerald-600" /> Planting Schedule
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Sowing date</dt><dd className="font-semibold">{crop.sowingDate}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Expected harvest</dt><dd className="font-semibold">{crop.expectedHarvest}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Area</dt><dd className="font-semibold">{crop.area} acres</dd></div>
          </dl>
        </section>
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Droplets className="h-4 w-4 text-sky-600" /> Crop Health
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Water need</dt><dd className="font-semibold">{crop.waterNeed}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Health</dt><dd className="font-semibold">{crop.health}</dd></div>
            <div className="flex items-start justify-between gap-3"><dt className="flex items-center gap-1 text-slate-500"><ShieldCheck className="h-4 w-4" /> Disease status</dt><dd className="text-right font-semibold">{crop.diseaseStatus || "Healthy"}</dd></div>
          </dl>
        </section>
      </div>
    </div>
  );
}

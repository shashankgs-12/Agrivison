"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Droplets, ShieldCheck, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCrops } from "@/hooks/use-crops";
import { getCropCareReminders, getCropLifecycleInfo } from "@/lib/crops/lifecycle";

export default function CropDetailsPage() {
  const { cropId } = useParams<{ cropId: string }>();
  const { crops, loading, error } = useCrops();
  const crop = crops.find((item) => item.id === cropId);

  if (!crop) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-12 text-center">
        <Sprout className="mx-auto h-12 w-12 text-slate-400" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{loading ? "Loading crop…" : "Crop Not Found"}</h1>
        {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This crop may have been removed or belongs to another account.
        </p>
        <Link href="/crops">
          <Button variant="outline">Back to Crops</Button>
        </Link>
      </div>
    );
  }

  const lifecycle = getCropLifecycleInfo(crop);
  const reminders = getCropCareReminders(crop);
  const isPerennial = lifecycle.lifecycleType === "PERENNIAL";

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
        <Badge className="ml-auto">{crop.health || "Health not recorded"}</Badge>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900 dark:text-white">Crop Growth Timeline</h2>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {lifecycle.stage}
          </span>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          role="progressbar"
          aria-label={isPerennial ? "Progress to maturity" : "Crop cycle progress"}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={lifecycle.progress}
        >
          <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${lifecycle.progress}%` }} />
        </div>
        <p className="mt-2 text-right text-xs text-slate-500 dark:text-slate-400">{lifecycle.progress}% {isPerennial ? "of maturity period · crop remains active after maturity" : "of crop cycle"}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <CalendarDays className="h-4 w-4 text-emerald-600" /> Planting Schedule
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Sowing date</dt><dd className="font-semibold">{crop.sowingDate}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Crop age</dt><dd className="font-semibold">{lifecycle.ageLabel}</dd></div>
            {isPerennial ? (
              <>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Lifecycle</dt><dd className="font-semibold">Perennial · active</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Establishment period</dt><dd className="font-semibold">{crop.establishmentPeriodMonths ?? 12} months</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Maturity period</dt><dd className="font-semibold">{crop.maturityPeriodMonths ?? 36} months</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">First expected harvest</dt><dd className="font-semibold">{crop.firstExpectedHarvest || "Not set"}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Recurring harvest</dt><dd className="font-semibold">Every {crop.harvestIntervalMonths ?? 12} months</dd></div>
              </>
            ) : (
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Expected harvest</dt><dd className="font-semibold">{crop.expectedHarvest || "Not set"}</dd></div>
            )}
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Area</dt><dd className="font-semibold">{crop.area} acres</dd></div>
          </dl>
        </section>
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Droplets className="h-4 w-4 text-sky-600" /> Crop Health
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Water need</dt><dd className="font-semibold">{crop.waterNeed}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Health</dt><dd className="font-semibold">{crop.health || "Not recorded"}</dd></div>
            <div className="flex items-start justify-between gap-3"><dt className="flex items-center gap-1 text-slate-500"><ShieldCheck className="h-4 w-4" /> Disease status</dt><dd className="text-right font-semibold">{crop.diseaseStatus || "Not recorded"}</dd></div>
          </dl>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Recurring care and harvest reminders</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Review these schedules and adjust them to the crop variety, season, and local agronomy guidance.</p>
          </div>
          <Badge>{lifecycle.status}</Badge>
        </div>
        {isPerennial && (
          <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs leading-relaxed text-sky-900 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200">
            Keep this planting active after its first harvest. At each season change, review local irrigation needs, soil moisture and drainage, weed or mulch cover, and pest or disease signs. Review nutrients against soil-test guidance, and schedule pruning and harvest checks for this crop variety.
          </div>
        )}
        {reminders.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {reminders.map((reminder) => (
              <div key={reminder.activity} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{reminder.activity}</h3>
                  <span className="shrink-0 text-xs font-bold text-emerald-700 dark:text-emerald-300">{reminder.nextDue}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{reminder.recommendation}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate-500">Add a planting date to calculate reminders.</p>}
      </section>
    </div>
  );
}

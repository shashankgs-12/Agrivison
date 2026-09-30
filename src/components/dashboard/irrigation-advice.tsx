"use client";

import React from "react";
import { Droplets, Plus, MapPin, Sprout, FlaskConical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFarms } from "@/hooks/use-farms";
import { useCrops } from "@/hooks/use-crops";
import { useWeatherStore } from "@/stores/weather-store";
import { getCropLifecycleInfo } from "@/lib/crops/lifecycle";
import { useLanguage } from "@/hooks/use-language";
import { getDashboardText } from "@/lib/i18n/localization";

export function IrrigationAdvice() {
  const { farms } = useFarms();
  const { crops } = useCrops();
  const { weather } = useWeatherStore();
  const { language } = useLanguage();
  const copy = getDashboardText(language);
  const liveWeather = weather?.source === "live" ? weather : null;

  if (farms.length === 0 || crops.length === 0) {
    const needsFarm = farms.length === 0;
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          {needsFarm ? <MapPin className="h-5 w-5 text-emerald-500" /> : <Sprout className="h-5 w-5 text-emerald-500" />}
          {copy.irrigation}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{needsFarm ? copy.addFarmBeforeAdvice : copy.registerCropForAdvice}</p>
        <Link href={needsFarm ? "/farms/add" : "/crops"} className="inline-block pt-1">
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />{needsFarm ? copy.addFarm : copy.addCrop}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-3 border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Droplets className="h-5 w-5 text-blue-500" /><h3 className="text-sm font-bold text-slate-900 dark:text-white">{copy.irrigation}</h3></div>
          <Link href="/irrigation" className="text-xs font-bold text-blue-600 hover:underline">{copy.getAiAdvice}</Link>
        </div>
        <div className={`rounded-xl border p-3 text-xs ${liveWeather ? "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200" : "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"}`}>
          <p className="font-bold">{liveWeather ? copy.liveWeatherAvailable : copy.noLiveWeather}</p>
          <p className="mt-1 leading-5">{liveWeather
            ? copy.forecastRain.replace("{rain}", String(liveWeather.rainProbability)).replace("{moisture}", liveWeather.soilMoisture === null ? "—" : liveWeather.soilMoisture.toFixed(2))
            : copy.noSensor}</p>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between pb-1 text-xs font-bold text-slate-700 dark:text-slate-300"><span>{copy.registeredCrops}</span><Link href="/fertilizer" className="flex items-center gap-1 text-emerald-600 hover:underline"><FlaskConical className="h-3.5 w-3.5" />{copy.fertilizerAi}</Link></div>
        {crops.slice(0, 3).map((crop) => {
          const stage = getCropLifecycleInfo(crop);
          return (
            <div key={crop.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-slate-800">
              <div><p className="font-bold text-slate-800 dark:text-slate-200">{crop.name}</p><p className="text-[10px] font-medium text-slate-500">{stage.ageLabel} · {stage.stage} · {crop.waterNeed} {copy.cropWaterNeed}</p></div>
              <span className="shrink-0 text-[10px] font-semibold text-slate-500">{copy.adviceOnPage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

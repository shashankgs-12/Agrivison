"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  CloudSun,
  Droplets,
  FlaskConical,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrops } from "@/hooks/use-crops";
import { useFarms } from "@/hooks/use-farms";
import { useDiseaseRecords } from "@/hooks/use-history";
import { getCropLifecycleInfo } from "@/lib/crops/lifecycle";
import { useLanguage } from "@/hooks/use-language";
import { getUiText } from "@/lib/i18n/localization";
import type { DetailedWeatherData } from "@/lib/weather/api";
import type { Crop } from "@/stores/crop-store";

type AdvisorType = "irrigation" | "fertilizer";
type AdvisorWeather = Pick<DetailedWeatherData,
  "source" | "temperature" | "humidity" | "windSpeed" | "rainProbability" |
  "condition" | "soilMoisture" | "daily" | "latitude" | "longitude" | "lastUpdated"
>;

type IrrigationRecommendation = {
  action: "IRRIGATE_NOW" | "WAIT" | "REDUCE" | "INCREASE" | "INSUFFICIENT_DATA";
  headline: string;
  recommendation: string;
  why: string;
  timing: string;
  amountGuidance: string;
  missingData: string[];
};

type FertilizerRecommendation = {
  nutrientFocus: string;
  recommendation: string;
  timing: string;
  applicationGuidance: string;
  why: string;
  diseaseConsideration: string;
  caution: string;
  missingData: string[];
};

type Recommendation = IrrigationRecommendation | FertilizerRecommendation;

function normalizedName(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function getDiseaseContext(crop: Crop, records: ReturnType<typeof useDiseaseRecords>["diseaseRecords"]) {
  return records
    .filter((record) => record.cropId === crop.id || (!record.cropId && record.cropName && normalizedName(record.cropName) === normalizedName(crop.name)))
    .sort((first, second) => Date.parse(second.timestamp) - Date.parse(first.timestamp))
    .slice(0, 5);
}

function getMissingInputs(crop: Crop, farm: ReturnType<typeof useFarms>["farms"][number], weather: AdvisorWeather | null, diseaseCount: number) {
  const missing: string[] = [];
  if (!weather) missing.push("Live weather and rainfall forecast for this farm are unavailable.");
  if (!farm.soilType && !crop.soilType) missing.push("Soil type or a recent soil test is not recorded.");
  if (!weather || weather.source !== "live") missing.push("Live field weather and rainfall forecast are unavailable.");
  else {
    if (weather.soilMoisture === null) missing.push("The weather provider has no soil-moisture estimate for this location, and no field sensor reading is stored.");
    else missing.push("No on-field soil-moisture sensor reading or crop/soil-specific moisture threshold is stored; the provider's value is a modelled volumetric estimate.");
    if (weather.daily.length < 3) missing.push("A complete multi-day rainfall forecast is unavailable.");
  }
  missing.push("No recent irrigation log is stored for this crop.");
  missing.push("No previous fertilizer application log is stored for this crop.");
  if (diseaseCount === 0 && (!crop.diseaseStatus || normalizedName(crop.diseaseStatus) === "healthy")) {
    missing.push("No disease scan is linked to this crop.");
  }
  if (!farm.location.trim()) missing.push("A farm location description is not recorded.");
  return missing;
}

interface AgronomyAdvisorProps {
  type: AdvisorType;
}

export function AgronomyAdvisor({ type }: AgronomyAdvisorProps) {
  const { language } = useLanguage();
  const copy = getUiText(language).advisor;
  const { farms } = useFarms();
  const { crops } = useCrops();
  const { diseaseRecords } = useDiseaseRecords();
  const [selectedCropId, setSelectedCropId] = useState(() => crops[0]?.id ?? "");
  const [fieldWeather, setFieldWeather] = useState<AdvisorWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [missingInputs, setMissingInputs] = useState<string[]>([]);

  const crop = crops.find((item) => item.id === selectedCropId) ?? crops[0] ?? null;
  const farm = crop ? farms.find((item) => item.id === crop.farmId) ?? null : null;
  const lifecycle = crop ? getCropLifecycleInfo(crop) : null;
  const linkedDiseaseRecords = crop ? getDiseaseContext(crop, diseaseRecords) : [];
  const title = type === "irrigation" ? copy.irrigation : copy.fertilizer;
  const Icon = type === "irrigation" ? Droplets : FlaskConical;

  const handleCropChange = (cropId: string) => {
    setSelectedCropId(cropId);
    setFieldWeather(null);
    setWeatherError(null);
    setRecommendation(null);
    setError(null);
    setMissingInputs([]);
  };

  const loadFieldWeather = async (selectedFarm = farm) => {
    if (!selectedFarm) return null;
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const response = await fetch(
        `/api/weather?lat=${encodeURIComponent(String(selectedFarm.coordinates.lat))}&lng=${encodeURIComponent(String(selectedFarm.coordinates.lng))}`,
        { signal: AbortSignal.timeout(20_000) }
      );
      const payload = await response.json() as { success?: boolean; weather?: AdvisorWeather; error?: string };
      if (!response.ok || !payload.success || !payload.weather) {
        throw new Error(payload.error || "Could not load weather for this farm.");
      }
      if (payload.weather.source !== "live") {
        setFieldWeather(null);
      setWeatherError(copy.liveWeatherPending);
        return null;
      }
      setFieldWeather(payload.weather);
      return payload.weather;
    } catch {
      setFieldWeather(null);
      setWeatherError(copy.liveWeatherPending);
      return null;
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!crop || !farm || !lifecycle) {
      setError(copy.inputError);
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendation(null);
    let weather = fieldWeather;
    if (!weather || Math.abs(weather.latitude - farm.coordinates.lat) > 0.02 || Math.abs(weather.longitude - farm.coordinates.lng) > 0.02) {
      weather = await loadFieldWeather(farm);
    }

    const records = getDiseaseContext(crop, diseaseRecords);
    const gaps = getMissingInputs(crop, farm, weather, records.length);
    const context = {
      crop: {
        id: crop.id,
        name: crop.name,
        variety: crop.variety || null,
        lifecycleType: crop.lifecycleType ?? "ANNUAL",
        plantingDate: crop.sowingDate,
        ageMonths: lifecycle.ageMonths,
        growthStage: lifecycle.stage,
        waterNeed: crop.waterNeed,
        areaAcres: crop.area,
      },
      farm: {
        name: farm.name,
        location: farm.location,
        latitude: farm.coordinates.lat,
        longitude: farm.coordinates.lng,
        soilType: crop.soilType || farm.soilType || null,
        waterSource: farm.waterSource || null,
      },
      weather: weather?.source === "live" ? {
        temperatureC: weather.temperature,
        humidityPercent: weather.humidity,
        windKmh: weather.windSpeed,
        rainfallProbabilityPercent: weather.rainProbability,
        condition: weather.condition,
        modelledSoilMoistureM3PerM3: weather.soilMoisture,
        forecast: weather.daily.slice(0, 7).map((day) => ({
          date: day.date,
          precipitationMm: day.precipitation,
          rainProbabilityPercent: day.rainProb,
        })),
      } : null,
      diseaseRecords: records.map((record) => ({
        diseaseName: record.diseaseName,
        severity: record.severity,
        confidence: record.confidence,
        date: record.timestamp,
      })),
      recordedDiseaseStatus: crop.diseaseStatus && normalizedName(crop.diseaseStatus) !== "healthy" ? crop.diseaseStatus : null,
      soilTestAvailable: false,
      irrigationHistoryAvailable: false,
      fertilizerHistoryAvailable: false,
      missingInputs: gaps,
    };

    try {
      const response = await fetch("/api/ai/agronomy-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, context, language }),
        signal: AbortSignal.timeout(60_000),
      });
      const payload = await response.json() as { success?: boolean; recommendation?: Recommendation; error?: string; fields?: string[] };
      if (!response.ok || !payload.success || !payload.recommendation) {
        const invalidFields = payload.fields?.length
          ? ` (${payload.fields.map((field) => field.split(".").at(-1)?.replace(/([A-Z])/g, " $1").toLowerCase() ?? field).join(", ")})`
          : "";
        throw new Error(response.status === 400 ? `${copy.inputError}${invalidFields}` : copy.tryAgainNetwork);
      }
      setMissingInputs(payload.recommendation.missingData);
      setRecommendation(payload.recommendation);
    } catch (requestError) {
      setError(requestError instanceof Error && requestError.name === "TimeoutError"
        ? copy.tryAgainNetwork
        : requestError instanceof Error
          ? requestError.message
          : copy.tryAgainNetwork);
    } finally {
      setLoading(false);
    }
  };

  if (farms.length === 0 || crops.length === 0) {
    const needsFarm = farms.length === 0;
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><Icon className="h-7 w-7 text-emerald-400" />{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{copy.description}</p>
        </header>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          {needsFarm ? <MapPin className="mx-auto h-10 w-10 text-emerald-400" /> : <Sprout className="mx-auto h-10 w-10 text-emerald-400" />}
          <h2 className="mt-3 text-lg font-bold text-white">{needsFarm ? copy.addFarm : copy.registerCrop}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{needsFarm ? copy.addFarmDetail : copy.registerCropDetail}</p>
          <Link href={needsFarm ? "/farms/add" : "/crops"} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-500">{needsFarm ? copy.addFarm : copy.registerCrop}</Link>
        </div>
      </div>
    );
  }

  if (!crop || !farm || !lifecycle) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300">
        {copy.noFarmLink} <Link href="/crops" className="font-bold text-emerald-400 underline">Crop Management</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><Icon className="h-7 w-7 text-emerald-400" />{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{copy.description}</p>
        </div>
        <Link href={type === "irrigation" ? "/fertilizer" : "/irrigation"} className="text-sm font-bold text-emerald-400 hover:text-emerald-300">
          {type === "irrigation" ? copy.openFertilizer : copy.openIrrigation}
        </Link>
      </header>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg sm:p-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <label htmlFor={`${type}-crop`} className="mb-2 block text-sm font-bold text-white">{copy.chooseCrop}</label>
            <select
              id={`${type}-crop`}
              value={crop.id}
              onChange={(event) => handleCropChange(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            >
            {crops.map((item) => <option key={item.id} value={item.id}>{item.name}{item.variety ? ` · ${item.variety}` : ""} — {item.farmName || farms.find((itemFarm) => itemFarm.id === item.farmId)?.name || "Farm"}</option>)}
            </select>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-800 px-3 py-1.5 text-slate-200">{crop.name}{crop.variety ? ` · ${crop.variety}` : ""}</span>
              <span className="rounded-full bg-slate-800 px-3 py-1.5 text-slate-200">{lifecycle.ageLabel} · {lifecycle.stage}</span>
                <span className="rounded-full bg-slate-800 px-3 py-1.5 text-slate-200">{crop.area} acres · {crop.waterNeed} water need</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-white"><MapPin className="h-4 w-4 text-emerald-400" />{farm.name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{farm.location || `${farm.coordinates.lat.toFixed(4)}, ${farm.coordinates.lng.toFixed(4)}`}</p>
                <p className="mt-1 text-xs text-slate-500">{copy.soil}: {crop.soilType || farm.soilType || copy.notRecorded} · {copy.waterSource}: {farm.waterSource || copy.notRecorded}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => loadFieldWeather()} disabled={weatherLoading} aria-label="Refresh selected farm weather">
                {weatherLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="hidden sm:inline">{copy.refreshWeather}</span>
              </Button>
            </div>
            {fieldWeather ? (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <span className="rounded-lg bg-slate-900 p-2 text-slate-300">{fieldWeather.temperature}°C · {fieldWeather.condition}</span>
                <span className="rounded-lg bg-slate-900 p-2 text-slate-300">Rain {fieldWeather.rainProbability}%</span>
                <span className="rounded-lg bg-slate-900 p-2 text-slate-300">Humidity {fieldWeather.humidity}%</span>
                <span className="rounded-lg bg-slate-900 p-2 text-slate-300">Soil model {fieldWeather.soilMoisture === null ? "unavailable" : `${fieldWeather.soilMoisture.toFixed(2)} m³/m³`}</span>
              </div>
            ) : (
              <p className="mt-3 flex items-center gap-2 text-xs text-amber-300"><CloudSun className="h-4 w-4 shrink-0" />{copy.liveWeatherPending}</p>
            )}
            {weatherError && <p role="status" className="mt-2 text-xs text-amber-200">{weatherError}</p>}
          </div>
        </div>

        {type === "fertilizer" && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
            <p className="font-bold text-white">{copy.diseaseContext}</p>
            {linkedDiseaseRecords.length > 0 ? (
              <ul className="mt-2 space-y-1">{linkedDiseaseRecords.map((record) => <li key={record.id}>{record.diseaseName} · {record.severity} severity · {new Date(record.timestamp).toLocaleDateString()}</li>)}</ul>
            ) : (
              <p className="mt-1">{copy.noDisease} {crop.name}. To link a future scan, select this crop on the Disease Scanner before scanning.</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-xs leading-5 text-slate-400">{copy.safetyIntro}</p>
          <Button type="button" onClick={handleGenerate} disabled={loading} className="w-full sm:w-auto">
            {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" /> {copy.loading}</> : <><Icon className="h-4 w-4" /> {copy.generate}</>}
          </Button>
        </div>
      </section>

      {loading && (
        <div role="status" className="flex items-center gap-3 rounded-2xl border border-emerald-900/70 bg-emerald-950/30 p-5 text-sm text-emerald-100">
          <LoaderCircle className="h-5 w-5 animate-spin text-emerald-400" /> {copy.loadingDetail}
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-200 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={handleGenerate}>{copy.retry}</Button>
        </div>
      )}

      {recommendation && !loading && (
        <section className="space-y-4 rounded-2xl border border-emerald-900/70 bg-slate-900 p-5 shadow-xl sm:p-6" aria-live="polite">
          {type === "irrigation" ? (() => {
            const advice = recommendation as IrrigationRecommendation;
            const positive = advice.action === "WAIT" || advice.action === "REDUCE";
            return <>
              <div className="flex items-start gap-3">
                {positive ? <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" /> : <Droplets className="mt-0.5 h-6 w-6 shrink-0 text-blue-300" />}
                <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-300">{copy.recommendation} · {crop.name}</p><h2 className="mt-1 text-xl font-black text-white">{advice.headline}</h2></div>
              </div>
              <p className="text-sm leading-6 text-slate-200">{advice.recommendation}</p>
              <div className="grid gap-3 md:grid-cols-3">
                <AdviceDetail title={copy.why} text={advice.why} />
                <AdviceDetail title={copy.when} text={advice.timing} />
                <AdviceDetail title={copy.amount} text={advice.amountGuidance} />
              </div>
            </>;
          })() : (() => {
            const advice = recommendation as FertilizerRecommendation;
            return <>
              <div className="flex items-start gap-3"><FlaskConical className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" /><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-300">{copy.recommendation} · {crop.name}</p><h2 className="mt-1 text-xl font-black text-white">{advice.nutrientFocus}</h2></div></div>
              <p className="text-sm leading-6 text-slate-200">{advice.recommendation}</p>
              <div className="grid gap-3 md:grid-cols-2"><AdviceDetail title={copy.why} text={advice.why} /><AdviceDetail title={copy.timing} text={advice.timing} /><AdviceDetail title={copy.application} text={advice.applicationGuidance} /><AdviceDetail title={copy.disease} text={advice.diseaseConsideration} /></div>
              <div className="rounded-xl border border-amber-700/70 bg-amber-950/30 p-3 text-xs leading-5 text-amber-100"><strong>{copy.safety}:</strong> {advice.caution}</div>
            </>;
          })()}
          {missingInputs.length > 0 && (
            <div className="rounded-xl border border-amber-900/70 bg-amber-950/20 p-3">
              <p className="text-xs font-bold text-amber-200">{copy.missing}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-5 text-amber-100/90">{missingInputs.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          )}
          <p className="text-[11px] text-slate-500">{copy.verify}</p>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white"><Sprout className="h-5 w-5 text-emerald-400" />{copy.registeredCrops}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {crops.map((item) => {
            const stage = getCropLifecycleInfo(item);
            return <button key={item.id} type="button" onClick={() => handleCropChange(item.id)} className={`min-h-[92px] rounded-2xl border p-4 text-left transition-colors ${item.id === crop.id ? "border-emerald-600 bg-emerald-950/20" : "border-slate-800 bg-slate-900 hover:border-slate-600"}`}>
              <span className="block font-bold text-white">{item.name}{item.variety ? ` · ${item.variety}` : ""}</span>
              <span className="mt-1 block text-xs text-slate-400">{stage.ageLabel} · {stage.stage} · {item.waterNeed} water need</span>
              <span className="mt-1 block text-xs text-slate-500">{item.farmName || farms.find((itemFarm) => itemFarm.id === item.farmId)?.name || "Farm not found"} · {item.area} acres</span>
            </button>;
          })}
        </div>
      </section>
    </div>
  );
}

function AdviceDetail({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"><h3 className="text-xs font-bold text-slate-300">{title}</h3><p className="mt-1 text-sm leading-5 text-slate-100">{text}</p></div>;
}

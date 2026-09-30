"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sprout,
  Plus,
  ShieldCheck,
  Trash2,
  X,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCrops } from "@/hooks/use-crops";
import { useFarms } from "@/hooks/use-farms";
import { useAuthStore } from "@/stores/auth-store";
import { Crop } from "@/stores/crop-store";
import { CropLifecycleFields, type CropLifecycleFormValues } from "@/components/crops/crop-lifecycle-fields";
import { getCropCareReminders, getCropDateAfterDays, getCropLifecycleInfo, getCropMaintenanceDefaults } from "@/lib/crops/lifecycle";
import { useLanguage } from "@/hooks/use-language";
import { getCropHelp, getUiText } from "@/lib/i18n/localization";

type CropRegistrationData = Omit<ReturnType<typeof newCropFormData>, keyof CropLifecycleFormValues> & CropLifecycleFormValues;

function newCropFormData(area = 5) {
  return {
    name: "",
    variety: "",
    farmId: "",
    sowingDate: getCropDateAfterDays(0),
    lifecycleType: "ANNUAL" as const,
    expectedHarvest: getCropDateAfterDays(120),
    establishmentPeriodMonths: 12,
    maturityPeriodMonths: 36,
    firstExpectedHarvest: "",
    harvestIntervalMonths: 12,
    maintenanceSchedule: getCropMaintenanceDefaults("ANNUAL"),
    growthStage: "Seedling" as Crop["growthStage"],
    area,
    waterNeed: "Medium" as Crop["waterNeed"],
    health: "Excellent" as Crop["health"],
    diseaseStatus: "Healthy",
  };
}

export default function CropsPage() {
  const { user } = useAuthStore();
  const { language } = useLanguage();
  const copy = getUiText(language);
  const cropFieldHelp = getCropHelp(language);
  const { crops, addCrop, deleteCrop } = useCrops();
  const { farms } = useFarms();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCropHelpOpen, setIsCropHelpOpen] = useState(false);
  const [cropSavedMessage, setCropSavedMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CropRegistrationData>(() => newCropFormData());
  const selectedFarm = farms.find((farm) => farm.id === formData.farmId);

  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !selectedFarm) {
      setFormError("Choose a farm and enter a crop name.");
      return;
    }

    if (!Number.isFinite(formData.area) || formData.area <= 0 || formData.area > selectedFarm.area) {
      setFormError(`Crop area must be greater than 0 and no more than ${selectedFarm.area} acres.`);
      return;
    }

    if (formData.lifecycleType === "ANNUAL" && (!formData.expectedHarvest || Date.parse(formData.expectedHarvest) < Date.parse(formData.sowingDate))) {
      setFormError("Expected harvest date must be on or after the sowing date.");
      return;
    }

    if (formData.lifecycleType === "PERENNIAL" && formData.maturityPeriodMonths <= formData.establishmentPeriodMonths) {
      setFormError("Maturity period must be longer than the establishment period.");
      return;
    }
    if (formData.firstExpectedHarvest && Date.parse(formData.firstExpectedHarvest) < Date.parse(formData.sowingDate)) {
      setFormError("First expected harvest must be on or after the planting date.");
      return;
    }

    setFormError(null);

    addCrop({
      ownerId: user?.uid,
      farmId: formData.farmId,
      farmName: selectedFarm.name,
      name: formData.name,
      variety: formData.variety,
      sowingDate: formData.sowingDate,
      expectedHarvest: formData.lifecycleType === "ANNUAL" ? formData.expectedHarvest : undefined,
      lifecycleType: formData.lifecycleType,
      establishmentPeriodMonths: formData.lifecycleType === "PERENNIAL" ? formData.establishmentPeriodMonths : undefined,
      maturityPeriodMonths: formData.lifecycleType === "PERENNIAL" ? formData.maturityPeriodMonths : undefined,
      firstExpectedHarvest: formData.lifecycleType === "PERENNIAL" ? formData.firstExpectedHarvest || undefined : undefined,
      harvestIntervalMonths: formData.lifecycleType === "PERENNIAL" ? formData.harvestIntervalMonths : undefined,
      maintenanceSchedule: formData.maintenanceSchedule,
      growthStage: formData.growthStage,
      area: Number(formData.area),
      waterNeed: formData.waterNeed,
      health: formData.health,
      diseaseStatus: formData.diseaseStatus,
    });

    setCropSavedMessage(`${formData.name.trim()}: ${copy.help.saved}`);
    setIsAddModalOpen(false);
    setIsCropHelpOpen(false);
    setFormData(newCropFormData());
  };

  const updateLifecycle = (patch: Partial<CropLifecycleFormValues>) => {
    setFormData((current) => ({ ...current, ...patch }));
  };

  const filteredCrops = crops.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.farmName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
            <Sprout className="h-7 w-7 text-emerald-600" />
            Crop Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track growth stages, health, harvest dates, and field history
          </p>
        </div>
        <Button
          onClick={() => { setCropSavedMessage(null); setIsCropHelpOpen(false); setIsAddModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
        >
          <Plus className="h-5 w-5 mr-1" />
          Register Crop
        </Button>
      </div>

      {cropSavedMessage && (
        <p role="status" className="rounded-xl border border-emerald-800 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
          {cropSavedMessage}
        </p>
      )}

      {/* Zero Crops Empty State */}
      {crops.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-md dark:bg-slate-900 dark:border-slate-800 space-y-5">
          <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto dark:bg-emerald-950/50 dark:text-emerald-400">
            <Sprout className="h-10 w-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No Crops Registered
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Start by adding your first crop to track growth cycles, water needs, and AI recommendations.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => { setCropSavedMessage(null); setIsCropHelpOpen(false); setIsAddModalOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8"
          >
            <Plus className="h-5 w-5 mr-2" />
            + Add First Crop
          </Button>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filter crops by name or farm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 px-4 text-sm bg-white border border-slate-200 rounded-xl w-full max-w-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
            />
          </div>

          {/* Crop Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCrops.map((crop) => {
              const lifecycle = getCropLifecycleInfo(crop);
              const nextCare = getCropCareReminders(crop)[0];
              const harvestDescription = lifecycle.lifecycleType === "PERENNIAL"
                ? lifecycle.nextHarvestDate
                  ? `Next ${lifecycle.nextHarvestDate} · every ${crop.harvestIntervalMonths ?? 12} months`
                  : `Recurring · first date not set`
                : crop.expectedHarvest || "Not set";

              return (
                <div
                  key={crop.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {crop.farmName}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {crop.name} {crop.variety ? `(${crop.variety})` : ""}
                        </h3>
                        <Link
                          href={`/crops/${crop.id}`}
                          className="mt-1 inline-flex text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                          View crop details
                        </Link>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 font-bold border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                        {crop.health}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Life stage: {lifecycle.stage}</span>
                        <span className="text-emerald-600 font-bold">{lifecycle.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden dark:bg-slate-800">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${lifecycle.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Data Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-800/80">
                        <span className="text-slate-400 font-medium">Planting Date</span>
                        <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{crop.sowingDate}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-800/80">
                        <span className="text-slate-400 font-medium">{lifecycle.lifecycleType === "PERENNIAL" ? "Harvest cycle" : "Expected Harvest"}</span>
                        <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{harvestDescription}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-800/80">
                        <span className="text-slate-400 font-medium">Crop age</span>
                        <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{lifecycle.ageLabel}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-800/80">
                        <span className="text-slate-400 font-medium">Area</span>
                        <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{crop.area} Acres</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-800/80">
                        <span className="text-slate-400 font-medium">Water Need</span>
                        <p className="font-bold text-slate-800 mt-0.5 dark:text-slate-200">{crop.waterNeed}</p>
                      </div>
                    </div>
                    {nextCare && <p className="text-[11px] text-sky-700 dark:text-sky-300">Next reminder: {nextCare.activity} · {nextCare.nextDue}</p>}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Status: {crop.diseaseStatus || "Healthy"}
                    </span>
                    <button
                      onClick={() => deleteCrop(crop.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete crop"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Crop Registration Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div role="dialog" aria-modal="true" aria-labelledby="crop-registration-title" className="relative flex max-h-[min(90dvh,56rem)] max-w-lg w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 pt-6 pb-3 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-600" />
                <span id="crop-registration-title">Register New Crop</span>
              </h3>
              <button
                onClick={() => { setIsCropHelpOpen(false); setIsAddModalOpen(false); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-4 sm:px-6">
            <form id="crop-registration-form" onSubmit={handleCreateCrop} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Select Farm *</label>
                <select
                  required
                  value={formData.farmId}
                  onChange={(e) => {
                    const farmId = e.target.value;
                    const farm = farms.find((item) => item.id === farmId);
                    setFormError(null);
                    setFormData((current) => ({
                      ...current,
                      farmId,
                      area: farm ? Math.min(current.area, farm.area) : current.area,
                    }));
                  }}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white font-bold"
                >
                  <option value="">-- Choose Farm --</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.area} Acres)
                    </option>
                  ))}
                </select>
                {farms.length === 0 && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    No farms found. Please create a farm in the Farms tab first.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Crop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paddy, Wheat, Cotton"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Variety (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sona Masuri, Basmati"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Planting / Sowing Date</label>
                  <input
                    type="date"
                    required
                    value={formData.sowingDate}
                    onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
              </div>

              <CropLifecycleFields
                value={formData}
                onChange={updateLifecycle}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Growth Stage</label>
                  <select
                    value={formData.growthStage}
                    onChange={(e) => setFormData({ ...formData, growthStage: e.target.value as Crop["growthStage"] })}
                    className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="Seedling">Seedling</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruiting">Fruiting</option>
                    <option value="Maturation">Maturation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    min="0.1"
                    max={selectedFarm?.area}
                    step="0.1"
                    required
                    value={formData.area}
                    onChange={(e) => {
                      setFormError(null);
                      setFormData({ ...formData, area: Number(e.target.value) });
                    }}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Water Need</label>
                  <select
                    value={formData.waterNeed}
                    onChange={(e) => setFormData({ ...formData, waterNeed: e.target.value as Crop["waterNeed"] })}
                    className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {formError && (
                <p role="alert" className="text-xs font-semibold text-rose-600">
                  {formError}
                </p>
              )}

            </form>
            </div>

            <div className="flex shrink-0 gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsCropHelpOpen(false); setIsAddModalOpen(false); }}
                className="min-h-11 flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="crop-registration-form"
                disabled={farms.length === 0}
                className="min-h-11 flex-1 bg-emerald-600 text-white hover:bg-emerald-500 font-bold"
              >
                Save Crop
              </Button>
            </div>

            {isCropHelpOpen && (
              <section id="crop-registration-help" aria-label={copy.help.title} className="liquid-glass-panel absolute bottom-[6.25rem] right-3 z-30 flex max-h-[min(62dvh,32rem)] w-[min(22rem,calc(100vw-3.5rem))] flex-col overflow-hidden rounded-2xl border border-emerald-300/70 bg-white shadow-2xl ring-1 ring-black/10 dark:border-emerald-800 dark:bg-slate-950">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{copy.help.title}</h4>
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{copy.help.subtitle}</p>
                  </div>
                  <button type="button" onClick={() => setIsCropHelpOpen(false)} aria-label={copy.help.close} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-y-auto overscroll-contain px-4 py-2.5">
                  <dl className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cropFieldHelp.map(({ field, explanation, example }) => (
                      <div key={field} className="py-2.5 first:pt-1 last:pb-1">
                        <dt className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{field}</dt>
                        <dd className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">{explanation}</dd>
                        <dd className="mt-1 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400"><span className="font-semibold">{copy.help.example}:</span> {example}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>
            )}
            <button
              type="button"
              aria-label={isCropHelpOpen ? copy.help.close : copy.help.title}
              aria-expanded={isCropHelpOpen}
              aria-controls="crop-registration-help"
              title={copy.help.subtitle}
              onClick={() => setIsCropHelpOpen((open) => !open)}
              className="liquid-glass-panel absolute bottom-[5.5rem] right-4 z-40 flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-600/95 px-3 text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:border-emerald-700 dark:ring-offset-slate-900"
            >
              <ChevronUp className={`h-5 w-5 transition-transform ${isCropHelpOpen ? "rotate-180" : ""}`} />
              <span className="sr-only">{copy.help.button}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { Crop } from "@/stores/crop-store";
import { signalFarmCropRefresh } from "@/hooks/use-farms";

async function apiError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  return new Error(payload?.error || fallback);
}

export function useCrops(farmId?: string) {
  const userId = useAuthStore((state) => state.user?.uid);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) { setCrops([]); setLoading(false); setError(null); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/crops", { cache: "no-store" });
      if (!response.ok) throw await apiError(response, "Crop records could not be loaded.");
      const payload = await response.json() as { crops: Crop[] };
      setCrops(payload.crops);
      setError(null);
    } catch (cause) {
      setCrops([]);
      setError(cause instanceof Error ? cause.message : "Crop records could not be loaded.");
    } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void refresh(); }, 0);
    window.addEventListener("agrivision:farm-crops-changed", refresh);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("agrivision:farm-crops-changed", refresh);
    };
  }, [refresh]);

  const addCrop = useCallback(async (crop: Omit<Crop, "id" | "createdAt">) => {
    const response = await fetch("/api/crops", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(crop),
    });
    if (!response.ok) throw await apiError(response, "Crop could not be saved.");
    const payload = await response.json() as { crop: Crop };
    signalFarmCropRefresh();
    return payload.crop;
  }, []);

  const deleteCrop = useCallback(async (id: string) => {
    const response = await fetch(`/api/crops/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) throw await apiError(response, "Crop could not be deleted.");
    signalFarmCropRefresh();
  }, []);

  const userCrops = farmId ? crops.filter((crop) => crop.farmId === farmId) : crops;
  return { crops: userCrops, allCrops: crops, addCrop, deleteCrop, loading, error, refresh, resetToZero: () => undefined };
}

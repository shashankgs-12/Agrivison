"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { Farm } from "@/stores/farm-store";

export type NewFarm = Omit<Farm, "id" | "createdAt" | "ownerId" | "crop"> & {
  boundary: [number, number][];
  areaHectares: number;
  perimeterMeters: number;
  surveyMethod: "manual" | "live-gps";
  requestKey?: string;
};

export function signalFarmCropRefresh() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("agrivision:farm-crops-changed"));
}

async function apiError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  return new Error(payload?.error || fallback);
}

export function useFarms() {
  const userId = useAuthStore((state) => state.user?.uid);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) { setFarms([]); setLoading(false); setError(null); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/farms", { cache: "no-store" });
      if (!response.ok) throw await apiError(response, "Farm records could not be loaded.");
      const payload = await response.json() as { farms: Farm[] };
      setFarms(payload.farms);
      setError(null);
    } catch (cause) {
      setFarms([]);
      setError(cause instanceof Error ? cause.message : "Farm records could not be loaded.");
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

  const addFarm = useCallback(async (farm: NewFarm) => {
    const response = await fetch("/api/farms", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...farm, requestKey: farm.requestKey || crypto.randomUUID() }),
    });
    if (!response.ok) throw await apiError(response, "Farm survey could not be saved.");
    const payload = await response.json() as { farm: Farm };
    signalFarmCropRefresh();
    return payload.farm;
  }, []);

  const deleteFarm = useCallback(async (id: string) => {
    const response = await fetch(`/api/farms/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) throw await apiError(response, "Farm could not be deleted.");
    signalFarmCropRefresh();
  }, []);

  return { farms, allFarms: farms, addFarm, deleteFarm, loading, error, refresh, resetToZero: () => undefined };
}

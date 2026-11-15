"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import type { Crop } from "@/stores/crop-store";

async function apiError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  return new Error(payload?.error || fallback);
}

interface CropQueryData {
  crops: Crop[];
  offline: boolean;
}

function getCropCache(userId: string): Crop[] | null {
  try {
    const raw = localStorage.getItem(`agrivision:crop-cache:${userId}`);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { crops?: unknown };
    return Array.isArray(cached.crops) ? cached.crops as Crop[] : null;
  } catch {
    return null;
  }
}

async function fetchCrops(userId: string): Promise<CropQueryData> {
  const cachedCrops = typeof window !== "undefined" ? getCropCache(userId) : null;
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    if (cachedCrops) return { crops: cachedCrops, offline: true };
    throw new Error("You are offline and no saved crop records are available on this device.");
  }
  try {
    const response = await fetch("/api/crops", { cache: "no-store" });
    if (!response.ok) throw await apiError(response, "Crop records could not be loaded.");
    const payload = await response.json() as { crops: Crop[] };
    try {
      localStorage.setItem(`agrivision:crop-cache:${userId}`, JSON.stringify({ crops: payload.crops, savedAt: Date.now() }));
    } catch {
      // Use the server response even if local storage is unavailable.
    }
    return { crops: payload.crops, offline: false };
  } catch (error) {
    if (cachedCrops) return { crops: cachedCrops, offline: true };
    throw error;
  }
}

export function useCrops(farmId?: string) {
  const userId = useAuthStore((state) => state.user?.uid);
  const queryClient = useQueryClient();
  const cropsQuery = useQuery({
    queryKey: ["crops", userId],
    queryFn: () => fetchCrops(userId!),
    enabled: Boolean(userId),
    staleTime: 45_000,
  });

  const refresh = useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({ queryKey: ["crops", userId] });
  }, [queryClient, userId]);

  const addCrop = useCallback(async (crop: Omit<Crop, "id" | "createdAt">) => {
    const response = await fetch("/api/crops", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(crop),
    });
    if (!response.ok) throw await apiError(response, "Crop could not be saved.");
    const payload = await response.json() as { crop: Crop };
    void queryClient.invalidateQueries({ queryKey: ["farms"] });
    void queryClient.invalidateQueries({ queryKey: ["crops"] });
    return payload.crop;
  }, [queryClient]);

  const deleteCrop = useCallback(async (id: string) => {
    const response = await fetch(`/api/crops/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) throw await apiError(response, "Crop could not be deleted.");
    void queryClient.invalidateQueries({ queryKey: ["farms"] });
    void queryClient.invalidateQueries({ queryKey: ["crops"] });
  }, [queryClient]);

  const crops = userId ? cropsQuery.data?.crops ?? [] : [];
  const userCrops = farmId ? crops.filter((crop) => crop.farmId === farmId) : crops;
  const error = cropsQuery.error instanceof Error ? cropsQuery.error.message : null;

  return {
    crops: userCrops,
    allCrops: crops,
    addCrop,
    deleteCrop,
    loading: Boolean(userId) && cropsQuery.isPending,
    error,
    offline: cropsQuery.data?.offline ?? false,
    refresh,
    resetToZero: () => undefined,
  };
}

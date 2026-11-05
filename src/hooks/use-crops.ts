"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import type { Crop } from "@/stores/crop-store";

async function apiError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  return new Error(payload?.error || fallback);
}

async function fetchCrops(): Promise<Crop[]> {
  const response = await fetch("/api/crops", { cache: "no-store" });
  if (!response.ok) throw await apiError(response, "Crop records could not be loaded.");
  const payload = await response.json() as { crops: Crop[] };
  return payload.crops;
}

export function useCrops(farmId?: string) {
  const userId = useAuthStore((state) => state.user?.uid);
  const queryClient = useQueryClient();
  const cropsQuery = useQuery({
    queryKey: ["crops", userId],
    queryFn: fetchCrops,
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

  const crops = userId ? cropsQuery.data ?? [] : [];
  const userCrops = farmId ? crops.filter((crop) => crop.farmId === farmId) : crops;
  const error = cropsQuery.error instanceof Error ? cropsQuery.error.message : null;

  return {
    crops: userCrops,
    allCrops: crops,
    addCrop,
    deleteCrop,
    loading: Boolean(userId) && cropsQuery.isPending,
    error,
    refresh,
    resetToZero: () => undefined,
  };
}

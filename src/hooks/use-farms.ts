"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import type { Farm } from "@/stores/farm-store";

export type NewFarm = Omit<Farm, "id" | "createdAt" | "ownerId" | "crop"> & {
  boundary: [number, number][];
  areaHectares: number;
  perimeterMeters: number;
  surveyMethod: "manual" | "live-gps";
  requestKey?: string;
};

async function apiError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  return new Error(payload?.error || fallback);
}

async function fetchFarms(): Promise<Farm[]> {
  const response = await fetch("/api/farms", { cache: "no-store" });
  if (!response.ok) throw await apiError(response, "Farm records could not be loaded.");
  const payload = await response.json() as { farms: Farm[] };
  return payload.farms;
}

export function useFarms() {
  const userId = useAuthStore((state) => state.user?.uid);
  const queryClient = useQueryClient();
  const farmsQuery = useQuery({
    queryKey: ["farms", userId],
    queryFn: fetchFarms,
    enabled: Boolean(userId),
    staleTime: 45_000,
  });

  const refresh = useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({ queryKey: ["farms", userId] });
  }, [queryClient, userId]);

  const addFarm = useCallback(async (farm: NewFarm) => {
    const response = await fetch("/api/farms", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...farm, requestKey: farm.requestKey || crypto.randomUUID() }),
    });
    if (!response.ok) throw await apiError(response, "Farm survey could not be saved.");
    const payload = await response.json() as { farm: Farm };
    void queryClient.invalidateQueries({ queryKey: ["farms"] });
    void queryClient.invalidateQueries({ queryKey: ["crops"] });
    return payload.farm;
  }, [queryClient]);

  const deleteFarm = useCallback(async (id: string) => {
    const response = await fetch(`/api/farms/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) throw await apiError(response, "Farm could not be deleted.");
    void queryClient.invalidateQueries({ queryKey: ["farms"] });
    void queryClient.invalidateQueries({ queryKey: ["crops"] });
  }, [queryClient]);

  const farms = userId ? farmsQuery.data ?? [] : [];
  const error = farmsQuery.error instanceof Error ? farmsQuery.error.message : null;

  return {
    farms,
    allFarms: farms,
    addFarm,
    deleteFarm,
    loading: Boolean(userId) && farmsQuery.isPending,
    error,
    refresh,
    resetToZero: () => undefined,
  };
}

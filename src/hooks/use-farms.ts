"use client";

import { useMemo } from "react";
import { useFarmStore, Farm } from "@/stores/farm-store";
import { useAuthStore } from "@/stores/auth-store";

export function useFarms() {
  const { user } = useAuthStore();
  const farms = useFarmStore((state) => state.farms);
  const addFarm = useFarmStore((state) => state.addFarm);
  const updateFarm = useFarmStore((state) => state.updateFarm);
  const deleteFarm = useFarmStore((state) => state.deleteFarm);
  const resetToZero = useFarmStore((state) => state.resetToZero);

  const userFarms = useMemo(() => {
    if (!user?.uid) return farms;
    return farms.filter((f) => f.ownerId === user.uid || !f.ownerId);
  }, [farms, user?.uid]);

  return {
    farms: userFarms,
    allFarms: farms,
    addFarm,
    updateFarm,
    deleteFarm,
    resetToZero,
    loading: false,
  };
}

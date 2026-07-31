"use client";

import { useMemo } from "react";
import { useCropStore, Crop } from "@/stores/crop-store";
import { useAuthStore } from "@/stores/auth-store";

export function useCrops(farmId?: string) {
  const { user } = useAuthStore();
  const crops = useCropStore((state) => state.crops);
  const addCrop = useCropStore((state) => state.addCrop);
  const updateCrop = useCropStore((state) => state.updateCrop);
  const deleteCrop = useCropStore((state) => state.deleteCrop);
  const resetToZero = useCropStore((state) => state.resetToZero);

  const userCrops = useMemo(() => {
    let list = crops;
    if (user?.uid) {
      list = list.filter((c) => c.ownerId === user.uid || !c.ownerId);
    }
    if (farmId) {
      list = list.filter((c) => c.farmId === farmId);
    }
    return list;
  }, [crops, user?.uid, farmId]);

  return {
    crops: userCrops,
    allCrops: crops,
    addCrop,
    updateCrop,
    deleteCrop,
    resetToZero,
    loading: false,
  };
}

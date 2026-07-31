"use client";

import { useMemo } from "react";
import { useHistoryStore, DiseaseRecord, PlantIDRecord } from "@/stores/history-store";
import { useAuthStore } from "@/stores/auth-store";

export function useDiseaseRecords() {
  const { user } = useAuthStore();
  const diseaseRecords = useHistoryStore((state) => state.diseaseRecords);
  const addDiseaseRecord = useHistoryStore((state) => state.addDiseaseRecord);
  const deleteDiseaseRecord = useHistoryStore((state) => state.deleteDiseaseRecord);

  const filteredRecords = useMemo(() => {
    if (!user?.uid) return diseaseRecords;
    return diseaseRecords.filter((r) => r.userId === user.uid || !r.userId);
  }, [diseaseRecords, user?.uid]);

  return {
    diseaseRecords: filteredRecords,
    allDiseaseRecords: diseaseRecords,
    addDiseaseRecord,
    deleteDiseaseRecord,
  };
}

export function usePlantRecords() {
  const { user } = useAuthStore();
  const plantRecords = useHistoryStore((state) => state.plantRecords);
  const addPlantRecord = useHistoryStore((state) => state.addPlantRecord);
  const deletePlantRecord = useHistoryStore((state) => state.deletePlantRecord);

  const filteredRecords = useMemo(() => {
    if (!user?.uid) return plantRecords;
    return plantRecords.filter((r) => r.userId === user.uid || !r.userId);
  }, [plantRecords, user?.uid]);

  return {
    plantRecords: filteredRecords,
    allPlantRecords: plantRecords,
    addPlantRecord,
    deletePlantRecord,
  };
}

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
    if (!user?.uid) return [];
    return diseaseRecords.filter((record) => record.userId === user.uid);
  }, [diseaseRecords, user]);

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
    if (!user?.uid) return [];
    return plantRecords.filter((record) => record.userId === user.uid);
  }, [plantRecords, user]);

  return {
    plantRecords: filteredRecords,
    allPlantRecords: plantRecords,
    addPlantRecord,
    deletePlantRecord,
  };
}

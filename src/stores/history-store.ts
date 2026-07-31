import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DiseaseRecord {
  id: string;
  userId?: string;
  imageUrl?: string;
  timestamp: string;
  diseaseName: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  symptoms: string;
  organicTreatment: string;
  chemicalTreatment: string;
  cropName?: string;
}

export interface PlantIDRecord {
  id: string;
  userId?: string;
  imageUrl?: string;
  timestamp: string;
  plantName: string;
  scientificName: string;
  family: string;
  confidence: number;
  growingSeason: string;
  optimalSoil: string;
  waterRequirement: string;
  harvestCycle: string;
}

interface HistoryState {
  diseaseRecords: DiseaseRecord[];
  plantRecords: PlantIDRecord[];
  addDiseaseRecord: (record: Omit<DiseaseRecord, "id" | "timestamp">) => DiseaseRecord;
  addPlantRecord: (record: Omit<PlantIDRecord, "id" | "timestamp">) => PlantIDRecord;
  deleteDiseaseRecord: (id: string) => void;
  deletePlantRecord: (id: string) => void;
  getDiseaseRecordsByUser: (userId?: string) => DiseaseRecord[];
  getPlantRecordsByUser: (userId?: string) => PlantIDRecord[];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      diseaseRecords: [],
      plantRecords: [],
      addDiseaseRecord: (record) => {
        const newRecord: DiseaseRecord = {
          ...record,
          id: `dis-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          diseaseRecords: [newRecord, ...state.diseaseRecords],
        }));
        return newRecord;
      },
      addPlantRecord: (record) => {
        const newRecord: PlantIDRecord = {
          ...record,
          id: `plt-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          plantRecords: [newRecord, ...state.plantRecords],
        }));
        return newRecord;
      },
      deleteDiseaseRecord: (id) =>
        set((state) => ({
          diseaseRecords: state.diseaseRecords.filter((r) => r.id !== id),
        })),
      deletePlantRecord: (id) =>
        set((state) => ({
          plantRecords: state.plantRecords.filter((r) => r.id !== id),
        })),
      getDiseaseRecordsByUser: (userId) => {
        const state = get();
        if (!userId) return state.diseaseRecords;
        return state.diseaseRecords.filter((r) => r.userId === userId || !r.userId);
      },
      getPlantRecordsByUser: (userId) => {
        const state = get();
        if (!userId) return state.plantRecords;
        return state.plantRecords.filter((r) => r.userId === userId || !r.userId);
      },
    }),
    {
      name: "agrivision-history-storage",
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Crop {
  id: string;
  ownerId?: string;
  farmId: string;
  farmName: string;
  name: string;
  variety?: string;
  sowingDate: string;
  expectedHarvest: string;
  growthStage: "Seedling" | "Vegetative" | "Flowering" | "Fruiting" | "Maturation" | "Harvesting";
  area: number; // in acres
  waterNeed: "Low" | "Medium" | "High" | "Critical";
  health: "Excellent" | "Good" | "Fair" | "Under Stress" | "Diseased";
  diseaseStatus: string; // e.g. "Healthy" or "Yellow Rust Alert"
  soilType?: string;
  createdAt: string;
}

interface CropState {
  crops: Crop[];
  addCrop: (crop: Omit<Crop, "id" | "createdAt">) => Crop;
  updateCrop: (id: string, updatedFields: Partial<Crop>) => void;
  deleteCrop: (id: string) => void;
  getCropsByUser: (userId?: string) => Crop[];
  getCropsByFarm: (farmId: string) => Crop[];
  resetToZero: () => void;
}

export const useCropStore = create<CropState>()(
  persist(
    (set, get) => ({
      crops: [],
      addCrop: (newCrop) => {
        const crop: Crop = {
          ...newCrop,
          id: `crop-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
        };
        set((state) => ({
          crops: [crop, ...state.crops],
        }));
        return crop;
      },
      updateCrop: (id, updatedFields) =>
        set((state) => ({
          crops: state.crops.map((c) =>
            c.id === id ? { ...c, ...updatedFields } : c
          ),
        })),
      deleteCrop: (id) =>
        set((state) => ({
          crops: state.crops.filter((c) => c.id !== id),
        })),
      getCropsByUser: (userId) => {
        const state = get();
        if (!userId) return state.crops;
        return state.crops.filter((c) => c.ownerId === userId || !c.ownerId);
      },
      getCropsByFarm: (farmId) => {
        const state = get();
        return state.crops.filter((c) => c.farmId === farmId);
      },
      resetToZero: () => set({ crops: [] }),
    }),
    {
      name: "agrivision-crops-storage",
    }
  )
);

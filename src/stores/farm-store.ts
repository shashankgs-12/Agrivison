import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Farm {
  id: string;
  ownerId?: string;
  name: string;
  area: number; // in acres
  crop?: string;
  status: "Healthy" | "Alert Active" | "Optimal";
  location: string;
  soilType?: string;
  waterSource?: string;
  coordinates: { lat: number; lng: number };
  boundary?: [number, number][]; // Polygon coordinates
  createdAt: string;
}

interface FarmState {
  farms: Farm[];
  addFarm: (farm: Omit<Farm, "id" | "createdAt">) => Farm;
  updateFarm: (id: string, farm: Partial<Farm>) => void;
  deleteFarm: (id: string) => void;
  getFarmsByUser: (userId?: string) => Farm[];
  resetToZero: () => void;
}

export const useFarmStore = create<FarmState>()(
  persist(
    (set, get) => ({
      farms: [],
      addFarm: (newFarm) => {
        const farm: Farm = {
          ...newFarm,
          id: `farm-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
        };
        set((state) => ({
          farms: [farm, ...state.farms],
        }));
        return farm;
      },
      updateFarm: (id, updatedFields) =>
        set((state) => ({
          farms: state.farms.map((f) =>
            f.id === id ? { ...f, ...updatedFields } : f
          ),
        })),
      deleteFarm: (id) =>
        set((state) => ({
          farms: state.farms.filter((f) => f.id !== id),
        })),
      getFarmsByUser: (userId) => {
        const state = get();
        if (!userId) return state.farms;
        return state.farms.filter((f) => f.ownerId === userId || !f.ownerId);
      },
      resetToZero: () => set({ farms: [] }),
    }),
    {
      name: "agrivision-farms-storage",
    }
  )
);

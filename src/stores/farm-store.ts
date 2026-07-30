import { create } from "zustand";

export interface Farm {
  id: string;
  name: string;
  area: number; // in acres
  crop: string;
  status: "Healthy" | "Alert Active" | "Optimal";
  location: string;
  soilType?: string;
  waterSource?: string;
  coordinates: { lat: number; lng: number };
  createdAt: string;
}

interface FarmState {
  farms: Farm[];
  addFarm: (farm: Omit<Farm, "id" | "createdAt">) => void;
  deleteFarm: (id: string) => void;
  resetToZero: () => void;
}

const DEFAULT_FARMS: Farm[] = [
  {
    id: "farm-1",
    name: "Green Valley Farm",
    area: 18.5,
    crop: "Paddy & Sugarcane",
    status: "Healthy",
    location: "Mandya District, KA",
    coordinates: { lat: 12.5218, lng: 76.8951 },
    createdAt: "2026-01-15",
  },
  {
    id: "farm-2",
    name: "Sunrise Agro Farm",
    area: 14.2,
    crop: "Wheat & Mustard",
    status: "Alert Active",
    location: "Mandya District, KA",
    coordinates: { lat: 12.528, lng: 76.901 },
    createdAt: "2026-01-20",
  },
  {
    id: "farm-3",
    name: "Riverbank Plantation",
    area: 9.8,
    crop: "Maize & Pulses",
    status: "Optimal",
    location: "Mandya District, KA",
    coordinates: { lat: 12.515, lng: 76.889 },
    createdAt: "2026-02-01",
  },
];

export const useFarmStore = create<FarmState>((set) => ({
  farms: DEFAULT_FARMS,
  addFarm: (newFarm) =>
    set((state) => ({
      farms: [
        {
          ...newFarm,
          id: `farm-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
        },
        ...state.farms,
      ],
    })),
  deleteFarm: (id) =>
    set((state) => ({
      farms: state.farms.filter((f) => f.id !== id),
    })),
  resetToZero: () => set({ farms: [] }),
}));

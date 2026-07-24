import { create } from "zustand";

interface FarmState {
  farms: unknown[];
  setFarms: (farms: unknown[]) => void;
}

export const useFarmStore = create<FarmState>((set) => ({
  farms: [],
  setFarms: (farms) => set({ farms }),
}));

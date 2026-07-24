import { create } from "zustand";

export interface LanguagePreferences {
  dashboard: string;
  plantInfo: string;
  weather: string;
  diseaseInfo: string;
  treatment: string;
  notifications: string;
  chat: string;
}

interface LanguageState {
  preferences: LanguagePreferences;
  setPreference: (key: keyof LanguagePreferences, value: string) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  preferences: {
    dashboard: "en",
    plantInfo: "en",
    weather: "en",
    diseaseInfo: "en",
    treatment: "en",
    notifications: "en",
    chat: "en",
  },
  setPreference: (key, value) =>
    set((state) => ({
      preferences: { ...state.preferences, [key]: value },
    })),
}));

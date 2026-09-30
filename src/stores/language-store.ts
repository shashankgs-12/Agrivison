import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/lib/utils/constants";

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
  setAppLanguage: (value: string) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      preferences: {
        dashboard: DEFAULT_LANGUAGE,
        plantInfo: DEFAULT_LANGUAGE,
        weather: DEFAULT_LANGUAGE,
        diseaseInfo: DEFAULT_LANGUAGE,
        treatment: DEFAULT_LANGUAGE,
        notifications: DEFAULT_LANGUAGE,
        chat: DEFAULT_LANGUAGE,
      },
      setPreference: (key, value) => {
        const supported = SUPPORTED_LANGUAGES.some((language) => language.code === value);
        if (!supported) return;
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        }));
      },
      setAppLanguage: (value) => {
        const supported = SUPPORTED_LANGUAGES.some((language) => language.code === value);
        if (!supported) return;
        set({
          preferences: {
            dashboard: value,
            plantInfo: value,
            weather: value,
            diseaseInfo: value,
            treatment: value,
            notifications: value,
            chat: value,
          },
        });
      },
    }),
    {
      name: "agrivision-language-preferences",
      partialize: (state) => ({ preferences: state.preferences }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<LanguageState> | undefined;
        return {
          ...currentState,
          ...persisted,
          preferences: {
            ...currentState.preferences,
            ...persisted?.preferences,
          },
        };
      },
    }
  )
);

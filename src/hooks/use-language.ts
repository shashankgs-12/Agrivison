"use client";

import { useLanguageStore } from "@/stores/language-store";
import { normalizeLanguage } from "@/lib/i18n/localization";

/** The header language is the app-wide display and AI response language. */
export function useLanguage() {
  const languagePreference = useLanguageStore((state) => state.preferences.dashboard);
  const setAppLanguage = useLanguageStore((state) => state.setAppLanguage);
  const language = normalizeLanguage(languagePreference);

  return {
    language,
    setLanguage: (value: string) => setAppLanguage(normalizeLanguage(value)),
  };
}

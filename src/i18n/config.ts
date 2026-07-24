export const locales = ["en", "kn", "hi", "te", "ta", "ml"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];

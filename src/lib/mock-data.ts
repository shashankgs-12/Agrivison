/**
 * DEPRECATION NOTICE:
 * All static mock objects (MOCK_FARMS, MOCK_ALERTS, MOCK_USER, MOCK_WEATHER, etc.)
 * have been purged and replaced with real user-scoped state stores (useFarmStore, useCropStore, useHistoryStore, useWeatherStore)
 * connected to live APIs and browser GPS.
 */

export const MOCK_USER = {
  name: "Authenticated Farmer",
  role: "farmer",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Farmer",
  location: "GPS Location Active",
  subscription: "Free Plan",
};

export const MOCK_STATS: unknown[] = [];
export const MOCK_WEATHER: null = null;
export const MOCK_IRRIGATION_ADVICE: null = null;
export const MOCK_ALERTS: unknown[] = [];
export const MOCK_RECENT_ACTIVITY: unknown[] = [];
export const MOCK_FARMS: unknown[] = [];


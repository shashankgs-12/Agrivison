import { create } from "zustand";
import { DetailedWeatherData } from "@/lib/weather/api";

interface WeatherState {
  weather: DetailedWeatherData | null;
  loading: boolean;
  error: string | null;
  userCoords: { lat: number; lng: number } | null;
  fetchWeather: (lat?: number, lng?: number) => Promise<void>;
  detectGPSAndFetch: () => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  weather: null,
  loading: false,
  error: null,
  userCoords: null,

  fetchWeather: async (lat = 12.9716, lng = 77.5946) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      if (!res.ok) {
        throw new Error(`Weather fetch failed: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success && data.weather) {
        set({
          weather: data.weather,
          loading: false,
          userCoords: { lat, lng },
        });
      } else {
        throw new Error(data.error || "Invalid weather payload");
      }
    } catch (err: any) {
      console.error("weatherStore fetch error:", err);
      set({ error: err.message || "Failed to load weather data", loading: false });
    }
  },

  detectGPSAndFetch: async () => {
    set({ loading: true, error: null });

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      // Geolocation not supported fallback
      await get().fetchWeather(12.9716, 77.5946);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await get().fetchWeather(latitude, longitude);
      },
      async (err) => {
        console.warn("GPS Permission Denied or Timeout:", err.message);
        set({
          error: "Location permission denied or unavailable. Showing regional default weather.",
        });
        // Default to regional coordinates (e.g. Karnataka agricultural belt 12.5218, 76.8951)
        await get().fetchWeather(12.5218, 76.8951);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  },
}));

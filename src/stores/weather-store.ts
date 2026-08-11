import { create } from "zustand";
import { DetailedWeatherData } from "@/lib/weather/api";
import { reverseGeocodeAddress } from "@/lib/gis/geo-utils";

interface WeatherState {
  weather: DetailedWeatherData | null;
  loading: boolean;
  error: string | null;
  userCoords: { lat: number; lng: number } | null;
  fetchWeather: (lat?: number, lng?: number, locationNameOverride?: string) => Promise<void>;
  updateLocation: (lat: number, lng: number, locationNameOverride?: string) => Promise<void>;
  detectGPSAndFetch: () => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  weather: null,
  loading: false,
  error: null,
  userCoords: null,

  fetchWeather: async (lat = 12.9716, lng = 77.5946, locationNameOverride) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      if (!res.ok) {
        throw new Error(`Weather fetch failed: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success && data.weather) {
        let locationName = locationNameOverride;
        if (!locationName) {
          locationName = await reverseGeocodeAddress(lat, lng);
        }

        const updatedWeather: DetailedWeatherData = {
          ...data.weather,
          latitude: lat,
          longitude: lng,
          locationName: locationName || data.weather.locationName,
        };

        set({
          weather: updatedWeather,
          loading: false,
          userCoords: { lat, lng },
        });
      } else {
        throw new Error(data.error || "Invalid weather payload");
      }
    } catch (err: unknown) {
      console.error("weatherStore fetch error:", err);
      const message = err instanceof Error ? err.message : "Failed to load weather data";
      set({ error: message, loading: false });
    }
  },

  updateLocation: async (lat: number, lng: number, locationNameOverride?: string) => {
    // Only re-fetch if coords changed or weather is not loaded yet
    const current = get().userCoords;
    if (
      current &&
      Math.abs(current.lat - lat) < 0.0001 &&
      Math.abs(current.lng - lng) < 0.0001 &&
      get().weather
    ) {
      return;
    }
    await get().fetchWeather(lat, lng, locationNameOverride);
  },

  detectGPSAndFetch: async () => {
    set({ loading: true, error: null });

    if (typeof navigator === "undefined" || !navigator.geolocation) {
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
        await get().fetchWeather(12.5218, 76.8951);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  },
}));

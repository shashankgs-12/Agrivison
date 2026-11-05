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
      const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`, {
        signal: AbortSignal.timeout(9_000),
      });
      if (!res.ok) {
        throw new Error(`Weather fetch failed: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success && data.weather) {
        let locationName = locationNameOverride || data.weather.locationName;
        if (!locationName) {
          try {
            locationName = await Promise.race([
              reverseGeocodeAddress(lat, lng),
              new Promise<string>((resolve) => setTimeout(() => resolve(`${lat.toFixed(2)}°, ${lng.toFixed(2)}°`), 1000)),
            ]);
          } catch {
            locationName = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
          }
        }

        const updatedWeather: DetailedWeatherData = {
          ...data.weather,
          latitude: lat,
          longitude: lng,
          locationName: locationName || data.weather.locationName || "Mandya District, KA",
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
    const defaultWeatherRequest = get().weather
      ? Promise.resolve()
      : get().fetchWeather(12.5218, 76.8951, "Mandya District, KA");

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      await defaultWeatherRequest;
      return;
    }

    // Request GPS while the regional weather request is in flight, so the
    // browser's location wait does not extend the first useful response.
    const locationRequest = new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (err) => {
          console.warn("GPS notice:", err.message);
          resolve(null);
        },
        { timeout: 4000, enableHighAccuracy: false, maximumAge: 300000 }
      );
    });

    await defaultWeatherRequest;
    const position = await locationRequest;
    if (position) {
      const { latitude, longitude } = position.coords;
      await get().fetchWeather(latitude, longitude);
    }
  },
}));

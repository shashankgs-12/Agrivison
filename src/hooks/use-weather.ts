"use client";

import { useEffect } from "react";
import { useWeatherStore } from "@/stores/weather-store";

export function useWeather() {
  const { weather, loading, error, fetchWeather, detectGPSAndFetch } = useWeatherStore();

  useEffect(() => {
    if (!weather && !loading) {
      detectGPSAndFetch();
    }
  }, [weather, loading, detectGPSAndFetch]);

  return {
    weather,
    loading,
    error,
    refetch: fetchWeather,
    detectGPSAndFetch,
  };
}

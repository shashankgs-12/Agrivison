"use client";

import React, { useState } from "react";
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Locate,
  MapPin,
  Search,
  ChevronDown,
} from "lucide-react";
import { useWeatherStore, POPULAR_LOCATIONS } from "@/stores/weather-store";
import { Button } from "@/components/ui/button";

export default function WeatherPage() {
  const { currentWeather, setLocationByName, detectLiveLocation, isDetectingGPS } =
    useWeatherStore();
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [customCity, setCustomCity] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCity.trim()) {
      setLocationByName(customCity.trim());
      setCustomCity("");
      setShowLocationSelector(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight dark:text-white">
            Weather Forecast & Agricultural Intelligence
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Real-time weather forecast & rain probability for {currentWeather.location}
          </p>
        </div>

        {/* Change City/Village & Live GPS Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={detectLiveLocation}
            disabled={isDetectingGPS}
          >
            <Locate className={`h-4 w-4 ${isDetectingGPS ? "animate-spin" : ""}`} />
            {isDetectingGPS ? "Locating GPS..." : "Detect Live GPS"}
          </Button>

          <div className="relative">
            <Button
              size="sm"
              onClick={() => setShowLocationSelector(!showLocationSelector)}
            >
              <MapPin className="h-4 w-4" />
              Change City / Village
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>

            {showLocationSelector && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-zinc-200 p-4 z-50 animate-fade-in dark:bg-black dark:border-zinc-800">
                <p className="text-xs font-bold text-zinc-700 mb-2 dark:text-zinc-300">
                  Select or Type City/Village:
                </p>

                <form onSubmit={handleCustomSubmit} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="e.g. Mandya, Mysuru, Pune..."
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="flex-1 h-9 px-3 text-xs bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#00ab41] dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                  />
                  <Button type="submit" size="sm">
                    Search
                  </Button>
                </form>

                <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button
                      key={loc.location}
                      onClick={() => {
                        setLocationByName(loc.location);
                        setShowLocationSelector(false);
                      }}
                      className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-colors font-medium ${
                        currentWeather.location === loc.location
                          ? "bg-[#008631] text-white font-bold"
                          : "hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
                      }`}
                    >
                      📍 {loc.location}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Weather Banner */}
      <div className="bg-gradient-to-br from-[#008631] via-emerald-700 to-[#00ab41] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-4 bottom-0 opacity-15 pointer-events-none">
          <CloudSun className="h-64 w-64" />
        </div>

        <div className="relative z-10 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-black/20 backdrop-blur-md px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-amber-300" />
            Live Weather · {currentWeather.location}
          </span>

          <div className="flex items-baseline gap-4 mt-4">
            <span className="text-6xl font-extrabold tracking-tight">
              {currentWeather.temperature}°C
            </span>
            <div>
              <p className="text-xl font-bold text-emerald-100">
                {currentWeather.condition}
              </p>
              <p className="text-xs text-emerald-200">
                {currentWeather.rainfallExpected}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20 text-xs">
            <div>
              <p className="text-emerald-200">Humidity</p>
              <p className="text-lg font-bold">{currentWeather.humidity}%</p>
            </div>
            <div>
              <p className="text-emerald-200">Wind Speed</p>
              <p className="text-lg font-bold">{currentWeather.windSpeed} km/h</p>
            </div>
            <div>
              <p className="text-emerald-200">Rain Prob.</p>
              <p className="text-lg font-bold">{currentWeather.rainProbability}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Agricultural Forecast */}
      <div>
        <h3 className="text-lg font-bold text-zinc-900 mb-3 dark:text-white">
          5-Day Forecast for {currentWeather.location}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {currentWeather.forecast.map((day, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-zinc-200/80 p-4 text-center dark:bg-black dark:border-zinc-800"
            >
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {day.day}
              </p>
              <CloudSun className="h-8 w-8 text-[#00ab41] mx-auto my-2" />
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                {day.temp}
              </p>
              <p className="text-xs text-blue-600 font-bold mt-1 dark:text-blue-400">
                💧 {day.rain}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Cloud,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  CloudLightning,
  Locate,
  Search,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { useWeatherStore, POPULAR_LOCATIONS } from "@/stores/weather-store";

const CONDITION_ICONS: Record<string, React.ElementType> = {
  Sunny: Sun,
  "Partly Cloudy": Cloud,
  Cloudy: Cloud,
  "Heavy Rain": CloudRain,
  Thunderstorm: CloudLightning,
  "Sunny & Dry": Sun,
  "Cloudy & Cool": Cloud,
  Pleasant: Cloud,
  "Warm & Sunny": Sun,
  "Live GPS": Locate,
};

export function WeatherWidget() {
  const { currentWeather, setLocationByName, detectLiveLocation, isDetectingGPS } =
    useWeatherStore();
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [customCityInput, setCustomCityInput] = useState("");

  const ConditionIcon = CONDITION_ICONS[currentWeather.condition] || Cloud;

  const handleSelectLocation = (locName: string) => {
    setLocationByName(locName);
    setShowLocationSelector(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCityInput.trim()) {
      setLocationByName(customCityInput.trim());
      setCustomCityInput("");
      setShowLocationSelector(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden dark:bg-black dark:border-zinc-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#008631] via-emerald-700 to-[#00ab41] p-4 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute right-4 bottom-4 opacity-20">
          <ConditionIcon className="h-16 w-16" />
        </div>

        {/* Location selector bar */}
        <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
          <button
            onClick={() => setShowLocationSelector(!showLocationSelector)}
            className="flex items-center gap-1.5 bg-black/20 hover:bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white transition-all cursor-pointer"
          >
            <MapPin className="h-3.5 w-3.5 text-amber-300" />
            <span>{currentWeather.location}</span>
            <ChevronDown className="h-3 w-3 text-emerald-200" />
          </button>

          {/* GPS Live Location Button */}
          <button
            onClick={detectLiveLocation}
            disabled={isDetectingGPS}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white transition-all cursor-pointer"
            title="Use Live Browser GPS Location"
          >
            <Locate className={`h-3 w-3 ${isDetectingGPS ? "animate-spin" : ""}`} />
            <span>{isDetectingGPS ? "Locating..." : "Live GPS"}</span>
          </button>
        </div>

        {/* City / Village Selector Dropdown */}
        {showLocationSelector && (
          <div className="mb-3 p-3 bg-black/80 backdrop-blur-xl rounded-xl border border-white/20 z-20 animate-fade-in relative">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 mb-2">
              Select City or Village
            </p>

            {/* Custom Input */}
            <form onSubmit={handleCustomSubmit} className="flex gap-1.5 mb-2">
              <input
                type="text"
                placeholder="Type any city/village name..."
                value={customCityInput}
                onChange={(e) => setCustomCityInput(e.target.value)}
                className="flex-1 h-7 px-2.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#00ab41]"
              />
              <button
                type="submit"
                className="px-2.5 h-7 bg-[#00ab41] text-white font-bold text-xs rounded-lg hover:bg-[#008631] transition-colors"
              >
                Go
              </button>
            </form>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto scrollbar-thin">
              {POPULAR_LOCATIONS.map((loc) => (
                <button
                  key={loc.location}
                  onClick={() => handleSelectLocation(loc.location)}
                  className={`text-left text-xs px-2 py-1 rounded-lg transition-colors font-medium truncate ${
                    currentWeather.location === loc.location
                      ? "bg-[#00ab41] text-white font-bold"
                      : "hover:bg-white/10 text-zinc-200"
                  }`}
                >
                  📍 {loc.location}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Temperature & Condition */}
        <div className="flex items-end gap-2 mt-1">
          <span className="text-4xl font-extrabold leading-none">
            {currentWeather.temperature}°
          </span>
          <span className="text-sm text-emerald-100 pb-1">C</span>
        </div>
        <p className="text-sm font-semibold text-emerald-100 mt-1">
          {currentWeather.condition}
        </p>
      </div>

      {/* Weather stats */}
      <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800">
        <div className="p-3 text-center">
          <Droplets className="h-4 w-4 mx-auto text-blue-500 mb-1" />
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Humidity</p>
          <p className="text-sm font-bold text-zinc-900 dark:text-white">
            {currentWeather.humidity}%
          </p>
        </div>
        <div className="p-3 text-center">
          <Wind className="h-4 w-4 mx-auto text-zinc-500 mb-1" />
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Wind</p>
          <p className="text-sm font-bold text-zinc-900 dark:text-white">
            {currentWeather.windSpeed} km/h
          </p>
        </div>
        <div className="p-3 text-center">
          <CloudRain className="h-4 w-4 mx-auto text-[#00ab41] mb-1" />
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Rain</p>
          <p className="text-sm font-bold text-zinc-900 dark:text-white">
            {currentWeather.rainProbability}%
          </p>
        </div>
      </div>

      {/* Rainfall alert */}
      <div className="mx-4 mb-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl dark:bg-amber-500/15">
        <div className="flex items-center gap-2">
          <CloudRain className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            {currentWeather.rainfallExpected}
          </p>
        </div>
      </div>

      {/* 5-day Forecast */}
      <div className="px-4 pb-4">
        <p className="text-xs font-bold text-zinc-700 mb-2 dark:text-zinc-300">
          5-Day Forecast for {currentWeather.location.split(",")[0]}
        </p>
        <div className="space-y-1.5">
          {currentWeather.forecast.map((day, i) => {
            const DayIcon = CONDITION_ICONS[day.condition] || Cloud;
            return (
              <div
                key={i}
                className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-zinc-50 transition-colors dark:hover:bg-zinc-900"
              >
                <span className="font-semibold text-zinc-700 w-12 dark:text-zinc-300">
                  {day.day}
                </span>
                <DayIcon className="h-4 w-4 text-zinc-400" />
                <span className="text-zinc-600 dark:text-zinc-400 w-24 text-right">
                  {day.temp}
                </span>
                <span className="text-blue-600 font-bold w-8 text-right dark:text-blue-400">
                  {day.rain}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

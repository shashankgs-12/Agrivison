"use client";

import React, { useState, useCallback } from "react";
import { Locate, AlertCircle, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import {
  calculateGeodesicArea,
  calculatePerimeter,
  reverseGeocodeAddress,
} from "@/lib/gis/geo-utils";
import { useWeatherStore } from "@/stores/weather-store";

const GISMapEngine = dynamic(() => import("./gis-map-engine"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] w-full bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-bold animate-pulse">
      Loading GIS Map Engine...
    </div>
  ),
});

export interface LeafletMapProps {
  initialLat?: number;
  initialLng?: number;
  interactive?: boolean;
  isReadOnly?: boolean;
  onLocationSelect?: (coords: { lat: number; lng: number; address: string }) => void;
  onAreaCalculated?: (areaAcres: number) => void;
  farmMarkers?: Array<{ id: string; name: string; lat: number; lng: number; area: number }>;
}

export default function InteractiveFarmMap({
  initialLat = 12.9716,
  initialLng = 77.5946,
  interactive = true,
  isReadOnly = false,
  onLocationSelect,
  onAreaCalculated,
  farmMarkers = [],
}: LeafletMapProps) {
  const { updateLocation } = useWeatherStore();
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });

  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [calculatedArea, setCalculatedArea] = useState<number>(0);
  const [calculatedPerimeter, setCalculatedPerimeter] = useState<number>(0);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);

  const handleCenterGPS = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCenter({ lat: latitude, lng: longitude });
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
        setIsDetecting(false);

        const address = await reverseGeocodeAddress(latitude, longitude);
        setSelectedAddress(address);
        updateLocation(latitude, longitude, address);

        if (onLocationSelect) {
          onLocationSelect({ lat: latitude, lng: longitude, address });
        }
      },
      (err) => {
        setIsDetecting(false);
        setGpsError("Location access denied. Enable GPS to center map.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [onLocationSelect, updateLocation]);

  const handleMapClick = useCallback(
    async (coords: { lat: number; lng: number }) => {
      if (isReadOnly || !interactive) return;

      const newPoint: [number, number] = [coords.lat, coords.lng];
      const updatedPoints = [...polygonPoints, newPoint];
      setPolygonPoints(updatedPoints);

      const areaResult = calculateGeodesicArea(updatedPoints);
      const perimResult = calculatePerimeter(updatedPoints);

      setCalculatedArea(areaResult.acres);
      setCalculatedPerimeter(perimResult.meters);

      if (onAreaCalculated) {
        onAreaCalculated(areaResult.acres);
      }

      const address = await reverseGeocodeAddress(coords.lat, coords.lng);
      setSelectedAddress(address);
      updateLocation(coords.lat, coords.lng, address);

      if (onLocationSelect) {
        onLocationSelect({ lat: coords.lat, lng: coords.lng, address });
      }
    },
    [isReadOnly, interactive, polygonPoints, onAreaCalculated, onLocationSelect, updateLocation]
  );

  return (
    <div className="relative w-full">
      {gpsError && (
        <div className="absolute top-3 left-3 right-3 z-[1000] bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button onClick={() => setGpsError(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      <GISMapEngine
        center={center}
        zoom={15}
        mapMode="satellite"
        interactive={interactive}
        isReadOnly={isReadOnly}
        farmMarkers={farmMarkers}
        polygonPoints={polygonPoints}
        userLocation={userLocation}
        onMapClick={handleMapClick}
      />

      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleCenterGPS}
          disabled={isDetecting}
          className="p-3 bg-white/95 hover:bg-slate-50 text-slate-800 rounded-xl shadow-lg border border-slate-200 transition-all dark:bg-slate-900 dark:text-white dark:border-slate-700 flex items-center gap-2 text-xs font-bold"
          title="Center on my GPS Location"
        >
          <Locate className={`h-4 w-4 text-emerald-600 ${isDetecting ? "animate-spin" : ""}`} />
          <span>{isDetecting ? "Locating..." : "Center GPS"}</span>
        </button>
      </div>
    </div>
  );
}

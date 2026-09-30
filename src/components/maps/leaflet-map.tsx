"use client";

import React, { useState, useCallback } from "react";
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
    <div className="h-[420px] sm:h-[460px] w-full bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-bold animate-pulse">
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
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);

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
      updateLocation(coords.lat, coords.lng, address);

      if (onLocationSelect) {
        onLocationSelect({ lat: coords.lat, lng: coords.lng, address });
      }
    },
    [isReadOnly, interactive, polygonPoints, onAreaCalculated, onLocationSelect, updateLocation]
  );

  return (
    <div className="relative w-full">
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
        onLocationSelect={async ({ lat, lng, label, accuracy }) => {
          setCenter({ lat, lng });
          if (accuracy !== undefined) setUserLocation({ lat, lng, accuracy });
          const address = label === "Current location" ? await reverseGeocodeAddress(lat, lng) : label;
          updateLocation(lat, lng, address);
          onLocationSelect?.({ lat, lng, address });
        }}
      />
    </div>
  );
}

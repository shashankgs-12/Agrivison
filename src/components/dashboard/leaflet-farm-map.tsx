"use client";

import React, { useEffect, useRef, useState } from "react";
import { Layers, Satellite, MapPin, Trash2 } from "lucide-react";
import { useFarms } from "@/hooks/use-farms";
import { useWeatherStore } from "@/stores/weather-store";
import { useAuthStore } from "@/stores/auth-store";

export function LeafletFarmMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const { user } = useAuthStore();
  const { farms, addFarm } = useFarms();
  const { weather } = useWeatherStore();
  const [mapMode, setMapMode] = useState<"map" | "satellite">("satellite");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let L: any;
    import("leaflet").then((leafletModule) => {
      L = leafletModule.default;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const centerLat = weather?.latitude || 12.9716;
        const centerLng = weather?.longitude || 77.5946;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          zoomControl: false,
        });

        L.control.zoom({ position: "topright" }).addTo(map);
        mapInstanceRef.current = map;

        map.on("click", (e: any) => {
          const newLat = e.latlng.lat;
          const newLng = e.latlng.lng;
          addFarm({
            ownerId: user?.uid,
            name: `Farm (${newLat.toFixed(3)}°, ${newLng.toFixed(3)}°)`,
            area: 5.0,
            crop: "Registered Crop",
            status: "Healthy",
            location: weather?.locationName || `${newLat.toFixed(2)}°, ${newLng.toFixed(2)}°`,
            coordinates: { lat: newLat, lng: newLng },
          });
        });
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }

      if (mapMode === "satellite") {
        tileLayerRef.current = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 18,
            attribution: "Esri World Imagery",
          }
        ).addTo(map);
      } else {
        tileLayerRef.current = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap",
          }
        ).addTo(map);
      }

      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      farms.forEach((farm) => {
        const markerIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(5, 150, 105, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 32px; height: 32px; border-radius: 9999px; background: linear-gradient(135deg, #059669, #10b981); border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        });

        const marker = L.marker([farm.coordinates.lat, farm.coordinates.lng], {
          icon: markerIcon,
        }).addTo(map);

        marker.bindPopup(`
          <div style="padding: 4px; font-family: sans-serif;">
            <strong style="font-size: 13px; color: #09090b; display: block; margin-bottom: 2px;">${farm.name}</strong>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">📐 ${farm.area} Acres · ${farm.status}</div>
          </div>
        `);

        markersRef.current.push(marker);
      });
    });
  }, [isClient, mapMode, farms, weather]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Interactive Satellite & Farm Map
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              📍 {weather?.locationName || "GPS Location"} · Click map to add farm pin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMapMode("map")}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              mapMode === "map"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <Layers className="h-3 w-3" /> Map
          </button>
          <button
            onClick={() => setMapMode("satellite")}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              mapMode === "satellite"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <Satellite className="h-3 w-3 text-amber-300" /> Satellite
          </button>
        </div>
      </div>

      <div className="relative h-72 md:h-96 w-full bg-slate-900">
        <div ref={mapContainerRef} className="h-full w-full z-0" />
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { Layers, Satellite, MapPin, Trash2, Plus, Locate } from "lucide-react";
import { useFarmStore } from "@/stores/farm-store";
import { useWeatherStore } from "@/stores/weather-store";

export function LeafletFarmMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const { farms, deleteFarm, addFarm } = useFarmStore();
  const { currentWeather } = useWeatherStore();
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

      // Fix Leaflet marker icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current) {
        const centerLat = currentWeather.lat || 12.5218;
        const centerLng = currentWeather.lng || 76.8951;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          zoomControl: false,
        });

        // Add custom zoom control in top right
        L.control.zoom({ position: "topright" }).addTo(map);

        mapInstanceRef.current = map;

        // Click handler to drop pin & create farm land
        map.on("click", (e: any) => {
          const newLat = e.latlng.lat;
          const newLng = e.latlng.lng;
          addFarm({
            name: `New Farm (${newLat.toFixed(3)}°, ${newLng.toFixed(3)}°)`,
            area: 5.5,
            crop: "Paddy / Wheat",
            status: "Healthy",
            location: `${currentWeather.location}`,
            coordinates: { lat: newLat, lng: newLng },
          });
        });
      }

      // Update Tile Layer (Satellite vs Map)
      const map = mapInstanceRef.current;
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }

      if (mapMode === "satellite") {
        // High-resolution Esri World Imagery Satellite Tiles
        tileLayerRef.current = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 18,
            attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          }
        ).addTo(map);
      } else {
        // High-contrast Vector Map Tiles (CartoDB / OpenStreetMap)
        tileLayerRef.current = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 19,
            attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          }
        ).addTo(map);
      }

      // Clear existing markers & draw fresh markers for farms
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      farms.forEach((farm) => {
        const markerIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(0, 171, 65, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 32px; height: 32px; border-radius: 9999px; background: linear-gradient(135deg, #008631, #00ab41); border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
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
            <span style="font-size: 11px; color: #008631; font-weight: 700;">🌾 ${farm.crop}</span>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">📐 ${farm.area} Acres · ${farm.status}</div>
          </div>
        `);

        markersRef.current.push(marker);
      });

      // Pan map center when weather location changes
      if (currentWeather.lat && currentWeather.lng) {
        map.panTo([currentWeather.lat, currentWeather.lng]);
      }
    });
  }, [isClient, mapMode, farms, currentWeather]);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden dark:bg-black dark:border-zinc-800">
      {/* CSS Link for Leaflet */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      {/* Header bar */}
      <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#00ab41]" />
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
              Interactive Satellite & Farm Map
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              📍 {currentWeather.location} · Click map to add farm pin
            </p>
          </div>
        </div>

        {/* Map vs Satellite Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMapMode("map")}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              mapMode === "map"
                ? "bg-[#008631] text-white shadow-sm"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-200"
            }`}
          >
            <Layers className="h-3 w-3" />
            Map
          </button>
          <button
            onClick={() => setMapMode("satellite")}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              mapMode === "satellite"
                ? "bg-[#008631] text-white shadow-sm ring-2 ring-[#00ab41]/40"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 hover:bg-zinc-200"
            }`}
          >
            <Satellite className="h-3 w-3 text-amber-300" />
            Satellite
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-72 md:h-96 w-full bg-zinc-900">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Map Mode Badge overlay */}
        <div className="absolute top-3 left-3 z-[400] bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white border border-white/20 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#00ab41] animate-pulse" />
          {mapMode === "satellite" ? "🛰️ High-Res Esri Satellite View" : "🗺️ Vector Map View"}
        </div>
      </div>

      {/* Farm list strip with delete option */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {farms.map((farm) => (
            <div
              key={farm.id}
              className="flex-shrink-0 flex items-center justify-between gap-3 px-3 py-2 bg-zinc-50 rounded-xl border border-zinc-200/80 hover:border-[#00ab41] transition-colors dark:bg-zinc-900/60 dark:border-zinc-800 dark:hover:border-[#00ab41]"
            >
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#00ab41] shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-zinc-800 whitespace-nowrap dark:text-zinc-200">
                    {farm.name}
                  </p>
                  <p className="text-[9px] text-zinc-500 whitespace-nowrap dark:text-zinc-400">
                    {farm.area} Acres · {farm.status}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteFarm(farm.id)}
                className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Delete Farm Land"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {farms.length === 0 && (
            <span className="text-xs text-zinc-400 p-1">No farm lands active. Click map to add a farm.</span>
          )}
        </div>
      </div>
    </div>
  );
}

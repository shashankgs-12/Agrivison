"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Satellite,
  Layers,
  Map as MapIcon,
  Navigation,
  Locate,
  Compass,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export type MapMode = "satellite" | "terrain" | "street" | "hybrid";

export interface GISMapEngineProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  mapMode?: MapMode;
  showControls?: boolean;
  showLocationBadge?: boolean;
  interactive?: boolean;
  isReadOnly?: boolean;
  farmMarkers?: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    area: number;
    status?: string;
  }>;
  polygonPoints?: [number, number][];
  liveTrackPoints?: [number, number][];
  userLocation?: { lat: number; lng: number; accuracy?: number } | null;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  onMarkerClick?: (farmId: string) => void;
  className?: string;
  height?: string;
}

// Ultra-reliable High-Resolution Satellite & Map Tile Servers
const TILE_SERVERS: Record<MapMode, { url: string; attribution: string; maxZoom: number; subdomains?: string[] }> = {
  satellite: {
    url: "https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Satellite Imagery",
    maxZoom: 20,
    subdomains: ["0", "1", "2", "3"],
  },
  hybrid: {
    url: "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Hybrid Imagery",
    maxZoom: 20,
    subdomains: ["0", "1", "2", "3"],
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenTopoMap contributors",
    maxZoom: 17,
  },
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  },
};

export const GISMapEngine: React.FC<GISMapEngineProps> = React.memo(
  ({
    center = { lat: 12.9716, lng: 77.5946 },
    zoom = 15,
    mapMode: initialMapMode = "satellite",
    showControls = true,
    showLocationBadge = true,
    interactive = true,
    isReadOnly = false,
    farmMarkers = [],
    polygonPoints = [],
    liveTrackPoints = [],
    userLocation = null,
    onMapClick,
    onMarkerClick,
    className = "",
    height = "h-[380px]",
  }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
    const tileLayerRef = useRef<import("leaflet").TileLayer | null>(null);
    const markerGroupRef = useRef<import("leaflet").LayerGroup | null>(null);
    const polygonGroupRef = useRef<import("leaflet").LayerGroup | null>(null);
    const liveTrackGroupRef = useRef<import("leaflet").LayerGroup | null>(null);
    const userLocationGroupRef = useRef<import("leaflet").LayerGroup | null>(null);

    const [currentMode, setCurrentMode] = useState<MapMode>(initialMapMode);
    const [isMapReady, setIsMapReady] = useState(false);

    // Sync currentMode state when initialMapMode prop changes from parent
    useEffect(() => {
      if (initialMapMode) {
        setCurrentMode(initialMapMode);
      }
    }, [initialMapMode]);

    // Keep callbacks fresh using refs to prevent map effect teardowns
    const onMapClickRef = useRef(onMapClick);
    onMapClickRef.current = onMapClick;

    const onMarkerClickRef = useRef(onMarkerClick);
    onMarkerClickRef.current = onMarkerClick;

    const isReadOnlyRef = useRef(isReadOnly);
    isReadOnlyRef.current = isReadOnly;

    // 1. Initialize Map Instance EXACTLY ONCE
    useEffect(() => {
      if (typeof window === "undefined" || !containerRef.current) return;

      let isSubscribed = true;

      import("leaflet").then((L) => {
        if (!isSubscribed || !containerRef.current) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        if (!mapInstanceRef.current && containerRef.current) {
          // Safety cleanup for React 18 strict mode / fast refresh
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((containerRef.current as any)._leaflet_id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (containerRef.current as any)._leaflet_id = null;
          }

          const map = L.map(containerRef.current, {
            center: [center.lat, center.lng],
            zoom: zoom,
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: interactive,
            doubleClickZoom: interactive,
            dragging: interactive,
          });

          L.control.zoom({ position: "topright" }).addTo(map);

          mapInstanceRef.current = map;
          markerGroupRef.current = L.layerGroup().addTo(map);
          polygonGroupRef.current = L.layerGroup().addTo(map);
          liveTrackGroupRef.current = L.layerGroup().addTo(map);
          userLocationGroupRef.current = L.layerGroup().addTo(map);

          map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
            if (isReadOnlyRef.current) return;
            if (onMapClickRef.current) {
              onMapClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
            }
          });

          const observer = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          });

          if (containerRef.current) {
            observer.observe(containerRef.current);
          }

          setIsMapReady(true);

          requestAnimationFrame(() => map.invalidateSize());
          setTimeout(() => map.invalidateSize(), 100);
          setTimeout(() => map.invalidateSize(), 300);
        }
      });

      return () => {
        isSubscribed = false;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }, []); // Run once on mount

    // 2. Handle Tile Layer Changes (Satellite, Terrain, Street, Hybrid)
    useEffect(() => {
      if (!mapInstanceRef.current || !isMapReady) return;

      import("leaflet").then((L) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (tileLayerRef.current) {
          map.removeLayer(tileLayerRef.current);
          tileLayerRef.current = null;
        }

        const config = TILE_SERVERS[currentMode];
        const newTileLayer = L.tileLayer(config.url, {
          maxZoom: config.maxZoom,
          attribution: config.attribution,
          subdomains: config.subdomains || ["0", "1", "2", "3"],
          tileSize: 256,
          zoomOffset: 0,
        });

        newTileLayer.addTo(map);
        tileLayerRef.current = newTileLayer;
        map.invalidateSize();
      });
    }, [currentMode, isMapReady]);

    // 3. Smooth FlyTo Pan on Center Updates
    useEffect(() => {
      if (!mapInstanceRef.current || !isMapReady) return;
      const map = mapInstanceRef.current;
      const currentCenter = map.getCenter();
      const dist = Math.hypot(
        currentCenter.lat - center.lat,
        currentCenter.lng - center.lng
      );

      if (dist > 0.00005) {
        map.flyTo([center.lat, center.lng], zoom, {
          animate: true,
          duration: 1.2,
        });
      }

      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 300);
    }, [center.lat, center.lng, zoom, isMapReady]);

    // 4. Update Farm Markers Layer
    useEffect(() => {
      if (!mapInstanceRef.current || !isMapReady) return;

      import("leaflet").then((L) => {
        const markerGroup = markerGroupRef.current;
        if (!markerGroup) return;

        markerGroup.clearLayers();

        farmMarkers.forEach((farm) => {
          const markerHtml = `
            <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(16, 185, 129, 0.3); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background: linear-gradient(135deg, #059669, #10b981); border: 2.5px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
            </div>
          `;

          const customIcon = L.divIcon({
            className: "gis-farm-marker",
            html: markerHtml,
            iconSize: [38, 38],
            iconAnchor: [19, 38],
          });

          const marker = L.marker([farm.lat, farm.lng], { icon: customIcon });
          marker.bindPopup(`
            <div style="padding: 4px; font-family: system-ui, sans-serif;">
              <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 2px;">${farm.name}</strong>
              <div style="font-size: 11px; color: #475569;">📐 ${farm.area} Acres ${farm.status ? `· ${farm.status}` : ""}</div>
            </div>
          `);

          marker.on("click", () => {
            if (onMarkerClickRef.current) {
              onMarkerClickRef.current(farm.id);
            }
          });

          markerGroup.addLayer(marker);
        });
      });
    }, [farmMarkers, isMapReady]);

    // 5. Update Polygon & Vertex Layer
    useEffect(() => {
      if (!mapInstanceRef.current || !isMapReady) return;

      import("leaflet").then((L) => {
        const polyGroup = polygonGroupRef.current;
        if (!polyGroup) return;

        polyGroup.clearLayers();

        if (polygonPoints && polygonPoints.length > 0) {
          polygonPoints.forEach((pt) => {
            const circle = L.circleMarker(pt, {
              radius: 6,
              color: "#059669",
              fillColor: "#10b981",
              fillOpacity: 0.95,
              weight: 2,
            });
            polyGroup.addLayer(circle);
          });

          if (polygonPoints.length === 2) {
            const line = L.polyline(polygonPoints, {
              color: "#10b981",
              weight: 3,
              dashArray: "6, 6",
            });
            polyGroup.addLayer(line);
          }

          if (polygonPoints.length >= 3) {
            const polygon = L.polygon(polygonPoints, {
              color: "#059669",
              weight: 3.5,
              fillColor: "#10b981",
              fillOpacity: 0.35,
            });
            polyGroup.addLayer(polygon);
          }
        }
      });
    }, [polygonPoints, isMapReady]);

    // 6. Update Live Tracking GPS Walk Path Layer
    useEffect(() => {
      if (!mapInstanceRef.current || !isMapReady) return;

      import("leaflet").then((L) => {
        const trackGroup = liveTrackGroupRef.current;
        if (!trackGroup) return;

        trackGroup.clearLayers();

        if (liveTrackPoints && liveTrackPoints.length > 0) {
          const polyline = L.polyline(liveTrackPoints, {
            color: "#0284c7",
            weight: 4,
            opacity: 0.95,
          });
          trackGroup.addLayer(polyline);

          const startPt = liveTrackPoints[0];
          const startMarker = L.circleMarker(startPt, {
            radius: 7,
            color: "#0284c7",
            fillColor: "#38bdf8",
            fillOpacity: 1,
            weight: 2,
          });
          trackGroup.addLayer(startMarker);

          const currentPt = liveTrackPoints[liveTrackPoints.length - 1];
          const activeMarker = L.circleMarker(currentPt, {
            radius: 8,
            color: "#2563eb",
            fillColor: "#60a5fa",
            fillOpacity: 1,
            weight: 3,
          });
          trackGroup.addLayer(activeMarker);
        }
      });
    }, [liveTrackPoints, isMapReady]);

    // 7. Update User Current GPS Location Marker & Accuracy Circle
    useEffect(() => {
      if (!mapInstanceRef.current || !isMapReady) return;

      import("leaflet").then((L) => {
        const userGroup = userLocationGroupRef.current;
        if (!userGroup) return;

        userGroup.clearLayers();

        if (userLocation) {
          const { lat, lng, accuracy } = userLocation;

          if (accuracy && accuracy > 0) {
            const accCircle = L.circle([lat, lng], {
              radius: accuracy,
              color: "#3b82f6",
              fillColor: "#93c5fd",
              fillOpacity: 0.15,
              weight: 1,
            });
            userGroup.addLayer(accCircle);
          }

          const userMarker = L.circleMarker([lat, lng], {
            radius: 7,
            color: "#ffffff",
            fillColor: "#2563eb",
            fillOpacity: 1,
            weight: 2.5,
          });
          userGroup.addLayer(userMarker);
        }
      });
    }, [userLocation, isMapReady]);

    return (
      <div
        className={`relative w-full ${height} min-h-[340px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm dark:border-slate-800 ${className}`}
      >
        {/* Persistent Map Container */}
        <div ref={containerRef} className="w-full h-full min-h-[340px] bg-slate-950 z-0" />

        {/* Compact Modern GPS Status Indicator */}
        {showLocationBadge && (
          <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 shadow-md text-white text-xs flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>GPS Connected</span>
            </div>
            {userLocation?.accuracy ? (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-300 font-medium">
                  Accuracy: {userLocation.accuracy.toFixed(0)}m
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[11px] text-slate-300">
                  {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                </span>
              </>
            )}
          </div>
        )}

        {/* Map Layer Switcher Control */}
        {showControls && (
          <div className="absolute top-3 right-3 z-[1000] flex items-center bg-white/95 backdrop-blur-md dark:bg-slate-900/95 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs font-bold gap-1">
            <button
              onClick={() => setCurrentMode("satellite")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                currentMode === "satellite"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Satellite className="h-3.5 w-3.5" />
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setCurrentMode("hybrid")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                currentMode === "hybrid"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Hybrid</span>
            </button>
            <button
              onClick={() => setCurrentMode("street")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                currentMode === "street"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>Street</span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

GISMapEngine.displayName = "GISMapEngine";

export default GISMapEngine;

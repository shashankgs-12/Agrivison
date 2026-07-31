"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Locate, AlertCircle, RefreshCw } from "lucide-react";

interface LeafletMapProps {
  initialLat?: number;
  initialLng?: number;
  interactive?: boolean;
  onLocationSelect?: (coords: { lat: number; lng: number; address: string }) => void;
  onAreaCalculated?: (areaAcres: number) => void;
  farmMarkers?: Array<{ id: string; name: string; lat: number; lng: number; area: number }>;
}

export default function InteractiveFarmMap({
  initialLat = 12.9716,
  initialLng = 77.5946,
  interactive = true,
  onLocationSelect,
  onAreaCalculated,
  farmMarkers = [],
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletInstance = useRef<any>(null);
  const markerGroup = useRef<any>(null);
  const polygonLayer = useRef<any>(null);

  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });

  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [calculatedArea, setCalculatedArea] = useState<number>(0);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  // Function to calculate polygon area in acres using Shoelace formula
  const calculateAreaAcres = (coords: [number, number][]): number => {
    if (coords.length < 3) return 0;
    let areaSqMeters = 0;

    const R = 6378137; // Earth radius in meters
    const numPoints = coords.length;

    for (let i = 0; i < numPoints; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % numPoints];

      const lat1 = (p1[0] * Math.PI) / 180;
      const lat2 = (p2[0] * Math.PI) / 180;
      const lon1 = (p1[1] * Math.PI) / 180;
      const lon2 = (p2[1] * Math.PI) / 180;

      areaSqMeters += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    areaSqMeters = Math.abs((areaSqMeters * R * R) / 2);
    const acres = areaSqMeters / 4046.86; // 1 acre = 4046.86 m²
    return Number(acres.toFixed(2));
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "User-Agent": "AgriVisionAI/1.0" } }
      );
      if (res.ok) {
        const data = await res.json();
        const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setSelectedAddress(address);
        if (onLocationSelect) {
          onLocationSelect({ lat, lng, address });
        }
      }
    } catch (e) {
      console.warn("Reverse geocode failed:", e);
    }
  };

  const handleCenterGPS = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPos({ lat: latitude, lng: longitude });
        setIsDetecting(false);

        if (leafletInstance.current) {
          leafletInstance.current.setView([latitude, longitude], 15);
        }
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        setIsDetecting(false);
        setGpsError("Location access denied. Enable GPS to center map on your position.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // Load Leaflet dynamically
    import("leaflet").then((L) => {
      // Fix default leafet icon URLs
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      if (!leafletInstance.current && mapRef.current) {
        const map = L.map(mapRef.current).setView([currentPos.lat, currentPos.lng], 13);

        // OpenStreetMap Satellite / Tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        leafletInstance.current = map;
        markerGroup.current = L.layerGroup().addTo(map);
        polygonLayer.current = L.layerGroup().addTo(map);

        if (interactive) {
          map.on("click", (e: any) => {
            const { lat, lng } = e.latlng;
            setPolygonPoints((prev) => {
              const updated = [...prev, [lat, lng] as [number, number]];
              const acres = calculateAreaAcres(updated);
              setCalculatedArea(acres);
              if (onAreaCalculated) onAreaCalculated(acres);
              return updated;
            });
            reverseGeocode(lat, lng);
          });
        }
      }
    });

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, []);

  // Update Markers & Polygon on point changes
  useEffect(() => {
    if (!leafletInstance.current) return;

    import("leaflet").then((L) => {
      if (markerGroup.current) markerGroup.current.clearLayers();
      if (polygonLayer.current) polygonLayer.current.clearLayers();

      // Render custom farm markers
      farmMarkers.forEach((farm) => {
        const marker = L.marker([farm.lat, farm.lng]).bindPopup(
          `<b>${farm.name}</b><br/>Area: ${farm.area} Acres`
        );
        markerGroup.current.addLayer(marker);
      });

      // Render polygon if points exist
      if (polygonPoints.length > 0) {
        polygonPoints.forEach((pt) => {
          const pointMarker = L.circleMarker(pt, {
            radius: 6,
            color: "#059669",
            fillColor: "#10b981",
            fillOpacity: 0.8,
          });
          markerGroup.current.addLayer(pointMarker);
        });

        if (polygonPoints.length >= 3) {
          const poly = L.polygon(polygonPoints, {
            color: "#059669",
            weight: 3,
            fillColor: "#10b981",
            fillOpacity: 0.3,
          });
          polygonLayer.current.addLayer(poly);
        }
      }
    });
  }, [polygonPoints, farmMarkers]);

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-md dark:border-slate-800">
      {/* GPS Error Notification Banner */}
      {gpsError && (
        <div className="absolute top-3 left-3 right-3 z-[1000] bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{gpsError}</span>
          </div>
          <button onClick={() => setGpsError(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Map Controls Floating Overlay */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleCenterGPS}
          disabled={isDetecting}
          className="p-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl shadow-lg border border-slate-200 transition-all dark:bg-slate-900 dark:text-white dark:border-slate-700 flex items-center gap-2 text-xs font-bold"
          title="Center on my GPS Location"
        >
          <Locate className={`h-4 w-4 text-emerald-600 ${isDetecting ? "animate-spin" : ""}`} />
          <span>{isDetecting ? "Locating..." : "Center GPS"}</span>
        </button>

        {polygonPoints.length > 0 && (
          <button
            onClick={() => setPolygonPoints([])}
            className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg text-xs font-bold transition-all"
          >
            Clear Boundary ({polygonPoints.length})
          </button>
        )}
      </div>

      {/* Area & Address Badge */}
      {polygonPoints.length >= 3 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 text-white px-4 py-2 rounded-xl border border-slate-700 backdrop-blur-md shadow-lg text-xs space-y-0.5">
          <p className="font-bold text-emerald-400">Calculated Area: {calculatedArea} Acres</p>
          {selectedAddress && (
            <p className="text-[10px] text-slate-300 truncate max-w-xs">{selectedAddress}</p>
          )}
        </div>
      )}
    </div>
  );
}

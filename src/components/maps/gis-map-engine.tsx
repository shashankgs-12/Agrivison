"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Layers,
  LoaderCircle,
  Locate,
  Map as MapIcon,
  MapPin,
  Search,
  Satellite,
  X,
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
  fitBoundaryToBounds?: boolean;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  onMarkerClick?: (farmId: string) => void;
  onLocationSelect?: (location: { lat: number; lng: number; label: string; accuracy?: number }) => void;
  showNavigationControls?: boolean;
  className?: string;
  height?: string;
}

type LocationResult = { lat: number; lng: number; label: string };
type MapFocusTarget = { lat: number; lng: number; zoom: number };
type MapTilerGeocodingResponse = {
  features?: Array<{
    center?: unknown;
    place_name?: unknown;
    relevance?: unknown;
  }>;
};
type MapMarker = NonNullable<GISMapEngineProps["farmMarkers"]>[number];

const EMPTY_MARKERS: MapMarker[] = [];
const EMPTY_POINTS: [number, number][] = [];

const MAPTILER_STYLES: Record<MapMode, { id: string; format: "jpg" | "png" }> = {
  satellite: { id: "satellite-v4", format: "jpg" },
  hybrid: { id: "hybrid-v4", format: "jpg" },
  street: { id: "streets-v4", format: "png" },
  terrain: { id: "outdoor-v2", format: "png" },
};

const MAPTILER_ATTRIBUTION =
  '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>';

function tileUrl(mode: MapMode, key: string) {
  const style = MAPTILER_STYLES[mode];
  return `https://api.maptiler.com/maps/${style.id}/256/{z}/{x}/{y}.${style.format}?key=${encodeURIComponent(key)}`;
}

function focusMap(
  map: import("leaflet").Map,
  interactedRef: React.MutableRefObject<boolean>,
  targetRef: React.MutableRefObject<MapFocusTarget | null>,
  lat: number,
  lng: number,
  zoom: number
) {
  const current = map.getCenter();
  if (Math.hypot(current.lat - lat, current.lng - lng) < 0.00005 && map.getZoom() === zoom) {
    interactedRef.current = false;
    targetRef.current = null;
    return;
  }
  const target = { lat, lng, zoom };
  targetRef.current = target;
  interactedRef.current = true;
  map.once("moveend", () => {
    if (targetRef.current === target) {
      targetRef.current = null;
      interactedRef.current = false;
    }
  });
  map.flyTo([lat, lng], zoom, { duration: 0.45 });
}

async function searchMapTilerPlaces(
  query: string,
  center: { lat: number; lng: number },
  signal: AbortSignal
): Promise<LocationResult[]> {
  const key = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  if (!key) throw new Error("Place search is not configured. Check the map service configuration.");

  const url = new URL(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`);
  url.searchParams.set("key", key);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("fuzzyMatch", "true");
  url.searchParams.set("country", "in");
  url.searchParams.set("language", "en");
  url.searchParams.set("limit", "8");
  url.searchParams.set("types", "locality,municipality,place,neighbourhood,county,address");
  url.searchParams.set("proximity", `${center.lng},${center.lat}`);

  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]) });
  if (!response.ok) {
    throw new Error(response.status === 403
      ? "Map place search is unavailable for this key. Check its Geocoding API access."
      : "Place search is temporarily unavailable. Try again.");
  }

  const payload = await response.json() as MapTilerGeocodingResponse;
  const seen = new Set<string>();
  return (payload.features ?? [])
    .filter((feature) => Array.isArray(feature.center) && feature.center.length >= 2 && typeof feature.place_name === "string")
    .map((feature) => ({
      lng: Number((feature.center as unknown[])[0]),
      lat: Number((feature.center as unknown[])[1]),
      label: (feature.place_name as string).trim(),
      relevance: typeof feature.relevance === "number" ? feature.relevance : 0,
    }))
    .filter((result) => Number.isFinite(result.lat) && Math.abs(result.lat) <= 90 && Number.isFinite(result.lng) && Math.abs(result.lng) <= 180 && result.label)
    .sort((left, right) => right.relevance - left.relevance)
    .filter((result) => {
      const normalized = result.label.normalize("NFKC").toLocaleLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .slice(0, 8)
    .map(({ lat, lng, label }) => ({ lat, lng, label }));
}

async function searchNominatimPlaces(query: string, signal: AbortSignal): Promise<LocationResult[]> {
  const response = await fetch(`/api/maps?q=${encodeURIComponent(query)}`, { signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]) });
  const payload = await response.json() as { results?: LocationResult[]; error?: string };
  if (!response.ok) throw new Error(payload.error || "Place search is temporarily unavailable. Try again.");
  return payload.results ?? [];
}

export const GISMapEngine: React.FC<GISMapEngineProps> = React.memo(({
  center = { lat: 12.9716, lng: 77.5946 },
  zoom = 15,
  mapMode: initialMapMode = "satellite",
  showControls = true,
  showLocationBadge = true,
  interactive = true,
  isReadOnly = false,
  farmMarkers = EMPTY_MARKERS,
  polygonPoints = EMPTY_POINTS,
  liveTrackPoints = EMPTY_POINTS,
  userLocation = null,
  fitBoundaryToBounds = false,
  onMapClick,
  onMarkerClick,
  onLocationSelect,
  showNavigationControls = true,
  className = "",
  height = "h-[420px] sm:h-[460px]",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const tileLayerRef = useRef<import("leaflet").TileLayer | null>(null);
  const farmMarkersLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const drawingLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const trackLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const locationLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const trackPolylineRef = useRef<import("leaflet").Polyline | null>(null);
  const trackStartMarkerRef = useRef<import("leaflet").CircleMarker | null>(null);
  const trackEndMarkerRef = useRef<import("leaflet").CircleMarker | null>(null);
  const searchMarkerRef = useRef<import("leaflet").CircleMarker | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const resizeFrameRef = useRef<number | null>(null);
  const gpsWatchRef = useRef<number | null>(null);
  const gpsTimeoutRef = useRef<number | null>(null);
  const bestFixRef = useRef<{ lat: number; lng: number; accuracy: number } | null>(null);
  const selectedSearchLabelRef = useRef("");
  const searchAbortRef = useRef<AbortController | null>(null);
  const autocompleteTimerRef = useRef<number | null>(null);
  const interactedRef = useRef(false);
  const mapFocusTargetRef = useRef<MapFocusTarget | null>(null);
  const detectedLocationRef = useRef(userLocation);
  const propsRef = useRef({ center, zoom, interactive, isReadOnly, farmMarkers, polygonPoints, liveTrackPoints, userLocation, onMapClick, onMarkerClick, onLocationSelect });
  propsRef.current = { center, zoom, interactive, isReadOnly, farmMarkers, polygonPoints, liveTrackPoints, userLocation, onMapClick, onMarkerClick, onLocationSelect };

  const [currentMode, setCurrentMode] = useState<MapMode>(initialMapMode);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState(userLocation);
  detectedLocationRef.current = detectedLocation;

  useEffect(() => setCurrentMode(initialMapMode), [initialMapMode]);
  useEffect(() => setDetectedLocation(userLocation), [userLocation]);

  const clearGpsRequest = useCallback(() => {
    if (gpsWatchRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.clearWatch(gpsWatchRef.current);
      gpsWatchRef.current = null;
    }
    if (gpsTimeoutRef.current !== null) {
      window.clearTimeout(gpsTimeoutRef.current);
      gpsTimeoutRef.current = null;
    }
  }, []);

  const renderFarmMarkers = useCallback(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    const markerLayer = farmMarkersLayerRef.current;
    markerLayer?.clearLayers();
    for (const farm of propsRef.current.farmMarkers) {
      const marker = L.circleMarker([farm.lat, farm.lng], {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: "#059669",
        fillOpacity: 1,
      }).bindTooltip(farm.name, { direction: "top", offset: [0, -8] });
      const popup = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = farm.name;
      const details = document.createElement("div");
      details.textContent = `${farm.area} acres${farm.status ? ` · ${farm.status}` : ""}`;
      popup.append(name, details);
      marker.bindPopup(popup);
      marker.on("click", () => {
        focusMap(map, interactedRef, mapFocusTargetRef, farm.lat, farm.lng, Math.max(map.getZoom(), 14));
        propsRef.current.onMarkerClick?.(farm.id);
      });
      markerLayer?.addLayer(marker);
    }
  }, []);

  const renderBoundary = useCallback(() => {
    const L = leafletRef.current;
    if (!L || !mapRef.current) return;
    const drawingLayer = drawingLayerRef.current;
    drawingLayer?.clearLayers();
    const points = propsRef.current.polygonPoints.map(([lat, lng]) => [lat, lng] as [number, number]);
    if (!propsRef.current.isReadOnly && points.length <= 40) {
      points.forEach((point) => L.circleMarker(point, {
        radius: 5,
        color: "#059669",
        weight: 2,
        fillColor: "#10b981",
        fillOpacity: 0.95,
        interactive: false,
      }).addTo(drawingLayer!));
    }
    if (points.length === 2) {
      L.polyline(points, { color: "#10b981", weight: 3, opacity: 1, dashArray: "6 6" }).addTo(drawingLayer!);
    } else if (points.length >= 3) {
      L.polygon(points, { color: "#059669", weight: 3, opacity: 1, fillColor: "#10b981", fillOpacity: 0.35 }).addTo(drawingLayer!);
    }
  }, []);

  const renderTrack = useCallback(() => {
    const L = leafletRef.current;
    if (!L || !mapRef.current) return;
    const trackLayer = trackLayerRef.current;
    const track = propsRef.current.liveTrackPoints;
    if (!track.length) {
      trackLayer?.clearLayers();
      trackPolylineRef.current = null;
      trackStartMarkerRef.current = null;
      trackEndMarkerRef.current = null;
      return;
    }
    if (!trackPolylineRef.current) {
      trackPolylineRef.current = L.polyline(track, { color: "#0284c7", weight: 4, opacity: 0.95 }).addTo(trackLayer!);
      trackStartMarkerRef.current = L.circleMarker(track[0], { radius: 6, color: "#0284c7", weight: 2, fillColor: "#38bdf8", fillOpacity: 1 }).addTo(trackLayer!);
    } else {
      trackPolylineRef.current.setLatLngs(track);
      trackStartMarkerRef.current?.setLatLng(track[0]);
    }
    if (track.length > 1) {
      if (!trackEndMarkerRef.current) {
        trackEndMarkerRef.current = L.circleMarker(track[track.length - 1], { radius: 7, color: "#2563eb", weight: 2, fillColor: "#60a5fa", fillOpacity: 1 }).addTo(trackLayer!);
      } else {
        trackEndMarkerRef.current.setLatLng(track[track.length - 1]);
      }
    } else if (trackEndMarkerRef.current) {
      trackLayer?.removeLayer(trackEndMarkerRef.current);
      trackEndMarkerRef.current = null;
    }
  }, []);

  const renderLocation = useCallback(() => {
    const L = leafletRef.current;
    if (!L || !mapRef.current) return;
    const locationLayer = locationLayerRef.current;
    locationLayer?.clearLayers();
    const fix = detectedLocationRef.current || propsRef.current.userLocation;
    if (fix) {
      L.circleMarker([fix.lat, fix.lng], { radius: 7, color: "#ffffff", weight: 2.5, fillColor: "#2563eb", fillOpacity: 1 }).addTo(locationLayer!);
      if (fix.accuracy && fix.accuracy > 0) {
        L.circle([fix.lat, fix.lng], { radius: fix.accuracy, color: "#3b82f6", weight: 1, opacity: 0.8, fillColor: "#93c5fd", fillOpacity: 0.15, interactive: false }).addTo(locationLayer!);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setMapLoading(true);
    setMapError(null);
    setMapReady(false);

    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        center: [propsRef.current.center.lat, propsRef.current.center.lng],
        zoom: propsRef.current.zoom,
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: propsRef.current.interactive,
        doubleClickZoom: propsRef.current.interactive,
        dragging: propsRef.current.interactive,
      });
      L.control.zoom({ position: "bottomleft" }).addTo(map);
      farmMarkersLayerRef.current = L.layerGroup().addTo(map);
      drawingLayerRef.current = L.layerGroup().addTo(map);
      trackLayerRef.current = L.layerGroup().addTo(map);
      locationLayerRef.current = L.layerGroup().addTo(map);
      map.on("click", (event: import("leaflet").LeafletMouseEvent) => {
        const latest = propsRef.current;
        if (latest.isReadOnly || !latest.interactive) return;
        latest.onMapClick?.({ lat: event.latlng.lat, lng: event.latlng.lng });
      });
      map.on("dragstart", () => {
        interactedRef.current = true;
        mapFocusTargetRef.current = null;
      });
      mapRef.current = map;
      resizeObserverRef.current = new ResizeObserver(() => {
        if (resizeFrameRef.current !== null) return;
        resizeFrameRef.current = window.requestAnimationFrame(() => {
          resizeFrameRef.current = null;
          map.invalidateSize({ pan: false });
        });
      });
      resizeObserverRef.current.observe(containerRef.current);
      setMapReady(true);
    }).catch((error: unknown) => {
      if (cancelled) return;
      setMapError(error instanceof Error ? error.message : "The map could not be initialized. Check your connection and retry.");
      setMapLoading(false);
    });

    return () => {
      cancelled = true;
      clearGpsRequest();
      searchAbortRef.current?.abort();
      searchAbortRef.current = null;
      if (autocompleteTimerRef.current !== null) {
        window.clearTimeout(autocompleteTimerRef.current);
        autocompleteTimerRef.current = null;
      }
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      farmMarkersLayerRef.current = null;
      drawingLayerRef.current = null;
      trackLayerRef.current = null;
      locationLayerRef.current = null;
      trackPolylineRef.current = null;
      trackStartMarkerRef.current = null;
      trackEndMarkerRef.current = null;
      tileLayerRef.current = null;
      searchMarkerRef.current = null;
      setMapReady(false);
    };
  }, [retryVersion, clearGpsRequest]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !mapReady) return;
    tileLayerRef.current?.remove();
    tileLayerRef.current = null;
    setMapError(null);
    setMapLoading(true);

    const key = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    if (!key) {
      setMapError("Map service is not configured. Add NEXT_PUBLIC_MAPTILER_API_KEY to .env.local and restart the app.");
      setMapLoading(false);
      return;
    }

    const layer = L.tileLayer(tileUrl(currentMode, key), {
      tileSize: 256,
      minZoom: 0,
      maxZoom: 20,
      maxNativeZoom: 20,
      attribution: MAPTILER_ATTRIBUTION,
      crossOrigin: true,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 1,
    });
    layer.once("load", () => {
      setMapLoading(false);
      setMapError(null);
    });
    layer.on("tileerror", () => {
      setMapLoading(false);
      setMapError("MapTiler could not load map tiles. Check the key, allowed domains, usage limit, and internet connection.");
    });
    layer.addTo(map);
    tileLayerRef.current = layer;
    return () => { layer.remove(); };
  }, [currentMode, mapReady, retryVersion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.scrollWheelZoom[interactive ? "enable" : "disable"]();
    map.doubleClickZoom[interactive ? "enable" : "disable"]();
    map.dragging[interactive ? "enable" : "disable"]();
  }, [interactive]);

  const markerSignature = JSON.stringify(farmMarkers.map(({ id, name, lat, lng, area, status }) => [id, name, lat, lng, area, status]));
  const polygonSignature = JSON.stringify(polygonPoints);
  const location = detectedLocation || userLocation;
  const locationSignature = location ? `${location.lat}:${location.lng}:${location.accuracy ?? ""}` : "";
  useEffect(() => { renderFarmMarkers(); }, [renderFarmMarkers, markerSignature, mapReady]);
  useEffect(() => { renderBoundary(); }, [renderBoundary, polygonSignature, mapReady]);
  useEffect(() => { renderTrack(); }, [renderTrack, liveTrackPoints, mapReady]);
  useEffect(() => { renderLocation(); }, [renderLocation, locationSignature, mapReady]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!fitBoundaryToBounds || !L || !map || polygonPoints.length < 3) return;
    const bounds = L.latLngBounds(polygonPoints.map(([lat, lng]) => [lat, lng]));
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.25), { animate: false, maxZoom: 18 });
  }, [fitBoundaryToBounds, mapReady, polygonPoints]);

  const centerLat = center.lat;
  const centerLng = center.lng;
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (interactedRef.current) {
      const pendingTarget = mapFocusTargetRef.current;
      if (!pendingTarget) return;
      if (Math.hypot(pendingTarget.lat - centerLat, pendingTarget.lng - centerLng) < 0.00005 && pendingTarget.zoom === zoom) return;
      map.stop();
      mapFocusTargetRef.current = null;
      interactedRef.current = false;
    }
    const current = map.getCenter();
    const centerChanged = Math.hypot(current.lat - centerLat, current.lng - centerLng) >= 0.00005;
    if (!centerChanged && map.getZoom() === zoom) return;
    focusMap(map, interactedRef, mapFocusTargetRef, centerLat, centerLng, zoom);
  }, [centerLat, centerLng, zoom, mapReady]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (searchMarkerRef.current) map.removeLayer(searchMarkerRef.current);
    searchMarkerRef.current = null;
  }, [currentMode]);

  const selectSearchResult = useCallback((result: LocationResult) => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    searchAbortRef.current?.abort();
    searchAbortRef.current = null;
    if (autocompleteTimerRef.current !== null) {
      window.clearTimeout(autocompleteTimerRef.current);
      autocompleteTimerRef.current = null;
    }
    selectedSearchLabelRef.current = result.label;
    focusMap(map, interactedRef, mapFocusTargetRef, result.lat, result.lng, Math.max(map.getZoom(), 14));
    // Circle markers render in SVG and do not request Leaflet's default PNG marker assets.
    const marker = L.circleMarker([result.lat, result.lng], {
      radius: 8,
      color: "#ffffff",
      weight: 3,
      fillColor: "#0284c7",
      fillOpacity: 1,
    }).addTo(map).bindPopup(result.label).openPopup();
    searchMarkerRef.current?.remove();
    searchMarkerRef.current = marker;
    setSearchQuery(result.label);
    setSearchResults([]);
    setSearchError(null);
    setSearching(false);
    propsRef.current.onLocationSelect?.(result);
  }, []);

  useEffect(() => {
    searchAbortRef.current?.abort();
    searchAbortRef.current = null;
    if (autocompleteTimerRef.current !== null) {
      window.clearTimeout(autocompleteTimerRef.current);
      autocompleteTimerRef.current = null;
    }

    const query = searchQuery.trim();
    if (query.length < 3 || query === selectedSearchLabelRef.current) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    searchAbortRef.current = controller;
    autocompleteTimerRef.current = window.setTimeout(() => {
      autocompleteTimerRef.current = null;
      setSearching(true);
      void searchMapTilerPlaces(query, { lat: centerLat, lng: centerLng }, controller.signal)
        .then((results) => {
          if (controller.signal.aborted) return;
          setSearchResults(results);
          setSearchError(results.length ? null : "No matching places found.");
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            setSearchError(error instanceof Error ? error.message : "Place search is temporarily unavailable. Try again.");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 300);

    return () => {
      if (autocompleteTimerRef.current !== null) {
        window.clearTimeout(autocompleteTimerRef.current);
        autocompleteTimerRef.current = null;
      }
      controller.abort();
      if (searchAbortRef.current === controller) searchAbortRef.current = null;
    };
  }, [searchQuery, centerLat, centerLng]);

  const handleLocationSearch = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 3) {
      setSearchError("Enter at least 3 characters to search places.");
      return;
    }
    searchAbortRef.current?.abort();
    searchAbortRef.current = null;
    if (autocompleteTimerRef.current !== null) {
      window.clearTimeout(autocompleteTimerRef.current);
      autocompleteTimerRef.current = null;
    }
    const controller = new AbortController();
    searchAbortRef.current = controller;
    setSearching(true);
    setSearchError(null);
    setSearchResults([]);
    searchMarkerRef.current?.remove();
    try {
      let results: LocationResult[] = [];
      try {
        results = await searchMapTilerPlaces(query, { lat: centerLat, lng: centerLng }, controller.signal);
      } catch (mapTilerError) {
        if (controller.signal.aborted) throw mapTilerError;
      }
      if (results.length === 0) results = await searchNominatimPlaces(query, controller.signal);
      if (!results.length) throw new Error("No matching places found.");
      if (results.length === 1) selectSearchResult(results[0]);
      else setSearchResults(results);
    } catch (error) {
      if (!controller.signal.aborted) {
        setSearchError(error instanceof Error ? error.message : "Place search is temporarily unavailable. Try again.");
      }
    } finally {
      if (searchAbortRef.current === controller) {
        searchAbortRef.current = null;
        setSearching(false);
      }
    }
  }, [searchQuery, centerLat, centerLng, selectSearchResult]);

  const refreshLiveLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("This browser does not support live location.");
      return;
    }
    clearGpsRequest();
    setLocating(true);
    setLocationError(null);
    bestFixRef.current = null;
    const finish = (fix: { lat: number; lng: number; accuracy: number } | null, message?: string) => {
      clearGpsRequest();
      if (!fix) {
        setLocationError(message || "Could not get a GPS fix. Check location permission and retry.");
        setLocating(false);
        return;
      }
      setDetectedLocation(fix);
      const map = mapRef.current;
      if (map) focusMap(map, interactedRef, mapFocusTargetRef, fix.lat, fix.lng, Math.max(map.getZoom(), 15));
      propsRef.current.onLocationSelect?.({ ...fix, label: "Current location" });
      setLocating(false);
    };
    try {
      gpsWatchRef.current = navigator.geolocation.watchPosition((position) => {
        const fix = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy };
        if (!bestFixRef.current || fix.accuracy < bestFixRef.current.accuracy) bestFixRef.current = fix;
        if (fix.accuracy <= 20) finish(fix);
      }, (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? "Location access is blocked. Allow location access in your browser settings."
          : error.code === error.POSITION_UNAVAILABLE
            ? "Your current location is unavailable. Check GPS and retry."
            : "Finding your location took too long. Please retry.";
        finish(bestFixRef.current, message);
      }, { enableHighAccuracy: true, maximumAge: 0, timeout: 12000 });
      gpsTimeoutRef.current = window.setTimeout(() => finish(bestFixRef.current, "Could not get a GPS fix. Check location permission and retry."), 9000);
    } catch {
      setLocationError("Could not start GPS. Allow location access and retry.");
      setLocating(false);
    }
  }, [clearGpsRequest]);

  const clearSearch = () => {
    searchAbortRef.current?.abort();
    searchAbortRef.current = null;
    if (autocompleteTimerRef.current !== null) {
      window.clearTimeout(autocompleteTimerRef.current);
      autocompleteTimerRef.current = null;
    }
    selectedSearchLabelRef.current = "";
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
    setSearching(false);
    searchMarkerRef.current?.remove();
    searchMarkerRef.current = null;
  };

  return (
    <div className={`relative w-full ${height} min-h-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm dark:border-slate-800 ${className}`}>
      <div ref={containerRef} className="z-0 h-full min-h-[340px] w-full" />

      {showNavigationControls && <div className={`absolute left-3 top-3 z-[1001] ${showControls ? "w-[min(22rem,calc(100%-18rem))] max-[639px]:w-[min(22rem,calc(100%-1.5rem))]" : "w-[min(22rem,calc(100%-1.5rem))]"}`}>
        <form onSubmit={handleLocationSearch} onClick={(event) => event.stopPropagation()} className="liquid-glass-panel flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900/85">
          <Search className="ml-1 h-4 w-4 shrink-0 text-slate-500" />
          <input value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setSearchResults([]); setSearchError(null); }} placeholder="Search a village, town, or city" aria-label="Search map location" role="combobox" aria-autocomplete="list" aria-expanded={searchResults.length > 0} aria-controls="map-place-suggestions" autoComplete="off" className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-xs text-slate-900 outline-none placeholder:text-slate-500 dark:text-white" />
          {searchQuery && <button type="button" onClick={clearSearch} aria-label="Clear map search" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-3.5 w-3.5" /></button>}
          <button type="submit" disabled={searching} aria-label="Search map" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white disabled:opacity-60">{searching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}</button>
        </form>
        {searching && searchQuery.trim().length >= 3 && searchResults.length === 0 && <p role="status" className="mt-1 rounded-lg bg-slate-950/90 px-3 py-2 text-xs text-slate-200">Searching nearby villages, towns, and cities…</p>}
        {(searchError || searchResults.length > 0) && <div id="map-place-suggestions" role="listbox" aria-label="Place suggestions" className="liquid-glass-panel mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-xl dark:border-slate-700 dark:bg-slate-900/95" onClick={(event) => event.stopPropagation()}>
          {searchError && <p role="status" className="px-3 py-2 text-xs text-rose-600 dark:text-rose-300">{searchError}</p>}
          {searchResults.map((result) => <button key={`${result.lat}-${result.lng}-${result.label}`} role="option" aria-selected="false" type="button" onClick={() => selectSearchResult(result)} className="block min-h-11 w-full border-b border-slate-100 px-3 py-2 text-left text-xs text-slate-700 last:border-0 hover:bg-emerald-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"><MapPin className="mr-1 inline h-3 w-3 text-emerald-600" />{result.label}</button>)}
        </div>}
        {locationError && <p role="status" className="mt-1 rounded-lg bg-rose-950/90 px-3 py-2 text-xs text-rose-200">{locationError}</p>}
      </div>}

      {showLocationBadge && !searchError && !locationError && searchResults.length === 0 && <div title={detectedLocation?.accuracy ? "Accuracy is estimated by your device. Enable Precise location and move outdoors for a stronger GPS fix." : "Showing the selected map center. Refresh location to request a fresh GPS fix."} className={`liquid-glass-panel absolute ${showNavigationControls ? "top-[4.5rem]" : "top-3"} left-3 z-[1000] flex min-h-8 max-w-[min(22rem,calc(100%-1.5rem))] items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-white shadow-md`}>
        <div className="flex items-center gap-1.5 font-bold text-emerald-400"><span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" /><span>{detectedLocation ? "Location found" : "Map ready"}</span></div>
        {detectedLocation?.accuracy ? <><span className="text-slate-600">•</span><span className="text-[11px] font-medium text-slate-300">{detectedLocation.accuracy <= 20 ? "Precise" : "Reported"} ±{Math.round(detectedLocation.accuracy)}m</span></> : <><span className="text-slate-600">•</span><span className="font-mono text-[11px] text-slate-300">{center.lat.toFixed(4)}, {center.lng.toFixed(4)}</span></>}
      </div>}

      {(mapLoading || mapError) && <div role="status" className={`absolute bottom-3 left-14 z-[1000] max-w-[min(30rem,calc(100%-8rem))] rounded-lg border px-3 py-2 text-xs font-semibold shadow-lg ${mapError ? "border-rose-500/50 bg-slate-950/95 text-rose-100" : "pointer-events-none flex items-center gap-2 border-slate-700/80 bg-slate-950/85 text-white"}`}>
        {mapError ? <><p>{mapError}</p><button type="button" onClick={() => setRetryVersion((value) => value + 1)} className="mt-2 rounded-md border border-slate-600 px-2 py-1 text-white">Retry map</button></> : <><LoaderCircle className="h-4 w-4 animate-spin text-emerald-400" /> Loading map…</>}
      </div>}

      {showControls && <div className="liquid-glass-panel absolute right-3 top-3 z-[1000] flex items-center gap-1 rounded-xl border border-slate-200 bg-white/85 p-1 text-xs font-bold dark:border-slate-800 dark:bg-slate-900/85 max-[639px]:top-[7.5rem]">
        <button type="button" title="Satellite imagery" aria-pressed={currentMode === "satellite"} onClick={() => setCurrentMode("satellite")} className={`flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-lg px-2.5 py-1 transition-all ${currentMode === "satellite" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400"}`}><Satellite className="h-3.5 w-3.5" /><span className="hidden sm:inline">Satellite</span></button>
        <button type="button" title="Satellite imagery with roads and place labels" aria-pressed={currentMode === "hybrid"} onClick={() => setCurrentMode("hybrid")} className={`flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-lg px-2.5 py-1 transition-all ${currentMode === "hybrid" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400"}`}><Layers className="h-3.5 w-3.5" /><span className="hidden sm:inline">Hybrid</span></button>
        <button type="button" title="Street map with roads and place names" aria-pressed={currentMode === "street"} onClick={() => setCurrentMode("street")} className={`flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-lg px-2.5 py-1 transition-all ${currentMode === "street" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400"}`}><MapIcon className="h-3.5 w-3.5" /><span className="hidden sm:inline">Street</span></button>
      </div>}

      {showNavigationControls && <div className="absolute bottom-3 right-3 z-[1000]"><button type="button" onClick={(event) => { event.stopPropagation(); refreshLiveLocation(); }} disabled={locating} aria-label="Refresh live location" title="Refresh live location" className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 text-xs font-bold text-slate-800 shadow-lg transition-colors hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900/95 dark:text-white dark:hover:bg-slate-800">{locating ? <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" /> : <Locate className="h-4 w-4 text-emerald-600" />}<span>{locating ? "Finding GPS…" : "Refresh location"}</span></button></div>}
    </div>
  );
});

GISMapEngine.displayName = "GISMapEngine";
export default GISMapEngine;

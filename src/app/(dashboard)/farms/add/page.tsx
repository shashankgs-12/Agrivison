"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Save,
  Footprints,
  PenTool,
  Locate,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Ruler,
  Compass,
  Layers,
  Sparkles,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useFarmStore } from "@/stores/farm-store";
import { useAuthStore } from "@/stores/auth-store";
import { useWeatherStore } from "@/stores/weather-store";

const GISMapEngine = dynamic(() => import("@/components/maps/gis-map-engine"), {
  ssr: false,
  loading: () => (
    <div className="h-[440px] w-full bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-bold animate-pulse">
      Loading GIS Map Engine...
    </div>
  ),
});
import {
  calculateGeodesicArea,
  calculatePerimeter,
  calculateCentroid,
  toGeoJSONPolygon,
  reverseGeocodeAddress,
} from "@/lib/gis/geo-utils";

type RegistrationMode = "unselected" | "live-gps" | "manual";
type TrackingStatus = "idle" | "recording" | "paused" | "completed";

export default function AddFarmPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const addFarm = useFarmStore((state) => state.addFarm);
  const { updateLocation } = useWeatherStore();

  // Mode Selection
  const [selectedMode, setSelectedMode] = useState<RegistrationMode>("unselected");

  // Metadata Form State
  const [farmName, setFarmName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [soilType, setSoilType] = useState("Loamy Soil");
  const [waterSource, setWaterSource] = useState("Borewell");
  const [areaAcres, setAreaAcres] = useState<number>(0);
  const [areaHectares, setAreaHectares] = useState<number>(0);
  const [perimeterMeters, setPerimeterMeters] = useState<number>(0);
  const [distanceWalkedMeters, setDistanceWalkedMeters] = useState<number>(0);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });
  const [geoJSONBoundary, setGeoJSONBoundary] = useState<unknown>(null);

  // Live GPS Tracking State
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>("idle");
  const [liveTrackPoints, setLiveTrackPoints] = useState<[number, number][]>([]);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);

  // Manual Mode Polygon Points & Manual Active State
  const [manualPolygonPoints, setManualPolygonPoints] = useState<[number, number][]>([]);
  const [isManualDrawingActive, setIsManualDrawingActive] = useState(false);

  // Refs for tracking timer
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initial GPS detection on page load
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          setUserLocation({ lat: latitude, lng: longitude, accuracy });
          setGpsAccuracy(accuracy);

          const addr = await reverseGeocodeAddress(latitude, longitude);
          setLocationAddress(addr);
          updateLocation(latitude, longitude, addr);
        },
        (err) => {
          console.warn("Initial GPS fetch warning:", err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [updateLocation]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    };
  }, []);

  // ----------------------------------------------------
  // LIVE GPS TRACKING WORKFLOW (Field Perimeter Walk)
  // ----------------------------------------------------

  const sampleGPSPosition = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsAccuracy(accuracy);
        setUserLocation({ lat: latitude, lng: longitude, accuracy });

        // Reject poor accuracy drift points (> 20m)
        if (accuracy > 20) {
          console.warn("Skipped low accuracy GPS point:", accuracy);
          return;
        }

        const newPoint: [number, number] = [latitude, longitude];

        setLiveTrackPoints((prev) => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const dist = Math.hypot(last[0] - latitude, last[1] - longitude);
            if (dist < 0.00001) return prev;
          }
          const updated = [...prev, newPoint];

          // Calculate real-time distance walked and area preview
          const perimRes = calculatePerimeter(updated, false);
          setDistanceWalkedMeters(perimRes.meters);

          if (updated.length >= 3) {
            const areaRes = calculateGeodesicArea(updated);
            const closedPerimRes = calculatePerimeter(updated, true);
            setAreaAcres(areaRes.acres);
            setAreaHectares(areaRes.hectares);
            setPerimeterMeters(closedPerimRes.meters);
          }
          return updated;
        });

        setCoordinates({ lat: latitude, lng: longitude });
      },
      (err) => {
        setGpsError(`GPS Track Error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 1000 }
    );
  }, []);

  const handleStartRecording = () => {
    setGpsError(null);
    setTrackingStatus("recording");
    setLiveTrackPoints([]);

    sampleGPSPosition();

    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    trackingIntervalRef.current = setInterval(() => {
      sampleGPSPosition();
    }, 2000);
  };

  const handlePauseRecording = () => {
    setTrackingStatus("paused");
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  };

  const handleResumeRecording = () => {
    setTrackingStatus("recording");
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    trackingIntervalRef.current = setInterval(() => {
      sampleGPSPosition();
    }, 2000);
  };

  const handleFinishRecording = async () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    if (liveTrackPoints.length < 3) {
      setGpsError("At least 3 boundary points are required to generate a farm polygon.");
      return;
    }

    setTrackingStatus("completed");

    const closedPoints = [...liveTrackPoints];
    const first = closedPoints[0];
    const last = closedPoints[closedPoints.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      closedPoints.push([first[0], first[1]]);
    }

    const areaRes = calculateGeodesicArea(closedPoints);
    const perimRes = calculatePerimeter(closedPoints, true);
    const centroid = calculateCentroid(closedPoints);
    const geoJSON = toGeoJSONPolygon(closedPoints);

    setAreaAcres(areaRes.acres);
    setAreaHectares(areaRes.hectares);
    setPerimeterMeters(perimRes.meters);
    setCoordinates(centroid);
    setGeoJSONBoundary(geoJSON);

    const address = await reverseGeocodeAddress(centroid.lat, centroid.lng);
    setLocationAddress(address);
    updateLocation(centroid.lat, centroid.lng, address);
  };

  const handleResetRecording = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    setTrackingStatus("idle");
    setLiveTrackPoints([]);
    setAreaAcres(0);
    setAreaHectares(0);
    setPerimeterMeters(0);
    setDistanceWalkedMeters(0);
  };

  // ----------------------------------------------------
  // MANUAL BOUNDARY PLOTTING WORKFLOW
  // ----------------------------------------------------

  const handleManualMapClick = async (coords: { lat: number; lng: number }) => {
    if (selectedMode !== "manual" || !isManualDrawingActive) return;

    const newPt: [number, number] = [coords.lat, coords.lng];
    const updated = [...manualPolygonPoints, newPt];
    setManualPolygonPoints(updated);

    if (updated.length >= 3) {
      const areaRes = calculateGeodesicArea(updated);
      const perimRes = calculatePerimeter(updated, true);
      const centroid = calculateCentroid(updated);
      const geoJSON = toGeoJSONPolygon(updated);

      setAreaAcres(areaRes.acres);
      setAreaHectares(areaRes.hectares);
      setPerimeterMeters(perimRes.meters);
      setCoordinates(centroid);
      setGeoJSONBoundary(geoJSON);

      const address = await reverseGeocodeAddress(coords.lat, coords.lng);
      setLocationAddress(address);
    } else {
      setCoordinates({ lat: coords.lat, lng: coords.lng });
      const address = await reverseGeocodeAddress(coords.lat, coords.lng);
      setLocationAddress(address);
    }
  };

  const handleClearManualPoints = () => {
    setManualPolygonPoints([]);
    setAreaAcres(0);
    setAreaHectares(0);
    setPerimeterMeters(0);
    setGeoJSONBoundary(null);
  };

  // ----------------------------------------------------
  // SAVE FARM TO DATABASE
  // ----------------------------------------------------

  const handleSaveFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) return;

    const activeBoundary =
      selectedMode === "live-gps"
        ? liveTrackPoints.length >= 3
          ? liveTrackPoints
          : undefined
        : manualPolygonPoints.length >= 3
        ? manualPolygonPoints
        : undefined;

    addFarm({
      ownerId: user?.uid,
      name: farmName,
      area: areaAcres > 0 ? areaAcres : 5.0,
      location: locationAddress || `${coordinates.lat.toFixed(3)}°, ${coordinates.lng.toFixed(3)}°`,
      status: "Healthy",
      soilType,
      waterSource,
      coordinates,
      boundary: activeBoundary,
    });

    router.push("/farms");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex items-center gap-3">
        <Link href="/farms">
          <Button variant="outline" size="sm" className="rounded-xl border-slate-300">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
            <MapPin className="h-6 w-6 text-emerald-600" />
            Register New Farm Boundary
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Choose how you would like to map your agricultural land boundary
          </p>
        </div>
      </div>

      {/* STEP 1: METHOD SELECTION CARDS */}
      {selectedMode === "unselected" ? (
        <div className="space-y-4">
          <div className="text-center py-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Select Boundary Mapping Method
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For best precision in the field, use live GPS walk mode on your mobile device.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Option 1: Live GPS Boundary Walk (Recommended) */}
            <div
              onClick={() => {
                setSelectedMode("live-gps");
                handleResetRecording();
              }}
              className="bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-3xl p-6 shadow-xl cursor-pointer transition-all hover:scale-[1.02] space-y-4 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className="bg-black/30 backdrop-blur-md text-emerald-200 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-300" /> Option 1 (Recommended)
                </span>
                <Footprints className="h-8 w-8 text-emerald-200 group-hover:scale-110 transition-transform" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight">
                  🛰️ Record Farm Boundary Using GPS
                </h3>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Walk around your farm perimeter. GPS automatically records coordinates every 2s, calculates exact land area, and generates GeoJSON boundaries.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-200">
                <span>Start Field Walk →</span>
              </div>
            </div>

            {/* Option 2: Manual Boundary Drawing */}
            <div
              onClick={() => {
                setSelectedMode("manual");
                setIsManualDrawingActive(false);
                handleClearManualPoints();
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-900 dark:text-white rounded-3xl p-6 shadow-md hover:shadow-lg cursor-pointer transition-all hover:scale-[1.02] space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                  Option 2
                </span>
                <PenTool className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight">
                  ✏️ Draw Boundary Manually
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Plot polygon vertices manually by tapping points on high-resolution satellite map imagery. Best for desktop or mapped landmarks.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-600">
                <span>Open Manual Map →</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: ACTIVE WORKFLOW SCREEN */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 px-2">
              {selectedMode === "live-gps" ? (
                <Footprints className="h-5 w-5 text-emerald-600" />
              ) : (
                <PenTool className="h-5 w-5 text-emerald-600" />
              )}
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {selectedMode === "live-gps"
                  ? "Option 1: Live GPS Boundary Walk"
                  : "Option 2: Manual Polygon Plotting"}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedMode("unselected");
                handleResetRecording();
                handleClearManualPoints();
              }}
              className="text-xs font-bold rounded-xl"
            >
              Switch Method
            </Button>
          </div>

          {gpsError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{gpsError}</span>
              </div>
              <button onClick={() => setGpsError(null)} className="text-xs font-bold underline">
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* GIS Map Canvas */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Locate className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedMode === "live-gps"
                        ? "Live GPS Field Walk Canvas"
                        : isManualDrawingActive
                        ? "Tap Satellite Imagery to Add Vertices"
                        : "Map View-Only (Click Start Drawing below)"}
                    </h3>
                  </div>

                  {gpsAccuracy !== null && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
                      <Compass className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                      <span>GPS Accuracy: ±{gpsAccuracy.toFixed(0)}m</span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <GISMapEngine
                    center={coordinates}
                    zoom={16}
                    mapMode="satellite"
                    interactive={true}
                    isReadOnly={selectedMode === "manual" && !isManualDrawingActive}
                    liveTrackPoints={selectedMode === "live-gps" ? liveTrackPoints : []}
                    polygonPoints={selectedMode === "manual" ? manualPolygonPoints : []}
                    userLocation={userLocation}
                    onMapClick={selectedMode === "manual" ? handleManualMapClick : undefined}
                    height="h-[440px]"
                  />

                  {/* Option 1: Live GPS Walk Control Bar */}
                  {selectedMode === "live-gps" && (
                    <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white p-3.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400">
                            {trackingStatus === "recording" && "🔴 Recording Perimeter Walk..."}
                            {trackingStatus === "paused" && "⏸️ Recording Paused"}
                            {trackingStatus === "completed" && "✅ Boundary Recorded!"}
                            {trackingStatus === "idle" && "Ready to walk field perimeter"}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                            {liveTrackPoints.length} Points • {distanceWalkedMeters}m Walked
                          </span>
                        </div>
                        {areaAcres > 0 && (
                          <p className="text-xs font-black text-white mt-1">
                            Area: {areaAcres} Acres ({areaHectares} Ha) • {perimeterMeters}m Perimeter
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {trackingStatus === "idle" && (
                          <Button
                            onClick={handleStartRecording}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 px-4"
                          >
                            <Play className="h-4 w-4 fill-white" />
                            Start Recording
                          </Button>
                        )}

                        {trackingStatus === "recording" && (
                          <>
                            <Button
                              onClick={handlePauseRecording}
                              variant="secondary"
                              size="sm"
                              className="font-bold text-xs flex items-center gap-1"
                            >
                              <Pause className="h-4 w-4" /> Pause
                            </Button>
                            <Button
                              onClick={handleFinishRecording}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-lg"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Finish
                            </Button>
                          </>
                        )}

                        {trackingStatus === "paused" && (
                          <>
                            <Button
                              onClick={handleResumeRecording}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                            >
                              <Play className="h-4 w-4" /> Resume
                            </Button>
                            <Button
                              onClick={handleFinishRecording}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-lg"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Finish
                            </Button>
                          </>
                        )}

                        {trackingStatus === "completed" && (
                          <Button
                            onClick={handleResetRecording}
                            variant="outline"
                            size="sm"
                            className="text-xs font-bold border-slate-600 text-slate-200 hover:bg-slate-800"
                          >
                            Re-record
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Option 2: Manual Drawing Activation Toolbar */}
                  {selectedMode === "manual" && (
                    <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between">
                      <div>
                        {!isManualDrawingActive ? (
                          <p className="text-xs font-bold text-amber-400">
                            🔒 Map in View Mode (Click Start Drawing to enable clicks)
                          </p>
                        ) : (
                          <p className="text-xs font-bold text-emerald-400">
                            ✏️ Manual Plotting Active: {manualPolygonPoints.length} Vertices
                          </p>
                        )}
                        {areaAcres > 0 && (
                          <p className="text-xs font-black text-white mt-0.5">
                            Area: {areaAcres} Acres ({areaHectares} Ha) • {perimeterMeters}m Perimeter
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!isManualDrawingActive ? (
                          <Button
                            onClick={() => setIsManualDrawingActive(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
                          >
                            <PenTool className="h-4 w-4 mr-1" /> Start Manual Drawing
                          </Button>
                        ) : (
                          <>
                            {manualPolygonPoints.length > 0 && (
                              <Button
                                onClick={handleClearManualPoints}
                                variant="destructive"
                                size="sm"
                                className="text-xs font-bold"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
                              </Button>
                            )}
                            <Button
                              onClick={() => setIsManualDrawingActive(false)}
                              variant="outline"
                              size="sm"
                              className="text-xs font-bold border-slate-600 text-slate-200 hover:bg-slate-800"
                            >
                              Lock Drawing
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Farm Form Metadata Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-5">
              <div className="border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Farm Metadata
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  GeoJSON Output
                </span>
              </div>

              {/* Area Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/70 dark:from-slate-800 dark:to-slate-800/80 dark:border-slate-700 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                  <Ruler className="h-3.5 w-3.5" /> Calculated Farm Area
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {areaAcres || "0.0"}
                  </span>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Acres</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-semibold pt-1 border-t border-emerald-200/50 dark:border-slate-700">
                  <span>{areaHectares} Hectares</span>
                  <span>•</span>
                  <span>{perimeterMeters}m Perimeter</span>
                </div>
              </div>

              <form onSubmit={handleSaveFarm} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Farm Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunrise Organic Plantation"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Reverse Geocoded Location
                  </label>
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="Auto-filled from boundary centroid"
                    className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">
                      Area (Acres)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={areaAcres}
                      onChange={(e) => setAreaAcres(Number(e.target.value))}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">
                      Soil Type
                    </label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full h-10 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    >
                      <option value="Loamy Soil">Loamy Soil</option>
                      <option value="Black Cotton Soil">Black Cotton Soil</option>
                      <option value="Red Soil">Red Soil</option>
                      <option value="Clay Soil">Clay Soil</option>
                      <option value="Sandy Soil">Sandy Soil</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    Water Source
                  </label>
                  <select
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value)}
                    className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="Borewell">Borewell</option>
                    <option value="Canal">Canal</option>
                    <option value="River">River</option>
                    <option value="Rain-fed">Rain-fed</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 rounded-xl mt-2"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save GeoJSON Farm to Database
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

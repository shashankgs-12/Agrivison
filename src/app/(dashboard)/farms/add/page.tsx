"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Layers,
  Satellite,
  Save,
  Footprints,
  PenTool,
  Locate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export default function AddFarmPage() {
  const [mode, setMode] = useState<"walk" | "draw">("walk");
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/farms">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
            Add New Farm
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Map your farm boundary using GPS or drawing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            {/* Map toolbar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 rounded-lg p-0.5 dark:bg-slate-800">
                  <button
                    onClick={() => setMode("walk")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                      mode === "walk"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    )}
                  >
                    <Footprints className="h-3.5 w-3.5" />
                    Walk GPS
                  </button>
                  <button
                    onClick={() => setMode("draw")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                      mode === "draw"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    )}
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    Draw on Map
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="text-[10px] font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md flex items-center gap-1 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300">
                  <Layers className="h-3 w-3" />
                  Map
                </button>
                <button className="text-[10px] font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md flex items-center gap-1 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300">
                  <Satellite className="h-3 w-3" />
                  Satellite
                </button>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="relative h-96 bg-gradient-to-br from-emerald-50 via-green-50 to-sky-50 flex items-center justify-center dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              />

              <div className="text-center relative z-10">
                {mode === "walk" ? (
                  <>
                    <Footprints className="h-12 w-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Walk GPS Recording Mode
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto dark:text-slate-400">
                      Walk around your farm boundary with GPS enabled. The app will
                      record your path and calculate the area automatically.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => setIsRecording(!isRecording)}
                      variant={isRecording ? "destructive" : "primary"}
                    >
                      <Locate className="h-4 w-4" />
                      {isRecording ? "Stop Recording" : "Start Recording"}
                    </Button>
                  </>
                ) : (
                  <>
                    <PenTool className="h-12 w-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Draw on Map Mode
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto dark:text-slate-400">
                      Tap on the map to place boundary points. Complete the
                      polygon by clicking the first point again.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Stats bar */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
              <div className="text-center px-3">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Area</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  0.0 Acres
                </p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Perimeter</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  0 m
                </p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Points</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  0
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Farm Details Form */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 mb-4 dark:text-white">
              Farm Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
                  Farm Name
                </label>
                <Input placeholder="e.g. Green Valley Farm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
                  Address / Location
                </label>
                <Input
                  placeholder="e.g. Mandya District, Karnataka"
                  icon={<MapPin className="h-4 w-4" />}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
                  Soil Type
                </label>
                <select className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white">
                  <option value="">Select soil type</option>
                  <option value="clay">Clay</option>
                  <option value="loamy">Loamy</option>
                  <option value="sandy">Sandy</option>
                  <option value="silt">Silt</option>
                  <option value="red">Red Soil</option>
                  <option value="black">Black Cotton Soil</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block dark:text-slate-300">
                  Water Source
                </label>
                <select className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-slate-900 dark:border-slate-800 dark:text-white">
                  <option value="">Select water source</option>
                  <option value="borewell">Borewell</option>
                  <option value="canal">Canal</option>
                  <option value="river">River</option>
                  <option value="rain">Rain-fed</option>
                  <option value="tank">Tank / Lake</option>
                </select>
              </div>
            </div>
          </div>

          <Button className="w-full" size="lg">
            <Save className="h-4 w-4" />
            Save Farm
          </Button>
        </div>
      </div>
    </div>
  );
}

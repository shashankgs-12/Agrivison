"use client";

import React from "react";
import { MapPin, Layers, Satellite, Trash2 } from "lucide-react";
import { useFarmStore } from "@/stores/farm-store";

export function FarmMap() {
  const { farms, deleteFarm } = useFarmStore();

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden dark:bg-black dark:border-zinc-800">
      {/* Map header bar */}
      <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#00ab41]" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Farm Locations & Boundaries
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="text-[10px] font-bold px-3 py-1 bg-[#008631] text-white rounded-lg flex items-center gap-1 shadow-sm">
            <Layers className="h-3 w-3" />
            Map
          </button>
          <button className="text-[10px] font-bold px-3 py-1 bg-zinc-100 text-zinc-700 rounded-lg flex items-center gap-1 hover:bg-zinc-200 transition-colors dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer">
            <Satellite className="h-3 w-3" />
            Satellite
          </button>
        </div>
      </div>

      {/* Map visualization canvas */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-[#008631]/10 via-emerald-50/50 to-sky-50 flex items-center justify-center dark:from-zinc-900 dark:via-black dark:to-zinc-950">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,171,65,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,171,65,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Dynamic Farm pins */}
        {farms.map((farm, i) => (
          <div
            key={farm.id}
            className="absolute group cursor-pointer"
            style={{
              left: `${20 + i * 28}%`,
              top: `${30 + (i % 2) * 25}%`,
            }}
          >
            {/* Pulse ring */}
            <div className="absolute -inset-3 rounded-full bg-[#00ab41]/20 animate-ping" />

            {/* Pin */}
            <div className="relative h-9 w-9 bg-gradient-to-br from-[#008631] to-[#00ab41] rounded-full flex items-center justify-center shadow-lg shadow-[#008631]/30 border-2 border-white dark:border-black z-10">
              <MapPin className="h-4 w-4 text-white" />
            </div>

            {/* Farm Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-14 bg-white rounded-xl shadow-xl border border-zinc-200 px-3.5 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 dark:bg-black dark:border-zinc-800">
              <p className="text-[11px] font-bold text-zinc-900 dark:text-white">
                {farm.name}
              </p>
              <p className="text-[9px] text-zinc-500 dark:text-zinc-400">
                {farm.area} Acres · {farm.crop}
              </p>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white dark:border-t-black" />
            </div>
          </div>
        ))}

        {farms.length === 0 && (
          <div className="text-center text-zinc-400 dark:text-zinc-500">
            <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30 text-[#00ab41]" />
            <p className="text-xs font-semibold">No farms added yet</p>
            <p className="text-[10px]">Click &quot;Add Farm&quot; to map your first farm boundary.</p>
          </div>
        )}
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
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  MapPin,
  LayoutGrid,
  List,
  Search,
  Filter,
  Trash2,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { useFarmStore } from "@/stores/farm-store";

export default function FarmsPage() {
  const { farms, deleteFarm, resetToZero } = useFarmStore();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  const filteredFarms = farms.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.crop.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight dark:text-white">
            My Farms & Land Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your {farms.length} registered farm lands
          </p>
        </div>
        <div className="flex items-center gap-2">
          {farms.length > 0 && (
            <Button variant="outline" size="sm" onClick={resetToZero}>
              <RotateCcw className="h-4 w-4" />
              Set All to Zero
            </Button>
          )}
          <Link href="/farms/add">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add New Farm
            </Button>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search farm lands or crops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:border-[#00ab41] focus:outline-none focus:ring-1 focus:ring-[#00ab41] dark:bg-black dark:border-zinc-800 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <div className="flex bg-zinc-100 rounded-xl p-0.5 dark:bg-zinc-900">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                view === "grid"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                view === "list"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Farm Cards List / Zero State */}
      {filteredFarms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center dark:bg-black dark:border-zinc-800">
          <div className="h-16 w-16 rounded-2xl bg-[#008631]/10 text-[#00ab41] flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            No Farm Lands Registered
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-6 dark:text-zinc-400">
            All farm lands set to zero. Map your first farm boundary using GPS or manual drawing.
          </p>
          <Link href="/farms/add">
            <Button size="md">
              <Plus className="h-4 w-4" />
              Add Your First Farm
            </Button>
          </Link>
        </div>
      ) : (
        <div
          className={cn(
            "gap-4",
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col"
          )}
        >
          {filteredFarms.map((farm) => {
            const isAlert = farm.status === "Alert Active";

            return (
              <div
                key={farm.id}
                className={cn(
                  "bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all group dark:bg-black flex flex-col justify-between overflow-hidden",
                  isAlert
                    ? "border-rose-200 dark:border-rose-900/50"
                    : "border-zinc-200/80 dark:border-zinc-800"
                )}
              >
                {/* Header thumbnail */}
                <div className="h-32 bg-gradient-to-br from-[#008631]/10 via-emerald-50/50 to-sky-50 rounded-t-2xl relative overflow-hidden dark:from-zinc-900 dark:via-black dark:to-zinc-950">
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-[#00ab41] opacity-50 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant={isAlert ? "rose" : "emerald"}>
                      {isAlert ? (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Alert
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> {farm.status}
                        </span>
                      )}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 group-hover:text-[#00ab41] transition-colors dark:text-white">
                      {farm.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5 dark:text-zinc-400">
                      {farm.area} Acres · 📍 {farm.location}
                    </p>
                    <p className="text-xs text-zinc-600 font-medium mt-2 dark:text-zinc-300">
                      🌾 {farm.crop}
                    </p>
                  </div>

                  {/* Card Actions & Delete Button in bottom corner */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <Link
                      href={`/farms/${farm.id}`}
                      className="text-xs font-bold text-[#00ab41] hover:underline flex items-center gap-1"
                    >
                      View Details
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>

                    {/* Delete Farm Button in bottom corner */}
                    <button
                      onClick={() => deleteFarm(farm.id)}
                      className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      title="Delete Farm Land"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Farm
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

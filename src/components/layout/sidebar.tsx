"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Sprout,
  Scan,
  Sparkles,
  CloudSun,
  Droplets,
  FileBarChart,
  Settings,
  ChevronLeft,
  Crown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/stores/ui-store";

export const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Farms", href: "/farms", icon: Map },
  { name: "Crops", href: "/crops", icon: Sprout },
  { name: "Disease Scanner", href: "/disease-detection", icon: Scan },
  { name: "Plant ID", href: "/plant-identification", icon: Sparkles },
  { name: "Weather", href: "/weather", icon: CloudSun },
  { name: "Irrigation Advisor", href: "/irrigation", icon: Droplets },
  { name: "Reports", href: "/reports", icon: FileBarChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-zinc-200 transition-all duration-300 ease-in-out flex flex-col justify-between dark:bg-black dark:border-zinc-800 hidden md:flex",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#008631] to-[#00ab41] flex items-center justify-center text-white shadow-md shadow-[#008631]/20 shrink-0">
              <Sprout className="h-6 w-6" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-zinc-900 text-lg leading-tight dark:text-white">
                  AgriVision<span className="text-[#00ab41]">.AI</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase">
                  Smart Farming
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="h-7 w-7 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 flex items-center justify-center transition-colors dark:hover:bg-zinc-900 dark:hover:text-zinc-300 cursor-pointer"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                !sidebarOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)] scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-[#008631]/10 text-[#00ab41] font-bold dark:bg-[#00ab41]/15 dark:text-[#00ab41]"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00ab41] rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? "text-[#00ab41]"
                      : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                  )}
                />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Go Premium / Footer Card */}
      {sidebarOpen ? (
        <div className="p-3">
          <div className="rounded-2xl bg-gradient-to-br from-[#008631] to-[#00ab41] p-4 text-white shadow-lg shadow-[#008631]/20 relative overflow-hidden">
            <div className="absolute -right-3 -bottom-3 h-20 w-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Go Premium
              </span>
            </div>
            <p className="text-xs text-emerald-50 leading-relaxed mb-3">
              Unlock unlimited AI crop diagnosis & hyper-local weather alerts.
            </p>
            <button className="w-full py-2 px-3 bg-white text-[#008631] font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
              <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              Upgrade Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 flex justify-center">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center cursor-pointer hover:bg-amber-500/20 transition-colors" title="Upgrade to Premium">
            <Crown className="h-5 w-5" />
          </div>
        </div>
      )}
    </aside>
  );
}

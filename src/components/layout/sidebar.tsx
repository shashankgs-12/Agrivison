"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Sprout,
  Scan,
  Sparkles,
  CloudSun,
  Droplets,
  FlaskConical,
  FileBarChart,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/stores/ui-store";
import { useLanguage } from "@/hooks/use-language";
import { getUiText, type NavigationKey } from "@/lib/i18n/localization";

const NAV_KEY_BY_HREF: Record<string, NavigationKey> = {
  "/dashboard": "dashboard",
  "/farms": "farms",
  "/crops": "crops",
  "/disease-detection": "disease",
  "/plant-identification": "plant",
  "/weather": "weather",
  "/irrigation": "irrigation",
  "/fertilizer": "fertilizer",
  "/reports": "reports",
  "/settings": "settings",
};

export const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Farms", href: "/farms", icon: Map },
  { name: "Crops", href: "/crops", icon: Sprout },
  { name: "Disease Scanner", href: "/disease-detection", icon: Scan },
  { name: "Plant ID", href: "/plant-identification", icon: Sparkles },
  { name: "Weather", href: "/weather", icon: CloudSun },
  { name: "Irrigation Advisor", href: "/irrigation", icon: Droplets },
  { name: "Fertilizer Advisor", href: "/fertilizer", icon: FlaskConical },
  { name: "Reports", href: "/reports", icon: FileBarChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { language } = useLanguage();
  const copy = getUiText(language);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-dvh bg-white border-r border-zinc-200 transition-all duration-300 ease-in-out flex flex-col justify-between dark:bg-[var(--bg-chrome)] dark:border-zinc-800 hidden md:flex",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <Image
              src="/agrivision-logo.png"
              alt="AgriVision.AI — Smart Farming"
              width={48}
              height={48}
              fetchPriority="high"
              className="h-10 w-10 shrink-0 object-contain"
            />
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-zinc-900 text-lg leading-tight dark:text-white">
                  AgriVision<span className="text-emerald-600 dark:text-emerald-400">.AI</span>
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
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100dvh-5rem)] scrollbar-thin">
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
                    ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                )}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200"
                  )}
                />
                {sidebarOpen && <span>{copy.nav[NAV_KEY_BY_HREF[item.href]]}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

    </aside>
  );
}

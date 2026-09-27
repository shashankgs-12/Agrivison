"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Scan,
  CloudSun,
  Droplets,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const MOBILE_BOTTOM_NAV = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Farms", href: "/farms", icon: Map },
  { name: "Scan", href: "/disease-detection", icon: Scan },
  { name: "Weather", href: "/weather", icon: CloudSun },
  { name: "Irrigate", href: "/irrigation", icon: Droplets },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 pt-1 pb-[max(env(safe-area-inset-bottom),0.4rem)] flex items-center justify-around dark:bg-slate-900/95 dark:border-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      aria-label="Bottom Navigation"
    >
      {MOBILE_BOTTOM_NAV.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center min-h-[48px] min-w-[56px] py-1 px-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer",
              isActive
                ? "text-emerald-700 font-bold dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              className={cn(
                "h-5 w-5 mb-0.5 transition-transform",
                isActive
                  ? "text-emerald-700 dark:text-emerald-400 scale-105"
                  : "text-slate-600 dark:text-slate-300"
              )}
            />
            <span className="leading-tight">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

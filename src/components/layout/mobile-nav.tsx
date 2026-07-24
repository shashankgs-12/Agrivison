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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around dark:bg-slate-900/95 dark:border-slate-800">
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
              "flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors",
              isActive
                ? "text-emerald-600 font-bold dark:text-emerald-400"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 mb-0.5",
                isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
              )}
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

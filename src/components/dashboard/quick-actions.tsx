"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Scan,
  Sparkles,
  Droplets,
  FileBarChart,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const QUICK_ACTIONS = [
  {
    name: "Add Farm",
    icon: Plus,
    href: "/farms/add",
    color: "from-emerald-500 to-green-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    name: "Disease Scanner",
    icon: Scan,
    href: "/disease-detection",
    color: "from-rose-500 to-red-600",
    shadow: "shadow-rose-500/20",
  },
  {
    name: "Plant ID",
    icon: Sparkles,
    href: "/plant-identification",
    color: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20",
  },
  {
    name: "Irrigation",
    icon: Droplets,
    href: "/irrigation",
    color: "from-sky-500 to-blue-600",
    shadow: "shadow-sky-500/20",
  },
  {
    name: "Reports",
    icon: FileBarChart,
    href: "/reports",
    color: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
  },
];

export function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800">
      <h3 className="text-sm font-bold text-slate-900 mb-3 dark:text-white">
        ⚡ Quick Actions
      </h3>
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.name}
              href={action.href}
              className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl hover:bg-slate-50 transition-all group dark:hover:bg-slate-800/50"
            >
              <div
                className={cn(
                  "h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110",
                  action.color,
                  action.shadow
                )}
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className="text-[10px] md:text-xs font-semibold text-slate-700 text-center leading-tight dark:text-slate-300">
                {action.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

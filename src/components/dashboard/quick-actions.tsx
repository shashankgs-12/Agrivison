"use client";

import React from "react";
import Link from "next/link";
import {
  Scan,
  Sparkles,
  Droplets,
  FileBarChart,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/hooks/use-language";
import { getDashboardText } from "@/lib/i18n/localization";

const QUICK_ACTIONS = [
  {
    nameKey: "quickAddFarm",
    icon: Plus,
    href: "/farms/add",
    color: "from-emerald-500 to-green-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    nameKey: "quickDisease",
    icon: Scan,
    href: "/disease-detection",
    color: "from-rose-500 to-red-600",
    shadow: "shadow-rose-500/20",
  },
  {
    nameKey: "quickPlant",
    icon: Sparkles,
    href: "/plant-identification",
    color: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20",
  },
  {
    nameKey: "quickIrrigation",
    icon: Droplets,
    href: "/irrigation",
    color: "from-sky-500 to-blue-600",
    shadow: "shadow-sky-500/20",
  },
  {
    nameKey: "quickReports",
    icon: FileBarChart,
    href: "/reports",
    color: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
  },
] as const;

export function QuickActions() {
  const { language } = useLanguage();
  const copy = getDashboardText(language);
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800">
      <h3 className="text-sm font-bold text-slate-900 mb-3 dark:text-white">
        ⚡ {copy.quickActions}
      </h3>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl hover:bg-slate-50 transition-all group dark:hover:bg-slate-800/50 min-h-[48px] justify-center cursor-pointer"
            >
              <div
                className={cn(
                  "h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105",
                  action.color,
                  action.shadow
                )}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-800 text-center leading-tight dark:text-slate-200">
                {copy[action.nameKey]}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

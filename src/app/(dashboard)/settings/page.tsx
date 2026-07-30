"use client";

import React from "react";
import Link from "next/link";
import {
  Globe,
  Bell,
  User,
  Shield,
  Palette,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    title: "Language & Regional Preferences",
    description: "Configure per-module output language for AI diagnosis, weather, and UI",
    icon: Globe,
    href: "/settings/language",
    badge: "Key Feature",
    color: "emerald",
  },
  {
    title: "Notification Settings",
    description: "Manage SMS, WhatsApp, and push alerts for disease and weather",
    icon: Bell,
    href: "/settings/notifications",
    color: "blue",
  },
  {
    title: "Profile & Account",
    description: "Update personal details, phone number, and farm locations",
    icon: User,
    href: "/profile",
    color: "violet",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage system preferences, multilingual settings, and account details
        </p>
      </div>

      <div className="space-y-3">
        {SETTINGS_SECTIONS.map((section, i) => {
          const Icon = section.icon;
          return (
            <Link key={i} href={section.href}>
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors text-sm dark:text-white">
                        {section.title}
                      </h3>
                      {section.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                          {section.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
                      {section.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

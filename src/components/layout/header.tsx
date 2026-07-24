"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  MapPin,
  Globe,
  Menu,
  Check,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MOCK_USER, MOCK_ALERTS } from "@/lib/mock-data";
import { SUPPORTED_LANGUAGES } from "@/lib/utils/constants";
import { useUIStore } from "@/stores/ui-store";
import { useLanguageStore } from "@/stores/language-store";

export function Header() {
  const { toggleSidebar } = useUIStore();
  const { preferences, setPreference } = useLanguageStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(
    (l) => l.code === preferences.dashboard
  ) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4 dark:bg-slate-900/80 dark:border-slate-800">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search farms, crops, weather, or diseases..."
            className="w-full h-9 pl-9 pr-4 text-xs md:text-sm bg-slate-100 border border-transparent rounded-full text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
          />
        </div>
      </div>

      {/* Right: Location, Language Selector, Notifications, User Avatar */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* Location Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full dark:bg-slate-800 dark:text-slate-300">
          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-medium">{MOCK_USER.location}</span>
        </div>

        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Select Language"
          >
            <Globe className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">{currentLang.name.split(" ")[0]}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-fade-in dark:bg-slate-800 dark:border-slate-700">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Dashboard Language
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setPreference("dashboard", lang.code);
                    setShowLangMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-medium transition-colors dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span>{lang.name}</span>
                  {preferences.dashboard === lang.code && (
                    <Check className="h-4 w-4 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-fade-in dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                <Badge variant="rose">2 New</Badge>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {MOCK_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-emerald-50/50 transition-colors dark:bg-slate-900/50 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-rose-600 font-bold">{alert.title}</span>
                      <span className="text-[10px] text-slate-400">{alert.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 dark:text-slate-300">
                      {alert.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <Avatar
            src={MOCK_USER.avatar}
            fallback="RP"
            alt={MOCK_USER.name}
            size="md"
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-slate-900 leading-tight dark:text-white">
              {MOCK_USER.name}
            </span>
            <span className="text-[10px] text-slate-500 font-medium dark:text-slate-400">
              {MOCK_USER.role.split("/")[0]}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

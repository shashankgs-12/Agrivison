"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  MapPin,
  Globe,
  Menu,
  Check,
  Sun,
  Moon,
  ShieldAlert,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_LANGUAGES } from "@/lib/utils/constants";
import { useUIStore } from "@/stores/ui-store";
import { useLanguageStore } from "@/stores/language-store";
import { useAuthStore } from "@/stores/auth-store";
import { useDiseaseRecords } from "@/hooks/use-history";

export function Header() {
  const { toggleSidebar, theme, toggleTheme } = useUIStore();
  const { preferences, setPreference } = useLanguageStore();
  const { user } = useAuthStore();
  const { diseaseRecords } = useDiseaseRecords();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(
    (l) => l.code === preferences.dashboard
  ) || SUPPORTED_LANGUAGES[0];

  const userName = user?.name || "Farmer";
  const userRole = user?.role ? user.role.replace("_", " ") : "Farmer";
  const userAvatar = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

  const activeAlerts = diseaseRecords.filter(
    (r) => r.severity === "critical" || r.severity === "high"
  );

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4 dark:bg-slate-900/90 dark:border-slate-800">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search farms, crops, weather, or disease scans..."
            className="w-full h-9 pl-9 pr-4 text-xs md:text-sm bg-slate-100 border border-transparent rounded-full text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Right: Location, Theme Toggle, Language Selector, Notifications, User Avatar */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Location Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full dark:bg-slate-800 dark:text-slate-300">
          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-semibold">{user?.location || "Mandya District, KA"}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>

        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            title="Select Language"
          >
            <Globe className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">{currentLang.name.split(" ")[0]}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-fade-in dark:bg-slate-900 dark:border-slate-800">
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
                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 font-semibold transition-colors dark:text-slate-200 dark:hover:bg-emerald-950/50 cursor-pointer"
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
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {activeAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-fade-in dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                <Badge className={activeAlerts.length > 0 ? "bg-rose-500 text-white" : "bg-emerald-600 text-white"}>
                  {activeAlerts.length} Critical
                </Badge>
              </div>

              {activeAlerts.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500">
                  No active disease alerts for your crops.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-300 mb-0.5">
                        <span className="flex items-center gap-1">
                          <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                          {alert.diseaseName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 dark:text-slate-400">
                        {alert.symptoms}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <Avatar src={userAvatar} fallback={userName.charAt(0)} alt={userName} size="md" />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-slate-900 leading-tight dark:text-white">
              {userName}
            </span>
            <span className="text-[10px] text-slate-500 font-medium capitalize dark:text-slate-400">
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

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
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MOCK_ALERTS } from "@/lib/mock-data";
import { SUPPORTED_LANGUAGES } from "@/lib/utils/constants";
import { useUIStore } from "@/stores/ui-store";
import { useLanguageStore } from "@/stores/language-store";
import { useAuthStore } from "@/stores/auth-store";

export function Header() {
  const { toggleSidebar, theme, toggleTheme } = useUIStore();
  const { preferences, setPreference } = useLanguageStore();
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(
    (l) => l.code === preferences.dashboard
  ) || SUPPORTED_LANGUAGES[0];

  const userName = user?.name || "Ramesh Patel";
  const userRole = user?.role ? user.role.replace("_", " ") : "Farmer";
  const userAvatar = user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80";

  return (
    <header className="h-16 border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4 dark:bg-black/90 dark:border-zinc-800">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search farms, crops, weather, or diseases..."
            className="w-full h-9 pl-9 pr-4 text-xs md:text-sm bg-zinc-100 border border-transparent rounded-full text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-[#00ab41] focus:outline-none transition-all dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:bg-black"
          />
        </div>
      </div>

      {/* Right: Location, Theme Toggle, Language Selector, Notifications, User Avatar */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Location Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-full dark:bg-zinc-900 dark:text-zinc-300">
          <MapPin className="h-3.5 w-3.5 text-[#00ab41]" />
          <span className="font-medium">{user?.location || "Mandya District, KA"}</span>
        </div>

        {/* Theme Toggle Button (Light / Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-zinc-700" />
          )}
        </button>

        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
            title="Select Language"
          >
            <Globe className="h-4 w-4 text-[#00ab41]" />
            <span className="hidden sm:inline">{currentLang.name.split(" ")[0]}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-zinc-200 py-1 z-50 animate-fade-in dark:bg-black dark:border-zinc-800">
              <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Dashboard Language
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setPreference("dashboard", lang.code);
                    setShowLangMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#008631]/10 text-zinc-700 hover:text-[#00ab41] font-semibold transition-colors dark:text-zinc-200 dark:hover:bg-[#00ab41]/15 cursor-pointer"
                >
                  <span>{lang.name}</span>
                  {preferences.dashboard === lang.code && (
                    <Check className="h-4 w-4 text-[#00ab41]" />
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
            className="relative p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-black animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-200 p-3 z-50 animate-fade-in dark:bg-black dark:border-zinc-800">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                <span className="font-bold text-sm text-zinc-900 dark:text-white">Notifications</span>
                <Badge variant="rose">2 New</Badge>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {MOCK_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-[#008631]/10 transition-colors dark:bg-zinc-900/60 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-rose-600 font-bold">{alert.title}</span>
                      <span className="text-[10px] text-zinc-400">{alert.time}</span>
                    </div>
                    <p className="text-xs text-zinc-600 line-clamp-2 dark:text-zinc-300">
                      {alert.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <Avatar
            src={userAvatar}
            fallback={userName.charAt(0)}
            alt={userName}
            size="md"
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold text-zinc-900 leading-tight dark:text-white">
              {userName}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium capitalize dark:text-zinc-400">
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

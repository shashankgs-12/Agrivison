"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
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
  X,
  User as UserIcon,
  LogOut,
  Crown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar } from "@/components/ui/avatar";

const MOBILE_DRAWER_NAV = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Farms", href: "/farms", icon: Map },
  { name: "Crops", href: "/crops", icon: Sprout },
  { name: "Disease Scanner", href: "/disease-detection", icon: Scan },
  { name: "Plant ID", href: "/plant-identification", icon: Sparkles },
  { name: "Weather", href: "/weather", icon: CloudSun },
  { name: "Irrigation Advisor", href: "/irrigation", icon: Droplets },
  { name: "Reports", href: "/reports", icon: FileBarChart },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "My Profile", href: "/profile", icon: UserIcon },
];

export function MobileDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const { user, logout } = useAuthStore();

  // Close drawer on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  // Lock body scroll and handle Escape key when drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeMobileMenu();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuOpen, closeMobileMenu]);

  if (!isMobileMenuOpen) return null;

  const userName = user?.name || "Farmer";
  const userRole = user?.role ? user.role.replace("_", " ") : "Farmer";
  const userAvatar = user?.avatar;

  const handleLogout = async () => {
    closeMobileMenu();
    logout();
    try {
      await signOut({ callbackUrl: "/login", redirect: true });
    } catch {
      router.push("/login");
    }
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 flex animate-fade-in" role="dialog" aria-modal="true" aria-label="Mobile Navigation Drawer">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-[300px] max-w-[85vw] h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-2xl z-10 animate-slide-in-right">
        {/* Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800">
            <Link
              href="/dashboard"
              onClick={closeMobileMenu}
              className="flex items-center gap-2.5 overflow-hidden"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#008631] to-[#00ab41] flex items-center justify-center text-white shadow-md shadow-[#008631]/20 shrink-0">
                <Sprout className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-zinc-900 text-base leading-tight dark:text-white">
                  AgriVision<span className="text-[#00ab41]">.AI</span>
                </span>
                <span className="text-[10px] text-zinc-600 font-medium tracking-wide uppercase dark:text-zinc-400">
                  Smart Farming
                </span>
              </div>
            </Link>

            <button
              onClick={closeMobileMenu}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-17rem)] scrollbar-thin">
            {MOBILE_DRAWER_NAV.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] transition-all relative",
                    isActive
                      ? "bg-[#008631]/10 text-[#00ab41] font-bold dark:bg-[#00ab41]/15 dark:text-[#00ab41]"
                      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#00ab41] rounded-r-full" />
                  )}
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive
                        ? "text-[#00ab41]"
                        : "text-zinc-500 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-100"
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area: User Profile & Premium / Logout */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          {/* User info card */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar src={userAvatar} fallback={userName.charAt(0)} alt={userName} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 truncate dark:text-white leading-tight">
                  {userName}
                </p>
                <p className="text-[10px] text-zinc-500 capitalize truncate dark:text-zinc-400 font-medium">
                  {userRole}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Go Premium Card */}
          <div className="rounded-xl bg-gradient-to-br from-[#008631] to-[#00ab41] p-3 text-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-amber-300" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
                  AgriVision Pro
                </span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                Active
              </span>
            </div>
            <p className="text-[11px] text-emerald-50 leading-tight mb-2">
              Hyperlocal AI weather alerts & precision crop scanning.
            </p>
            <Link
              href="/settings"
              onClick={closeMobileMenu}
              className="w-full py-1.5 px-3 bg-white text-[#008631] font-bold text-[11px] rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1 shadow-sm"
            >
              <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
              Manage Plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

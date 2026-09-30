"use client";

import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { ready, isAuthenticated, requiresProfileCompletion } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const completingProfile =
    requiresProfileCompletion && pathname === "/complete-profile";

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace("/login");
    else if (ready && requiresProfileCompletion && pathname !== "/complete-profile") {
      router.replace("/complete-profile");
    } else if (ready && !requiresProfileCompletion && pathname === "/complete-profile") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, pathname, ready, requiresProfileCompletion, router]);

  if (
    !ready ||
    !isAuthenticated ||
    (requiresProfileCompletion && pathname !== "/complete-profile")
  ) {
    return (
      <main
        className="flex min-h-dvh items-center justify-center bg-white text-sm text-zinc-500 dark:bg-black dark:text-zinc-400"
        role="status"
        aria-live="polite"
      >
        Checking your session…
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">
      {/* Keep dashboard destinations out of the way until onboarding is complete. */}
      {!completingProfile && <MobileDrawer />}

      {/* Sidebar — desktop only */}
      {!completingProfile && <Sidebar />}

      {/* Main content area */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          completingProfile ? "md:ml-0" : sidebarOpen ? "md:ml-64" : "md:ml-20"
        )}
      >
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="min-h-[calc(100dvh-4rem)] p-4 pb-24 md:p-6 md:pb-6">
          {completingProfile && (
            <p
              className="mx-auto mb-5 max-w-xl rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
              role="status"
            >
              Complete your mobile number and farm location, then save to unlock the dashboard.
            </p>
          )}
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      {!completingProfile && <MobileNav />}
    </div>
  );
}

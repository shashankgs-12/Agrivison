"use client";

import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">
      {/* Sidebar — desktop only */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:ml-64" : "md:ml-20"
        )}
      >
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="p-4 md:p-6 pb-24 md:pb-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <MobileNav />
    </div>
  );
}

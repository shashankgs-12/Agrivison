import React from "react";
import Link from "next/link";
import { Sprout } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Auth Header */}
      <div className="px-4 py-3 sm:px-6 sm:py-5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 min-h-[44px]">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-[#008631] to-[#00ab41] flex items-center justify-center text-white shadow-lg shadow-[#008631]/20">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg sm:text-xl text-zinc-900 dark:text-white tracking-tight">
            AgriVision<span className="text-[#00ab41]">.AI</span>
          </span>
        </Link>
      </div>

      {/* Auth content */}
      <div className="flex-1 flex items-center justify-center px-3 py-4 sm:px-4 sm:py-8 sm:pb-12">
        {children}
      </div>
    </div>
  );
}

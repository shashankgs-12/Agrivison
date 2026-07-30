import React from "react";
import Link from "next/link";
import { Sprout } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Auth Header */}
      <div className="p-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#008631] to-[#00ab41] flex items-center justify-center text-white shadow-lg shadow-[#008631]/20">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl text-zinc-900 dark:text-white tracking-tight">
            AgriVision<span className="text-[#00ab41]">.AI</span>
          </span>
        </Link>
      </div>

      {/* Auth content */}
      <div className="flex-1 flex items-center justify-center p-4 pb-12">
        {children}
      </div>
    </div>
  );
}

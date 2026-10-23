import React from "react";
import Link from "next/link";
import Image from "next/image";

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
          <Image
            src="/agrivision-logo.png"
            alt="AgriVision.AI — Smart Farming"
            width={48}
            height={48}
            fetchPriority="high"
            className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 object-contain"
          />
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

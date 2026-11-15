"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineModeBadge({
  cachedData = false,
  hasCachedData = false,
}: {
  cachedData?: boolean;
  hasCachedData?: boolean;
}) {
  const [browserOffline, setBrowserOffline] = useState(false);

  useEffect(() => {
    const update = () => setBrowserOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!browserOffline && !cachedData) return null;
  const savedDataAvailable = cachedData || hasCachedData;
  return (
    <span role="status" className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
      <WifiOff className="h-3.5 w-3.5" />
      {savedDataAvailable ? "Offline Mode · Showing saved farm data" : "Offline Mode · No saved data available"}
    </span>
  );
}

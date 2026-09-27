"use client";

import { useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";
import { isUserRole } from "@/lib/auth/roles";

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  phone?: string | null;
  role?: string | null;
  location?: string | null;
  subscription?: string | null;
  requiresProfileCompletion?: boolean;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (session?.user) {
      const su = session.user as SessionUser;
      if (!su.id) {
        setUser(null);
        return;
      }
      const roleLower: "farmer" | "admin" =
        isUserRole(su.role) && su.role === "ADMIN" ? "admin" : "farmer";

      setUser({
        uid: su.id,
        name: su.name || "Farmer",
        email: su.email || "",
        phone: su.phone || "",
        role: roleLower,
        avatar:
          su.image ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
            su.name || "Farmer"
          )}`,
        location: su.location || "GPS Location Active",
        subscription: su.subscription || "Free Plan",
      });
    } else if (status === "unauthenticated") {
      setUser(null);
    }
  }, [session, setUser, status]);

  const sessionUserId = (session?.user as SessionUser | undefined)?.id;
  const isAuthenticated = status === "authenticated" && Boolean(sessionUserId);
  const loading = status === "loading";
  const ready = !loading && (!isAuthenticated || user?.uid === sessionUserId);
  const requiresProfileCompletion = Boolean(
    (session?.user as SessionUser | undefined)?.requiresProfileCompletion
  );

  return { user, isAuthenticated, loading, ready, requiresProfileCompletion, session };
}

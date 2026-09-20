"use client";

import { useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  phone?: string | null;
  role?: string | null;
  location?: string | null;
  subscription?: string | null;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (session?.user) {
      const su = session.user as SessionUser;
      const roleLower = (su.role?.toLowerCase() || "farmer") as
        | "farmer"
        | "admin";

      setUser({
        uid: su.id || `usr-${Date.now()}`,
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
    }
  }, [session, setUser]);

  const isAuthenticated = status === "authenticated" || !!user;
  const loading = status === "loading";

  return { user, isAuthenticated, loading, session };
}

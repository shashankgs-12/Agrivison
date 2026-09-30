import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (process.env.VERCEL_ENV === "production") {
    const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;

    if (authUrl) {
      try {
        const canonicalUrl = new URL(authUrl);

        if (req.nextUrl.origin !== canonicalUrl.origin) {
          const destination = req.nextUrl.clone();
          destination.protocol = canonicalUrl.protocol;
          destination.host = canonicalUrl.host;
          return NextResponse.redirect(destination);
        }
      } catch {
        // Ignore invalid URL configuration here; Auth.js reports it at runtime.
      }
    }
  }

  const { nextUrl } = req;
  const protectedRoots = [
    "/dashboard",
    "/farms",
    "/crops",
    "/disease-detection",
    "/plant-identification",
    "/irrigation",
    "/fertilizer",
    "/reports",
    "/weather",
    "/profile",
    "/settings",
    "/notifications",
    "/admin",
    "/analytics",
    "/users",
    "/complete-profile",
  ];
  const isProtectedRoute = protectedRoots.some(
    (root) => nextUrl.pathname === root || nextUrl.pathname.startsWith(`${root}/`)
  );

  if (isProtectedRoute && !req.auth) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

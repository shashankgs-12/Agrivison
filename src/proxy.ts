import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

const DEFAULT_PRODUCTION_ORIGIN = "https://agrivision-ai-steel.vercel.app";

function getProductionOrigin() {
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return process.env.AUTH_URL || process.env.NEXTAUTH_URL ||
    (productionUrl ? `https://${productionUrl}` : DEFAULT_PRODUCTION_ORIGIN);
}

export default auth((req) => {
  // Keep production aliases on the stable OAuth origin. Preview URLs must stay
  // on their own host so Auth.js can proxy the OAuth callback back to that URL.
  if (process.env.VERCEL_ENV === "production") {
    const authUrl = getProductionOrigin();

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

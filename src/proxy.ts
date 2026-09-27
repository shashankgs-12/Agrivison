import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const protectedRoots = [
    "/dashboard",
    "/farms",
    "/crops",
    "/disease-detection",
    "/plant-identification",
    "/irrigation",
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


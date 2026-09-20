import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const hasSessionCookie =
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token") ||
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token") ||
    req.cookies.has("agrivision_session");

  const isLoggedIn = !!req.auth || hasSessionCookie;

  const isDashboardRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/farms") ||
    nextUrl.pathname.startsWith("/crops") ||
    nextUrl.pathname.startsWith("/disease-detection") ||
    nextUrl.pathname.startsWith("/plant-identification") ||
    nextUrl.pathname.startsWith("/irrigation") ||
    nextUrl.pathname.startsWith("/reports") ||
    nextUrl.pathname.startsWith("/weather") ||
    nextUrl.pathname.startsWith("/profile") ||
    nextUrl.pathname.startsWith("/settings");

  if (isDashboardRoute && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};


import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Auth + i18n middleware will be configured in Phase 2
  if (request.nextUrl.pathname) {
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};

import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/book", "/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const session = req.cookies.get("better-auth.session_token")
      ?? req.cookies.get("__Secure-better-auth.session_token");

    if (!session) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/book/:path*", "/admin/:path*"],
};

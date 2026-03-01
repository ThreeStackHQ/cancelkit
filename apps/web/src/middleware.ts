import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest, NextMiddleware } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/flows", "/analytics", "/settings", "/billing"];

const middleware = auth((req: NextRequest & { auth?: unknown }) => {
  const isAuthenticated = !!(req as { auth?: unknown }).auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    req.nextUrl.pathname.startsWith(prefix)
  );

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/flows", req.url));
  }

  return NextResponse.next();
}) as unknown as NextMiddleware;

export default middleware;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/flows/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/login",
  ],
};

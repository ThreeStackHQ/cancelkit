import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest, NextMiddleware } from "next/server";

const middleware = auth((req: NextRequest & { auth?: unknown }) => {
  const isAuthenticated = !!(req as { auth?: unknown }).auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}) as unknown as NextMiddleware;

export default middleware;

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};

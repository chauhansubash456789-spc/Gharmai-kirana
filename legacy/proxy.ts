import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "ghk_session";

async function readSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const secret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret || "dev-secret-change-me"));
    if (!payload.sub) return null;
    return {
      sub: payload.sub as string,
      role: String(payload.role || "customer"),
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const session = await readSession(request);
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute =
    pathname.startsWith("/account") ||
    pathname === "/checkout" ||
    pathname.startsWith("/wishlist");

  if (isAdminRoute) {
    if (!session) return NextResponse.redirect(new URL("/login", request.url));
    if (session.role !== "admin") return NextResponse.redirect(new URL("/", request.url));
  } else if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout", "/wishlist/:path*"],
};
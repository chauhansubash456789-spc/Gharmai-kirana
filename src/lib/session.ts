import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

const SESSION_COOKIE = "ghk_session";

const getSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("AUTH_SECRET must be set in production. Generate one with: openssl rand -base64 48");
  }
  return new TextEncoder().encode(secret || "dev-secret-change-me");
};

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

export interface SessionPayload {
  sub: string;
  role: string;
  v: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(userId: number, role: string, tokenVersion = 0): Promise<string> {
  return new SignJWT({ role, v: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return { sub: payload.sub, role: String(payload.role || "customer"), v: Number(payload.v ?? 0) };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  };
}

export async function getUserFromSession(session: SessionPayload | null) {
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: Number(session.sub) } });
}
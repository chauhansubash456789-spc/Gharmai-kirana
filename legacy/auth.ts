import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import type { UserModel as User } from "@/generated/prisma/models";

const SESSION_COOKIE = "ghk_session";
const getSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("AUTH_SECRET must be set in production. Generate one with: openssl rand -base64 48");
  }
  return new TextEncoder().encode(secret || "dev-secret-change-me");
};

export interface SessionPayload {
  sub: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: number, role: string) {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return { sub: payload.sub, role: String(payload.role || "customer") };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<User | null> {
  const session = await readSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: Number(session.sub) } });
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") redirect("/");
  return user;
}
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken, type SessionPayload } from "../lib/session";

async function resolveSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });
  if (!user || user.tokenVersion !== payload.v) return null;
  return { sub: payload.sub, role: user.role, v: user.tokenVersion };
}

export async function optionalSession(req: Request, res: Response, next: NextFunction) {
  res.locals.session = await resolveSession(req.cookies?.[SESSION_COOKIE_NAME]);
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = await resolveSession(req.cookies?.[SESSION_COOKIE_NAME]);
  if (!session) {
    res.status(401).json({ error: "Please login to continue." });
    return;
  }
  res.locals.session = session;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = await resolveSession(req.cookies?.[SESSION_COOKIE_NAME]);
  if (!session) {
    res.status(401).json({ error: "Please login to continue." });
    return;
  }
  if (session.role !== "admin") {
    res.status(403).json({ error: "Admin access only." });
    return;
  }
  res.locals.session = session;
  next();
}

export async function requireDriver(req: Request, res: Response, next: NextFunction) {
  const session = await resolveSession(req.cookies?.[SESSION_COOKIE_NAME]);
  if (!session) {
    res.status(401).json({ error: "Please login to continue." });
    return;
  }
  if (session.role !== "driver" && session.role !== "admin") {
    res.status(403).json({ error: "Driver access only." });
    return;
  }
  res.locals.session = session;
  next();
}

export function sessionOf(res: Response): SessionPayload | null {
  return res.locals.session ?? null;
}
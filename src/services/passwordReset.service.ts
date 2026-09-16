import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/session";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export function hashResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

function generateRawToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createPasswordReset(identifier: string) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { phone: identifier }] },
  });
  if (!user) return { found: false as const };

  const rawToken = generateRawToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetTokenHash: hashResetToken(rawToken),
      resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  return { found: true as const, rawToken, email: user.email ?? user.phone };
}

export async function consumePasswordReset(rawToken: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetTokenHash: hashResetToken(rawToken),
      resetTokenExpiry: { gt: new Date() },
    },
  });
  if (!user) return false;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(newPassword),
      resetTokenHash: null,
      resetTokenExpiry: null,
      tokenVersion: { increment: 1 },
    },
  });
  return true;
}
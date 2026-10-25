import { Router } from "express";
import { prisma } from "../lib/prisma";
import { SESSION_COOKIE_NAME, signSessionToken, hashPassword, verifyPassword, sessionCookieOptions } from "../lib/session";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validations/auth";
import { validateBody, validatedOf } from "../middleware/validate";
import { optionalSession } from "../middleware/auth";
import { rateLimit } from "../middleware/rateLimit";
import { createPasswordReset, consumePasswordReset } from "../services/passwordReset.service";
import { sendPasswordResetEmail } from "../lib/email";
import { frontendBaseUrl } from "../lib/appUrl";

export const authRouter = Router();

function toPublicUser(user: { id: number; name: string; phone: string; role: string; loyaltyPoints: number }) {
  return { id: user.id, name: user.name, phone: user.phone, role: user.role, loyaltyPoints: user.loyaltyPoints };
}

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const { name, phone, email, password } = validatedOf<{ name: string; phone: string; email: string; password: string }>(res);
  const normalizedEmail = email.trim();

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    res.status(409).json({ error: "An account with this mobile number already exists. Please login." });
    return;
  }

  if (normalizedEmail) {
    const emailTaken = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (emailTaken) {
      res.status(409).json({
        error: "An account with this email already exists. Please login or use a different email.",
        fieldErrors: { email: ["This email is already registered."] },
      });
      return;
    }
  }

  const user = await prisma.user.create({
    data: { name, phone, email: normalizedEmail, passwordHash: await hashPassword(password) },
  });

  const token = await signSessionToken(user.id, user.role, user.tokenVersion);
  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  res.status(201).json({ user: toPublicUser(user), token });
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const { phone, password } = validatedOf<{ phone: string; password: string }>(res);
  const identifier = phone.trim();
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: identifier },
        { email: identifier },
        ...(identifier.toLowerCase() === "admin" ? [{ role: "admin" }] : []),
      ],
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid mobile number or password." });
    return;
  }

  const token = await signSessionToken(user.id, user.role, user.tokenVersion);
  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  res.json({ user: toPublicUser(user), token });
});

authRouter.post("/forgot-password", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), validateBody(forgotPasswordSchema), async (req, res) => {
  const { email } = validatedOf<{ email: string }>(res);
  const result = await createPasswordReset(email.trim());

  if (result.found) {
    const resetLink = `${frontendBaseUrl()}/reset-password/${result.rawToken}`;
    const mail = await sendPasswordResetEmail(result.email, resetLink);
    if (mail.sent) {
      res.json({ message: "If an account exists for that email, a reset link has been sent. Check your inbox." });
      return;
    }
    if (mail.devLink) {
      res.json({
        message: "If an account exists for that email, a reset link has been sent. Check your inbox.",
        devResetLink: mail.devLink,
      });
      return;
    }
  }

  res.json({ message: "If an account exists for that email, a reset link has been sent. Check your inbox." });
});

authRouter.post("/reset-password/:token", validateBody(resetPasswordSchema), async (req, res) => {
  const { newPassword } = validatedOf<{ newPassword: string }>(res);
  const ok = await consumePasswordReset(String(req.params.token), newPassword);
  if (!ok) {
    res.status(400).json({ error: "This reset link is invalid or has expired. Please request a new one." });
    return;
  }
  res.json({ ok: true });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

authRouter.get("/me", optionalSession, async (_req, res) => {
  const session = res.locals.session;
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: Number(session.sub) } });
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ user: toPublicUser(user) });
});
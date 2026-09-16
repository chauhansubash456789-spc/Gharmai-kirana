"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/validations/auth";

export type ActionState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return { error: "An account with this mobile number already exists. Please login." };
  }

  const user = await prisma.user.create({
    data: { name, phone, passwordHash: await hashPassword(password) },
  });

  await createSession(user.id, user.role);
  redirect("/account");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { phone, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { OR: [{ phone }, { email: phone }] },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid mobile number or password." };
  }

  await createSession(user.id, user.role);
  redirect(user.role === "admin" ? "/admin" : "/account");
}
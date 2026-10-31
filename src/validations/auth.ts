import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  phone: z.string().regex(/^(\+977|977)?9\d{9}$/, "Enter a valid 10-digit mobile number (e.g. 98XXXXXXXX)"),
  email: z.string().email("Enter a valid email address").or(z.literal("")).optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  phone: z.string().min(1, "Enter your mobile number"),
  password: z.string().min(1, "Enter your password"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Enter your email or mobile number"),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
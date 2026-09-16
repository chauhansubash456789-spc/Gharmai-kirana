import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Register — Gharmai Kirana" };

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user && user.role !== "admin") redirect("/account");
  return <RegisterForm />;
}
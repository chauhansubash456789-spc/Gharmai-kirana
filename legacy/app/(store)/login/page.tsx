import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Login — Gharmai Kirana" };

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user && user.role !== "admin") redirect("/account");
  return <LoginForm />;
}
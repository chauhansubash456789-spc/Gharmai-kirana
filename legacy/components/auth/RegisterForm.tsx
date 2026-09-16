"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type ActionState } from "@/actions/auth";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{errors[0]}</p>;
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(registerAction, {});

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="mt-1 text-sm text-gray-500">Order groceries and get first-order offers.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full name</label>
            <input
              name="name"
              placeholder="e.g. Sunil Mahato"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
            />
            <FieldError errors={state.fieldErrors?.name} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Mobile number</label>
            <input
              name="phone"
              type="tel"
              placeholder="98XXXXXXXX"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
            />
            <FieldError errors={state.fieldErrors?.phone} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
            />
            <FieldError errors={state.fieldErrors?.password} />
          </div>

          {state.error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{state.error}</div>
          )}

          <button
            disabled={pending}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
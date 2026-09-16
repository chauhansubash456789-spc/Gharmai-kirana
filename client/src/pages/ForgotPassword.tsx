import { useState } from "react";
import { Link } from "react-router-dom";
import type { FormEvent } from "react";
import { api, ApiError } from "@/api/client";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [devLink, setDevLink] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await api.post<{ message: string; devResetLink?: string }>("/api/auth/forgot-password", {
        email: email.trim(),
      });
      setDone(true);
      if (res.devResetLink) setDevLink(res.devResetLink);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the email or mobile number linked to your account and we'll send you a reset link.
        </p>

        {done ? (
          <div className="mt-6">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <Mail className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Check your email</p>
                <p className="mt-1 text-sm text-emerald-700">
                  If an account exists, we've sent a reset link. It expires in 30 minutes.
                </p>
              </div>
            </div>
            {devLink && (
              <details className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <summary className="cursor-pointer text-xs font-semibold text-gray-500">
                  Dev mode (SMTP not configured) — reset link
                </summary>
                <a href={devLink} className="mt-2 block break-all text-xs font-medium text-emerald-700 hover:underline">
                  {devLink}
                </a>
              </details>
            )}
            <p className="mt-5 text-center text-sm text-gray-500">
              <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
                Back to login
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email or mobile number</label>
              <input
                name="email"
                placeholder="you@example.com or 98XXXXXXXX"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
              />
            </div>

            {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</div>}

            <button
              disabled={pending || !email.trim()}
              type="submit"
              className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {pending ? "Sending..." : "Send reset link"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Remembered it?{" "}
              <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
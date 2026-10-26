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
      <div className="rounded-xl border border-[#EAE5D9] bg-white p-8 shadow-artisanal">
        <h1 className="font-serif text-2xl font-bold text-[#222222]">Forgot Password</h1>
        <p className="mt-1 text-sm text-[#666159]">
          Enter the email or mobile number linked to your account and we'll send you a reset link.
        </p>

        {done ? (
          <div className="mt-6">
            <div className="flex items-start gap-3 rounded-xl border border-[#C4D6CC] bg-[#EFF5F2] p-4">
              <Mail className="mt-0.5 h-5 w-5 text-[#2C5E3B]" />
              <div>
                <p className="text-sm font-semibold text-[#2C5E3B]">Check your email</p>
                <p className="mt-1 text-sm text-[#3E704D]">
                  If an account exists, we've sent a reset link. It expires in 30 minutes.
                </p>
              </div>
            </div>
            {devLink && (
              <details className="mt-4 rounded-xl border border-[#EAE5D9] bg-[#FDFBF7] p-3">
                <summary className="cursor-pointer text-xs font-semibold text-[#8E887E]">
                  Dev mode (SMTP not configured) — reset link
                </summary>
                <a href={devLink} className="mt-2 block break-all text-xs font-medium text-[#2C5E3B] hover:text-[#D98510]">
                  {devLink}
                </a>
              </details>
            )}
            <p className="mt-5 text-center text-sm text-[#8E887E]">
              <Link to="/login" className="font-semibold text-[#2C5E3B] hover:text-[#D98510] transition-colors">
                Back to login
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-[#222222]">Email or mobile number</label>
              <input
                name="email"
                placeholder="you@example.com or 98XXXXXXXX"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#EAE5D9] bg-white px-3 py-2.5 text-sm text-[#222222] placeholder:text-[#8E887E] outline-none focus:border-[#F29C1B] focus:ring-1 focus:ring-[#F29C1B]"
              />
            </div>

            {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 border border-red-200">{error}</div>}

            <button
              disabled={pending || !email.trim()}
              type="submit"
              className="w-full rounded-xl bg-[#F29C1B] py-3 font-bold text-black shadow-sm hover:bg-[#D98510] transition-colors disabled:opacity-60"
            >
              {pending ? "Sending..." : "Send reset link"}
            </button>

            <p className="text-center text-sm text-[#8E887E]">
              Remembered it?{" "}
              <Link to="/login" className="font-semibold text-[#2C5E3B] hover:text-[#D98510] transition-colors">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
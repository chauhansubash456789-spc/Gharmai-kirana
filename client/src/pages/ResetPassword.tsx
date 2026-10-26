import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { FormEvent } from "react";
import { api, ApiError } from "@/api/client";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      await api.post(`/api/auth/reset-password/${token}`, { newPassword });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-xl border border-[#EAE5D9] bg-white p-8 text-center shadow-artisanal">
          <h1 className="font-serif text-2xl font-bold text-[#2C5E3B]">Password updated</h1>
          <p className="mt-2 text-sm text-[#666159]">Your password has been reset. You can now login with your new password.</p>
          <Link
            to="/login"
            className="mt-6 inline-block w-full rounded-xl bg-[#F29C1B] py-3 text-center font-bold text-black shadow-sm hover:bg-[#D98510] transition-colors"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-[#EAE5D9] bg-white p-8 shadow-artisanal">
        <h1 className="font-serif text-2xl font-bold text-[#222222]">Set a new password</h1>
        <p className="mt-1 text-sm text-[#666159]">Choose a new password for your account.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-[#222222]">New password</label>
            <input
              name="newPassword"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#EAE5D9] bg-white px-3 py-2.5 text-sm text-[#222222] placeholder:text-[#8E887E] outline-none focus:border-[#F29C1B] focus:ring-1 focus:ring-[#F29C1B]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#222222]">Confirm new password</label>
            <input
              name="confirm"
              type="password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#EAE5D9] bg-white px-3 py-2.5 text-sm text-[#222222] placeholder:text-[#8E887E] outline-none focus:border-[#F29C1B] focus:ring-1 focus:ring-[#F29C1B]"
            />
          </div>

          {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 border border-red-200">{error}</div>}

          <button
            disabled={pending}
            type="submit"
            className="w-full rounded-xl bg-[#F29C1B] py-3 font-bold text-black shadow-sm hover:bg-[#D98510] transition-colors disabled:opacity-60"
          >
            {pending ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
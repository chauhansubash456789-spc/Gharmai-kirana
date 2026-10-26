import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const me = await login(phone.trim(), password);
      if (me.role === "admin") {
        const from = (location.state as { from?: string } | null)?.from;
        navigate(from || "/admin", { replace: true });
        return;
      }
      if (me.role === "driver") {
        navigate("/driver", { replace: true });
        return;
      }
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from || "/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setError(Object.values(err.fieldErrors).flat().join(" "));
      } else {
        setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-[#EAE5D9] bg-white p-7 shadow-artisanal">
        <h1 className="text-2xl font-bold font-serif text-[#222222] tracking-tight">Login</h1>
        <p className="mt-1 text-sm text-[#666159]">Login with your mobile number.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-[#222222]">Mobile number</label>
            <input
              name="phone"
              type="tel"
              placeholder="98XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#EAE5D9] px-3.5 py-2.5 text-sm text-[#222222] outline-none focus:border-[#F29C1B] transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#222222]">Password</label>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#EAE5D9] px-3.5 py-2.5 text-sm text-[#222222] outline-none focus:border-[#F29C1B] transition-colors"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-[#FEF7EC] border border-[#FCE4B8] px-3.5 py-2 text-sm font-medium text-[#D98510]">{error}</div>
          )}

          <button
            disabled={pending}
            type="submit"
            className="w-full rounded-xl bg-[#F29C1B] py-3 font-bold text-black shadow-xs hover:bg-[#D98510] disabled:opacity-60 transition-all"
          >
            {pending ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#666159]">
          New here?{" "}
          <Link to="/register" className="font-semibold text-[#D98510] hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-[#8E887E]">
          <Link to="/forgot-password" className="font-medium text-[#8E887E] hover:text-[#D98510]">
            Forgot password?
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-[#8E887E]">First order? Get Rs. 100 off above Rs. 999.</p>
      </div>
    </div>
  );
}

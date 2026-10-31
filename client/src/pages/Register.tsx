import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/api/client";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{errors[0]}</p>;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setPending(true);
    try {
      await register(name.trim(), phone.trim(), email.trim(), password);
      navigate("/account", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-[#EAE5D9] bg-white p-7 shadow-artisanal">
        <h1 className="text-2xl font-bold font-serif text-[#222222] tracking-tight">Create Account</h1>
        <p className="mt-1 text-sm text-[#666159]">Order groceries and get first-order offers.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-[#222222]">Full name</label>
            <input
              name="name"
              placeholder="e.g. Sunil Mahato"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#EAE5D9] px-3.5 py-2.5 text-sm text-[#222222] outline-none focus:border-[#F29C1B] transition-colors"
            />
            <FieldError errors={fieldErrors.name} />
          </div>
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
            <FieldError errors={fieldErrors.phone} />
          </div>
          <div>
            <label className="text-sm font-medium text-[#222222]">Email address</label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#EAE5D9] px-3.5 py-2.5 text-sm text-[#222222] outline-none focus:border-[#F29C1B] transition-colors"
            />
            <FieldError errors={fieldErrors.email} />
          </div>
          <div>
            <label className="text-sm font-medium text-[#222222]">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#EAE5D9] px-3.5 py-2.5 text-sm text-[#222222] outline-none focus:border-[#F29C1B] transition-colors"
            />
            <FieldError errors={fieldErrors.password} />
          </div>

          {error && (
            <div className="rounded-xl bg-[#FEF7EC] border border-[#FCE4B8] px-3.5 py-2 text-sm font-medium text-[#D98510]">{error}</div>
          )}

          <button
            disabled={pending}
            type="submit"
            className="w-full rounded-xl bg-[#F29C1B] py-3 font-bold text-black shadow-xs hover:bg-[#D98510] disabled:opacity-60 transition-all"
          >
            {pending ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#666159]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#D98510] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

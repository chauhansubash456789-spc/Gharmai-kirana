"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory } from "@/actions/admin";

export function CategoryForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await createCategory({ name });
    if (res && "error" in res && res.error) {
      setError(res.error);
      return;
    }
    setName("");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="flex max-w-sm gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New category name (e.g. Dairy)"
        required
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Add</button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { api } from "@/api/client";
import { useAuth } from "@/context/AuthContext";

export function WishlistButton({ productId, initial }: { productId: number; initial: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState(initial);
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        if (!user) {
          navigate("/login");
          return;
        }
        setPending(true);
        api
          .post<{ added: boolean }>("/api/wishlist/toggle", { productId })
          .then((res) => setActive(res.added))
          .catch(() => undefined)
          .finally(() => setPending(false));
      }}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
        active
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:text-red-500"
      }`}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-red-500 text-red-500" : ""}`} />
      {active ? "In Wishlist" : "Save"}
    </button>
  );
}
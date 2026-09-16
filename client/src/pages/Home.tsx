import { Link, useNavigate } from "react-router-dom";
import { Search, Truck, Wallet, BadgePercent } from "lucide-react";
import type { FormEvent } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Spinner, ErrorBox } from "@/components/Feedback";
import { placeholderImage } from "@/lib/format";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/api/client";
import type { HomeSections } from "@/types";

export default function Home() {
  const navigate = useNavigate();
  const { data, error, loading } = useAsync<HomeSections>(() => api.get("/api/home"), []);

  if (loading) return <Spinner label="Loading store..." />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <ErrorBox message={error ?? "Failed to load store."} />
      </div>
    );
  }

  const { categories, deals, bestSellers, combos } = data;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
    navigate(v ? `/search?q=${encodeURIComponent(v)}` : "/search");
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            घरमै किराना, पसलभन्दा सस्तो मूल्यमा।
          </h1>
          <p className="mt-2 text-emerald-100">
            Buy groceries online in Birgunj — lower prices than your local shop, delivered same day.
          </p>
          <form onSubmit={onSubmit} className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5">
            <Search className="ml-3 h-5 w-5 text-gray-400" />
            <input
              name="q"
              placeholder="Search rice, dal, oil, sugar..."
              className="w-full bg-transparent text-gray-800 outline-none"
            />
            <button className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white" type="submit">
              Search
            </button>
          </form>

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
              <Truck className="h-6 w-6 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Fast Delivery</p>
                <p className="text-emerald-100">Same / next day in Birgunj. Free above Rs. 5,000</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
              <BadgePercent className="h-6 w-6 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Lower Prices</p>
                <p className="text-emerald-100">See MRP, our price &amp; what you save</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
              <Wallet className="h-6 w-6 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">COD + QR</p>
                <p className="text-emerald-100">Cash on delivery or eSewa / Khalti</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Shop by Category</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 text-center hover:shadow-md"
            >
              <img
                src={c.image || placeholderImage(c.name, i)}
                alt={c.name}
                className="h-14 w-14 rounded-full object-cover"
              />
              <span className="text-xs font-medium text-gray-700">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center text-sm font-medium text-emerald-900">
          🚚 Free delivery on orders above Rs. 5,000 within Birgunj — cash on delivery available.
        </div>
      </section>

      <Section title="Today's Deals" href="/search?deals=1">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      <Section title="Best Sellers" href="/search?sort=popular">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      <Section title="Combo & Featured Offers" href="/search">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {combos.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <Link to={href} className="text-sm font-semibold text-emerald-700 hover:underline">
          View all →
        </Link>
      </div>
      {children}
    </section>
  );
}

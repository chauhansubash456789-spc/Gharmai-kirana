import { Link, useNavigate } from "react-router-dom";
import { Search, Truck, Wallet, BadgePercent } from "lucide-react";
import type { FormEvent } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Spinner, ErrorBox } from "@/components/Feedback";
import { placeholderImage, formatNPR } from "@/lib/format";
import { useAsync } from "@/hooks/useAsync";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import { api } from "@/api/client";
import type { HomeSections } from "@/types";

export default function Home() {
  const navigate = useNavigate();
  const { freeDeliveryThreshold } = useStoreConfig();
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
    <div className="bg-[#FDFBF7] min-h-screen">
      <section className="bg-gradient-to-b from-[#F29C1B] via-[#F29C1B] to-[#EDA025] text-black">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/10 backdrop-blur-md text-black text-xs font-bold uppercase tracking-wider mb-3.5 border border-black/10">
            <Truck className="h-3.5 w-3.5" /> Birgunj Doorstep Delivery
          </span>
          <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight font-serif text-black">
            घरमै किराना, पसलभन्दा सस्तो मूल्यमा।
          </h1>
          <p className="mt-3 text-black/80 max-w-2xl mx-auto text-sm sm:text-base font-sans font-medium">
            Buy fresh groceries online in Birgunj — lower prices than local shops, delivered same day to your doorstep.
          </p>
          <form onSubmit={onSubmit} className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-xl bg-white p-1.5 shadow-artisanal border border-[#EAE5D9]">
            <Search className="ml-3 h-5 w-5 text-[#8E887E]" />
            <input
              name="q"
              placeholder="Search rice, dal, mustard oil, spices... / चामल, दाल खोज्नुहोस्"
              className="w-full bg-transparent text-[#222222] outline-none text-sm placeholder:text-[#8E887E]"
            />
            <button className="rounded-xl bg-[#000000] hover:bg-[#222222] px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-all" type="submit">
              Search
            </button>
          </form>

          {/* Hero Banner Visual */}
          <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-xl shadow-artisanal border border-black/10">
            <img
              src="/hero-web-landscape.jpg"
              alt="Gharmai Kirana Fresh Groceries Delivered to Doorstep"
              className="w-full h-auto object-cover max-h-[360px]"
            />
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl bg-black/8 backdrop-blur-xs px-4 py-3 border border-black/10">
              <Truck className="h-6 w-6 shrink-0 text-black" />
              <div className="text-sm">
                <p className="font-bold text-black">Fast Delivery</p>
                <p className="text-black/75 text-xs font-medium">Same day in Birgunj • Free above {formatNPR(freeDeliveryThreshold)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-black/8 backdrop-blur-xs px-4 py-3 border border-black/10">
              <BadgePercent className="h-6 w-6 shrink-0 text-black" />
              <div className="text-sm">
                <p className="font-bold text-black">Lower Prices</p>
                <p className="text-black/75 text-xs font-medium">See MRP, our price &amp; what you save</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-black/8 backdrop-blur-xs px-4 py-3 border border-black/10">
              <Wallet className="h-6 w-6 shrink-0 text-black" />
              <div className="text-sm">
                <p className="font-bold text-black">COD + QR</p>
                <p className="text-black/75 text-xs font-medium">Cash on delivery or eSewa / Khalti</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <h2 className="mb-5 text-2xl font-bold font-serif text-[#222222] tracking-tight">Shop by Category</h2>
        <div className="grid grid-cols-3 gap-3.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl border border-[#EAE5D9] bg-white p-3 text-center shadow-artisanal hover:shadow-artisanal-hover hover:border-[#F29C1B]/50 transition-all"
            >
              <img
                src={c.image || placeholderImage(c.name, i)}
                alt={c.name}
                className="h-14 w-14 rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <span className="text-xs font-semibold text-[#222222] group-hover:text-[#2C5E3B] transition-colors">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="rounded-xl border border-[#FCE4B8] bg-[#FEF7EC] px-5 py-4 text-center text-sm font-bold text-[#D98510] shadow-xs">
          🚚 Free delivery on orders above {formatNPR(freeDeliveryThreshold)} within Birgunj — cash on delivery available.
        </div>
      </section>

      <Section title="Today's Deals" href="/search?deals=1">
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      <Section title="Best Sellers" href="/search?sort=popular">
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>

      <Section title="Combo & Featured Offers" href="/search">
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
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
    <section className="mx-auto max-w-6xl px-4 pt-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold font-serif text-[#222222] tracking-tight">{title}</h2>
        <Link to={href} className="text-sm font-semibold text-[#D98510] hover:text-[#C77908] hover:underline transition-colors">
          View all →
        </Link>
      </div>
      {children}
    </section>
  );
}

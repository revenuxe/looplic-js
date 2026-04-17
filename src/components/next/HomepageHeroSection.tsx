"use client";

import { ArrowRight, ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { HomeBrand } from "@/src/lib/data/home";
import { buildBrandRoute } from "@/src/lib/routes";

const stats = [
  { value: "2000+", label: "Installs" },
  { value: "4.8+", label: "Rating" },
  { value: "30min", label: "Service" },
];

export function HomepageHeroSection({ brands }: { brands: HomeBrand[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  return (
    <section className="relative overflow-hidden pb-6 pt-8 md:pb-20 md:pt-16">
      <div className="absolute inset-0 gradient-hero-bg" />
      <div className="absolute right-0 top-0 h-80 w-80 rounded-full gradient-brand opacity-[0.06] blur-[100px]" />
      <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full gradient-brand opacity-[0.04] blur-[80px]" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="px-4 text-[26px] font-extrabold leading-[1.15] tracking-tight text-foreground md:text-5xl">
            Get Screen Guard <span className="mt-1 block gradient-brand-text">Installed at Your Door</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            Find model, choose guard, and book a technician in under a minute.
          </p>

          <div className="relative mt-6 px-1">
            <div className="flex items-center rounded-2xl border-2 border-transparent bg-card shadow-card-brand transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-search">
              <Search className="ml-3.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search your phone model..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent px-3 py-3.5 text-[13px] font-semibold text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => router.push("/brands")}
                className="mr-1.5 flex-shrink-0 rounded-xl gradient-brand p-2.5 transition-transform active:scale-95"
                aria-label="Browse brands"
              >
                <ArrowRight className="h-4 w-4 text-primary-foreground" />
              </button>
            </div>
            {query.trim().length > 1 ? (
              <div className="absolute left-1 right-1 mt-2 rounded-xl border border-border bg-card p-4 text-left shadow-elevated-brand">
                <p className="text-[13px] font-semibold text-foreground">Search results will be enabled in the next migration step.</p>
                <p className="mt-1 text-[11px] text-muted-foreground">For now, use the brand explorer to browse devices and services.</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-md">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-xs font-bold text-muted-foreground">- Pick a brand for your phone -</p>
            <Link href="/brands" className="flex items-center gap-0.5 text-[10px] font-bold text-primary">
              All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={buildBrandRoute(brand.slug)}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-2 py-3 shadow-card-brand transition-all hover:border-primary/30 hover:shadow-elevated-brand active:scale-95"
              >
                {brand.image_url ? (
                  <Image
                    src={brand.image_url}
                    alt={brand.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-xl object-contain"
                  />
                ) : (
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${brand.gradient}`}>
                    <span className="text-xs font-extrabold text-primary-foreground">{brand.letter}</span>
                  </div>
                )}
                <span className="text-[10px] font-bold text-foreground">{brand.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-xs">
          <div className="flex items-center justify-around rounded-2xl border border-border bg-card/80 px-3 py-3.5 shadow-card-brand backdrop-blur-sm">
            {stats.map((stat, index) => (
              <div key={stat.label} className="relative flex-1 text-center">
                <div className="text-base font-extrabold leading-none gradient-brand-text">{stat.value}</div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                {index < stats.length - 1 ? <div className="absolute right-0 top-1/2 h-6 w-px -translate-y-1/2 bg-border" /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

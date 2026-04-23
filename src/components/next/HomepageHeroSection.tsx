"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { DeviceSearchBox } from "@/src/components/next/DeviceSearchBox";
import type { CatalogBrand, SearchModel, SearchSeries } from "@/src/lib/data/catalog";
import type { HomeBrand } from "@/src/lib/data/home";
import { buildBrandRoute } from "@/src/lib/routes";

const stats = [
  { value: "2000+", label: "Installs" },
  { value: "4.8+", label: "Rating" },
  { value: "30min", label: "Service" },
];

export function HomepageHeroSection({
  brands,
  searchBrands,
  searchSeries,
  searchModels,
}: {
  brands: HomeBrand[];
  searchBrands: CatalogBrand[];
  searchSeries: SearchSeries[];
  searchModels: SearchModel[];
}) {
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

          <DeviceSearchBox
            placeholder="Search your phone model..."
            browseHref="/brands"
            brands={searchBrands}
            series={searchSeries}
            models={searchModels}
            mode="screen-guard"
          />
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

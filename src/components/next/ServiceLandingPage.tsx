"use client";

import { ChevronRight, Laptop, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { DeviceSearchBox } from "@/src/components/next/DeviceSearchBox";
import type { CatalogBrand, SearchModel, SearchSeries } from "@/src/lib/data/catalog";

type ServiceLandingPageProps = {
  serviceType: "mobile-repair" | "laptop-repair";
  brands: CatalogBrand[];
  searchSeries: SearchSeries[];
  searchModels: SearchModel[];
};

const serviceConfig = {
  "mobile-repair": {
    title: "Mobile Repair",
    subtitle: "Expert mobile repair service at your location",
    searchPlaceholder: "Search your phone model...",
    brandLabel: "Pick a mobile brand",
    allHref: "/service/mobile-repair/brands",
    color: "from-orange-500 to-red-500",
    icon: Smartphone,
  },
  "laptop-repair": {
    title: "Laptop Repair",
    subtitle: "Professional laptop repair at your doorstep",
    searchPlaceholder: "Search your laptop model...",
    brandLabel: "Pick a laptop brand",
    allHref: "/service/laptop-repair/brands",
    color: "from-violet-500 to-purple-600",
    icon: Laptop,
  },
} as const;

const stats = [
  { value: "2000+", label: "Installs" },
  { value: "4.8+", label: "Rating" },
  { value: "30min", label: "Service" },
];

export function ServiceLandingPage({ serviceType, brands, searchSeries, searchModels }: ServiceLandingPageProps) {
  const config = serviceConfig[serviceType];

  const heroBrands = brands.slice(0, 6);
  const moreBrands = brands.slice(6);

  const Icon = config.icon;

  return (
    <>
      <section className="relative overflow-hidden pb-6 pt-8 md:pb-20 md:pt-16">
        <div className="absolute inset-0 gradient-hero-bg" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full gradient-brand opacity-[0.06] blur-[100px]" />

        <div className="container relative z-10">
          <div className="mx-auto max-w-lg text-center">
            <h1 className="px-4 text-[26px] font-extrabold leading-[1.15] tracking-tight text-foreground md:text-5xl">
              {config.title} <span className="mt-1 block gradient-brand-text">{config.subtitle.split(" ").slice(-4).join(" ")}</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xs text-[13px] leading-relaxed text-muted-foreground">{config.subtitle}</p>

            <DeviceSearchBox
              placeholder={config.searchPlaceholder}
              browseHref={config.allHref}
              brands={brands}
              series={searchSeries}
              models={searchModels}
              mode={serviceType}
            />
          </div>

          <div className="mx-auto mt-8 max-w-md">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-xs font-bold text-muted-foreground">- {config.brandLabel} -</p>
              <Link href={config.allHref} className="flex items-center gap-0.5 text-[10px] font-bold text-primary">
                All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {heroBrands.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {heroBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/service/${serviceType}/brands/${brand.slug}`}
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
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No brands available yet</p>
            )}
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

      {moreBrands.length > 0 ? (
        <section className="py-10">
          <div className="container">
            <h2 className="mb-5 text-lg font-extrabold text-foreground">More Brands</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {moreBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/service/${serviceType}/brands/${brand.slug}`}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-card-brand transition-all hover:border-primary/30 hover:shadow-elevated-brand active:scale-95"
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
                      <span className="text-sm font-bold text-primary-foreground">{brand.letter}</span>
                    </div>
                  )}
                  <span className="text-center text-xs font-bold text-foreground">{brand.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container pb-10">
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card-brand">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${config.color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-foreground">{config.title} at Your Doorstep</h2>
              <p className="text-sm text-muted-foreground">Browse by brand, choose your device, and continue into the dedicated booking flow.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

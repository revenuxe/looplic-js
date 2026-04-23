"use client";

import { ArrowRight, ChevronRight, Laptop, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CatalogPrefetchLink } from "@/src/components/next/CatalogPrefetchLink";
import type { CatalogBrand, CatalogSeries } from "@/src/lib/data/catalog";

type SeriesCatalogPageProps = {
  brand: CatalogBrand;
  seriesList: CatalogSeries[];
  brandsPath: string;
  seriesPathPrefix: string;
  serviceLabel: string;
};

export function SeriesCatalogPage({
  brand,
  seriesList,
  brandsPath,
  seriesPathPrefix,
  serviceLabel,
}: SeriesCatalogPageProps) {
  const DeviceIcon = brand.service_type === "laptop" ? Laptop : Smartphone;
  const deviceLabel = brand.service_type === "laptop" ? "Laptop" : "Phone";
  const [search, setSearch] = useState("");

  const filteredSeries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return seriesList;
    }

    return seriesList.filter((series) => series.name.toLowerCase().includes(query));
  }, [search, seriesList]);

  return (
    <main className="flex-1">
      <div className="container py-6">
        <div className="mb-5 flex flex-wrap items-center gap-1 text-xs font-semibold text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={brandsPath} className="transition-colors hover:text-foreground">
            Brands
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{brand.name}</span>
        </div>

        <div className="mb-6 flex items-center gap-4">
          {brand.image_url ? (
            <Image
              src={brand.image_url}
              alt={`${brand.name} logo`}
              width={64}
              height={64}
              className="h-16 w-16 rounded-2xl border border-border object-contain shadow-card-brand"
            />
          ) : (
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${brand.gradient} shadow-sm`}>
              <span className="text-xl font-extrabold text-primary-foreground">{brand.letter}</span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-foreground md:text-4xl">{brand.name} {deviceLabel} Series</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Select your {brand.name} series to find screen guards and {serviceLabel.toLowerCase()} services
            </p>
          </div>
        </div>

        <div className="relative mb-6 max-w-sm">
          <input
            type="text"
            placeholder={`Search ${brand.name} series...`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {filteredSeries.length === 0 ? (
          <div className="py-16 text-center">
            <DeviceIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-semibold text-muted-foreground">
              {search ? `No ${brand.name} series match your search` : `No series available for ${brand.name}`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{search ? "Try a different series name." : "Check back soon!"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filteredSeries.map((series) => (
              <CatalogPrefetchLink
                key={series.id}
                href={`${seriesPathPrefix}/${series.slug}`}
                eagerPrefetch={!search}
                className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card-brand transition-all hover:border-primary/30 hover:shadow-elevated-brand active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                    <DeviceIcon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground">{series.name}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </CatalogPrefetchLink>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

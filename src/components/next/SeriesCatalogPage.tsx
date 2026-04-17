import { ArrowRight, ChevronRight, Laptop, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

        {seriesList.length === 0 ? (
          <div className="py-16 text-center">
            <DeviceIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-semibold text-muted-foreground">No series available for {brand.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {seriesList.map((series) => (
              <Link
                key={series.id}
                href={`${seriesPathPrefix}/${series.slug}`}
                className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card-brand transition-all hover:border-primary/30 hover:shadow-elevated-brand active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                    <DeviceIcon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground">{series.name}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

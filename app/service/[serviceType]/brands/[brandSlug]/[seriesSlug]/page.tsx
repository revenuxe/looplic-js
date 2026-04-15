import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogNavbar } from "@/src/components/next/CatalogNavbar";
import { CatalogServiceTabs } from "@/src/components/next/CatalogServiceTabs";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";
import { ModelsCatalogPage } from "@/src/components/next/ModelsCatalogPage";
import { getBrandBySlug, getModelsForSeries, getSeriesBySlug } from "@/src/lib/data/catalog";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    serviceType: string;
    brandSlug: string;
    seriesSlug: string;
  }>;
};

const serviceMap = {
  "mobile-repair": {
    listingType: "mobile" as const,
    label: "Mobile Repair",
    activeTab: "mobile-repair" as const,
  },
  "laptop-repair": {
    listingType: "laptop" as const,
    label: "Laptop Repair",
    activeTab: "laptop-repair" as const,
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { serviceType, brandSlug, seriesSlug } = await params;
  const config = serviceMap[serviceType as keyof typeof serviceMap];

  if (!config) {
    return {
      title: "Service Series Detail",
    };
  }

  const brand = await getBrandBySlug(brandSlug, config.listingType);
  if (!brand) {
    return {
      title: "Service Series Detail",
    };
  }

  const series = await getSeriesBySlug(brand.id, seriesSlug);
  if (!series) {
    return {
      title: `${brand.name} Series`,
    };
  }

  return {
    title: `${brand.name} ${series.name} ${config.label}`,
    description: `Browse all ${brand.name} ${series.name} models supported for ${config.label.toLowerCase()} and continue into dedicated booking pages.`,
  };
}

export default async function ServiceSeriesPage({ params }: PageProps) {
  const { serviceType, brandSlug, seriesSlug } = await params;
  const config = serviceMap[serviceType as keyof typeof serviceMap];

  if (!config) {
    notFound();
  }

  const brand = await getBrandBySlug(brandSlug, config.listingType);
  if (!brand) {
    notFound();
  }

  const series = await getSeriesBySlug(brand.id, seriesSlug);
  if (!series) {
    notFound();
  }

  const models = await getModelsForSeries(series.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CatalogNavbar />
      <CatalogServiceTabs active={config.activeTab} />
      <ModelsCatalogPage
        brand={brand}
        series={series}
        models={models}
        brandsPath={`/service/${serviceType}/brands`}
        seriesPath={`/service/${serviceType}/brands/${brand.slug}`}
        modelPathPrefix={`/service/${serviceType}/book/${brand.slug}/${series.slug}`}
        serviceLabel={config.label}
      />
      <HomepageFooter />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogNavbar } from "@/src/components/next/CatalogNavbar";
import { CatalogServiceTabs } from "@/src/components/next/CatalogServiceTabs";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";
import { SeriesCatalogPage } from "@/src/components/next/SeriesCatalogPage";
import { getBrandBySlug, getSeriesForBrand } from "@/src/lib/data/catalog";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    serviceType: string;
    brandSlug: string;
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
  const { serviceType, brandSlug } = await params;
  const config = serviceMap[serviceType as keyof typeof serviceMap];

  if (!config) {
    return {
      title: "Service Brand Detail",
    };
  }

  const brand = await getBrandBySlug(brandSlug, config.listingType);

  if (!brand) {
    return {
      title: "Service Brand Detail",
    };
  }

  return {
    title: `${brand.name} ${config.label}`,
    description: `Browse all ${brand.name} series supported for ${config.label.toLowerCase()} and continue into dedicated SEO-friendly device pages.`,
  };
}

export default async function ServiceBrandPage({ params }: PageProps) {
  const { serviceType, brandSlug } = await params;
  const config = serviceMap[serviceType as keyof typeof serviceMap];

  if (!config) {
    notFound();
  }

  const brand = await getBrandBySlug(brandSlug, config.listingType);

  if (!brand) {
    notFound();
  }

  const seriesList = await getSeriesForBrand(brand.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CatalogNavbar />
      <CatalogServiceTabs active={config.activeTab} />
      <SeriesCatalogPage
        brand={brand}
        seriesList={seriesList}
        brandsPath={`/service/${serviceType}/brands`}
        seriesPathPrefix={`/service/${serviceType}/brands/${brand.slug}`}
        serviceLabel={config.label}
      />
      <HomepageFooter />
    </div>
  );
}

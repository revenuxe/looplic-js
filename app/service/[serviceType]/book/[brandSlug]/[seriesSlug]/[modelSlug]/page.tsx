import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingPageShell } from "@/src/components/next/BookingPageShell";
import { CATALOG_REVALIDATE_SECONDS } from "@/src/lib/data/catalog";
import { getRepairCatalogData, resolveModelPageData } from "@/src/lib/data/catalog-page";

export const revalidate = CATALOG_REVALIDATE_SECONDS;

type PageProps = {
  params: Promise<{
    serviceType: string;
    brandSlug: string;
    seriesSlug: string;
    modelSlug: string;
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
  const { serviceType, brandSlug, seriesSlug, modelSlug } = await params;
  const config = serviceMap[serviceType as keyof typeof serviceMap];

  if (!config) {
    return { title: "Service Booking" };
  }

  const { brand, series, model } = await resolveModelPageData(brandSlug, seriesSlug, modelSlug, config.listingType);
  if (!brand) {
    return { title: "Service Booking" };
  }
  if (!series) {
    return { title: `${brand.name} Booking` };
  }
  if (!model) {
    return { title: `${brand.name} ${series.name}` };
  }

  return {
    title: `${brand.name} ${model.name} ${config.label}`,
    description: `Choose a ${config.label.toLowerCase()} service and book doorstep support for ${brand.name} ${model.name}.`,
  };
}

export default async function ServiceBookingPage({ params }: PageProps) {
  const { serviceType, brandSlug, seriesSlug, modelSlug } = await params;
  const config = serviceMap[serviceType as keyof typeof serviceMap];

  if (!config) {
    notFound();
  }

  const { brand, series, model } = await resolveModelPageData(brandSlug, seriesSlug, modelSlug, config.listingType);
  if (!brand) {
    notFound();
  }
  if (!series) {
    notFound();
  }
  if (!model) {
    notFound();
  }
  const { repairCategories, repairSubcategories } = await getRepairCatalogData(config.listingType);

  return (
    <BookingPageShell
      brand={brand}
      series={series}
      model={model}
      activeTab={config.activeTab}
      basePath={`/service/${serviceType}`}
      isRepair
      repairServiceType={config.listingType}
      repairCategories={repairCategories}
      repairSubcategories={repairSubcategories}
    />
  );
}

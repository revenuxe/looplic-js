import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingPageShell } from "@/src/components/next/BookingPageShell";
import {
  getBrandBySlug,
  getModelBySlug,
  getRepairCategories,
  getRepairSubcategories,
  getSeriesBySlug,
} from "@/src/lib/data/catalog";

export const revalidate = 300;

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

  const brand = await getBrandBySlug(brandSlug, config.listingType);
  if (!brand) {
    return { title: "Service Booking" };
  }

  const series = await getSeriesBySlug(brand.id, seriesSlug);
  if (!series) {
    return { title: `${brand.name} Booking` };
  }

  const model = await getModelBySlug(series.id, modelSlug);
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

  const brand = await getBrandBySlug(brandSlug, config.listingType);
  if (!brand) {
    notFound();
  }

  const series = await getSeriesBySlug(brand.id, seriesSlug);
  if (!series) {
    notFound();
  }

  const model = await getModelBySlug(series.id, modelSlug);
  if (!model) {
    notFound();
  }

  const repairCategories = await getRepairCategories(config.listingType);
  const repairSubcategories = await getRepairSubcategories(repairCategories.map((category) => category.id));

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

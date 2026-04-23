import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingPageShell } from "@/src/components/next/BookingPageShell";
import { CATALOG_REVALIDATE_SECONDS, getModelScreenGuards } from "@/src/lib/data/catalog";
import { resolveModelPageData } from "@/src/lib/data/catalog-page";

export const revalidate = CATALOG_REVALIDATE_SECONDS;

type PageProps = {
  params: Promise<{
    brandSlug: string;
    seriesSlug: string;
    modelSlug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brandSlug, seriesSlug, modelSlug } = await params;
  const { brand, series, model } = await resolveModelPageData(brandSlug, seriesSlug, modelSlug, "mobile");

  if (!brand) {
    return { title: "Model Booking" };
  }
  if (!series) {
    return { title: `${brand.name} Booking` };
  }
  if (!model) {
    return { title: `${brand.name} ${series.name}` };
  }

  return {
    title: `${brand.name} ${model.name} Screen Guard`,
    description: `Choose a screen guard and book doorstep installation for ${brand.name} ${model.name}.`,
  };
}

export default async function ModelPage({ params }: PageProps) {
  const { brandSlug, seriesSlug, modelSlug } = await params;
  const { brand, series, model } = await resolveModelPageData(brandSlug, seriesSlug, modelSlug, "mobile");

  if (!brand) {
    notFound();
  }
  if (!series) {
    notFound();
  }
  if (!model) {
    notFound();
  }

  const guards = await getModelScreenGuards(model.id);

  return (
    <BookingPageShell
      brand={brand}
      series={series}
      model={model}
      activeTab="screen-guard"
      basePath=""
      isRepair={false}
      guards={guards}
    />
  );
}

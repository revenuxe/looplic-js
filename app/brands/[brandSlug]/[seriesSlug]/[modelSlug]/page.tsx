import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingPageShell } from "@/src/components/next/BookingPageShell";
import { getBrandBySlug, getModelBySlug, getModelScreenGuards, getSeriesBySlug } from "@/src/lib/data/catalog";

export const revalidate = 300;

type PageProps = {
  params: Promise<{
    brandSlug: string;
    seriesSlug: string;
    modelSlug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brandSlug, seriesSlug, modelSlug } = await params;
  const brand = await getBrandBySlug(brandSlug, "mobile");

  if (!brand) {
    return { title: "Model Booking" };
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
    title: `${brand.name} ${model.name} Screen Guard`,
    description: `Choose a screen guard and book doorstep installation for ${brand.name} ${model.name}.`,
  };
}

export default async function ModelPage({ params }: PageProps) {
  const { brandSlug, seriesSlug, modelSlug } = await params;
  const brand = await getBrandBySlug(brandSlug, "mobile");

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

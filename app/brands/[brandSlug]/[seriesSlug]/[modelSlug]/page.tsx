import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookingPageShell } from "@/src/components/next/BookingPageShell";
import { getModelScreenGuards } from "@/src/lib/data/catalog";
import { resolveModelPageData } from "@/src/lib/data/catalog-page";
import { buildPageMetadata } from "@/src/lib/metadata";

export const revalidate = 300;
export const dynamic = "force-dynamic";

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

  return buildPageMetadata({
    title: `${brand.name} ${model.name} Screen Guard Installation`,
    description: `Choose tempered glass or screen guard options and book doorstep installation for ${brand.name} ${model.name}.`,
    pathname: `/brands/${brand.slug}/${series.slug}/${model.slug}`,
    keywords: [
      `${brand.name} ${model.name} screen guard`,
      `${brand.name} ${model.name} tempered glass`,
      `${brand.name} ${model.name} installation`,
    ],
  });
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

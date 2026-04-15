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
    brandSlug: string;
    seriesSlug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brandSlug, seriesSlug } = await params;
  const brand = await getBrandBySlug(brandSlug, "mobile");

  if (!brand) {
    return {
      title: "Series Detail",
    };
  }

  const series = await getSeriesBySlug(brand.id, seriesSlug);

  if (!series) {
    return {
      title: `${brand.name} Series`,
    };
  }

  return {
    title: `${brand.name} ${series.name} Models`,
    description: `Browse all ${brand.name} ${series.name} models for screen guard installation and dedicated booking pages.`,
  };
}

export default async function SeriesPage({ params }: PageProps) {
  const { brandSlug, seriesSlug } = await params;
  const brand = await getBrandBySlug(brandSlug, "mobile");

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
      <CatalogServiceTabs active="screen-guard" />
      <ModelsCatalogPage
        brand={brand}
        series={series}
        models={models}
        brandsPath="/brands"
        seriesPath={`/brands/${brand.slug}`}
        modelPathPrefix={`/brands/${brand.slug}/${series.slug}`}
        serviceLabel="Screen Guard"
      />
      <HomepageFooter />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogNavbar } from "@/src/components/next/CatalogNavbar";
import { CatalogServiceTabs } from "@/src/components/next/CatalogServiceTabs";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";
import { ModelsCatalogPage } from "@/src/components/next/ModelsCatalogPage";
import { getModelsForSeries } from "@/src/lib/data/catalog";
import { resolveSeriesPageData } from "@/src/lib/data/catalog-page";
import { buildPageMetadata } from "@/src/lib/metadata";

export const revalidate = 300;

type PageProps = {
  params: Promise<{
    brandSlug: string;
    seriesSlug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brandSlug, seriesSlug } = await params;
  const { brand, series } = await resolveSeriesPageData(brandSlug, seriesSlug, "mobile");

  if (!brand) {
    return {
      title: "Series Detail",
    };
  }

  if (!series) {
    return {
      title: `${brand.name} Series`,
    };
  }

  return buildPageMetadata({
    title: `${brand.name} ${series.name} Screen Guard Installation`,
    description: `Find all ${brand.name} ${series.name} models and book doorstep screen guard or tempered glass installation for your device.`,
    pathname: `/brands/${brand.slug}/${series.slug}`,
    keywords: [`${brand.name} ${series.name} screen guard`, `${brand.name} ${series.name} tempered glass`],
  });
}

export default async function SeriesPage({ params }: PageProps) {
  const { brandSlug, seriesSlug } = await params;
  const { brand, series } = await resolveSeriesPageData(brandSlug, seriesSlug, "mobile");

  if (!brand) {
    notFound();
  }

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

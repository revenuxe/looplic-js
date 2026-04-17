import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogNavbar } from "@/src/components/next/CatalogNavbar";
import { CatalogServiceTabs } from "@/src/components/next/CatalogServiceTabs";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";
import { SeriesCatalogPage } from "@/src/components/next/SeriesCatalogPage";
import { getBrandBySlug, getSeriesForBrand } from "@/src/lib/data/catalog";

export const revalidate = 300;

type PageProps = {
  params: Promise<{
    brandSlug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brandSlug } = await params;
  const brand = await getBrandBySlug(brandSlug, "mobile");

  if (!brand) {
    return {
      title: "Brand Detail",
    };
  }

  return {
    title: `${brand.name} Phone Series`,
    description: `Browse all ${brand.name} phone series for screen guard installation and model-level booking routes.`,
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { brandSlug } = await params;
  const brand = await getBrandBySlug(brandSlug, "mobile");

  if (!brand) {
    notFound();
  }

  const seriesList = await getSeriesForBrand(brand.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CatalogNavbar />
      <CatalogServiceTabs active="screen-guard" />
      <SeriesCatalogPage
        brand={brand}
        seriesList={seriesList}
        brandsPath="/brands"
        seriesPathPrefix={`/brands/${brand.slug}`}
        serviceLabel="Screen Guard"
      />
      <HomepageFooter />
    </div>
  );
}

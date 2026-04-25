import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomepageView } from "@/src/components/next/HomepageView";
import { getBrandsForListing, getCatalogSearchIndex } from "@/src/lib/data/catalog";
import { buildPageMetadata } from "@/src/lib/metadata";
import { bangaloreAreas, getBangaloreAreaBySlug } from "@/src/lib/service-areas";

export const revalidate = 300;
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    areaSlug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { areaSlug } = await params;
  const area = getBangaloreAreaBySlug(areaSlug);

  if (!area) {
    return {
      title: "Bangalore Service Area",
    };
  }

  return buildPageMetadata({
    title: `Tempered Glass Installation in ${area.name}, Bangalore`,
    description: `Book doorstep tempered glass installation, screen guard service, and repair pickup support in ${area.name}, Bangalore with Looplic.`,
    pathname: `/bangalore/${area.slug}`,
    keywords: [
      `${area.name} screen guard installation`,
      `${area.name} tempered glass service`,
      `${area.name} mobile repair pickup`,
      `${area.name} laptop repair pickup`,
    ],
  });
}

export default async function BangaloreAreaPage({ params }: PageProps) {
  const { areaSlug } = await params;
  const area = getBangaloreAreaBySlug(areaSlug);

  if (!area) {
    notFound();
  }

  const [brands, searchIndex] = await Promise.all([getBrandsForListing("mobile"), getCatalogSearchIndex("mobile")]);

  return (
    <HomepageView
      brands={brands}
      searchBrands={searchIndex.brands}
      searchSeries={searchIndex.series}
      searchModels={searchIndex.models}
      heroEyebrow={`${area.name} Bangalore Service`}
      heroTitle={`Tempered Glass Installed at Your Doorstep in ${area.name}, Bangalore`}
      heroDescription={`Book screen guard installation, tempered glass replacement, and quick doorstep device support in ${area.name}, Bangalore.`}
      heroBrowseHref="/brands"
      heroSearchPlaceholder={`Search your phone model in ${area.name}...`}
      currentAreaSlug={area.slug}
    />
  );
}

export function generateStaticParams() {
  return bangaloreAreas.map((area) => ({
    areaSlug: area.slug,
  }));
}

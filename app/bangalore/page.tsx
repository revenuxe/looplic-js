import type { Metadata } from "next";

import { HomepageView } from "@/src/components/next/HomepageView";
import { getBrandsForListing, getCatalogSearchIndex } from "@/src/lib/data/catalog";
import { buildPageMetadata } from "@/src/lib/metadata";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Tempered Glass Installation in Bangalore at Your Doorstep",
  description:
    "Book doorstep tempered glass and screen guard installation in Bangalore with quick phone model search, easy scheduling, and support from Looplic.",
  pathname: "/bangalore",
  keywords: ["tempered glass Bangalore", "screen guard installation Bangalore", "doorstep mobile service Bangalore"],
});

export default async function BangalorePage() {
  const [brands, searchIndex] = await Promise.all([getBrandsForListing("mobile"), getCatalogSearchIndex("mobile")]);

  return (
    <HomepageView
      brands={brands}
      searchBrands={searchIndex.brands}
      searchSeries={searchIndex.series}
      searchModels={searchIndex.models}
      heroEyebrow="Bangalore Screen Guard Service"
      heroTitle="Tempered Glass Installed at Your Doorstep in Bangalore"
      heroDescription="Screen Guard Installation Doorstep in Bangalore. Pick your model, choose your glass, and book a doorstep technician in minutes."
      heroBrowseHref="/brands"
      heroSearchPlaceholder="Search your phone model in Bangalore..."
    />
  );
}

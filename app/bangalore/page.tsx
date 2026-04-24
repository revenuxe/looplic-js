import type { Metadata } from "next";

import { HomepageView } from "@/src/components/next/HomepageView";
import { getBrandsForListing, getCatalogSearchIndex } from "@/src/lib/data/catalog";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tempered Glass Installed at Your Doorstep in Bangalore",
  description: "Screen guard installation doorstep in Bangalore with a fast model search, easy booking flow, and doorstep support.",
};

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

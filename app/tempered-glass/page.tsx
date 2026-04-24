import type { Metadata } from "next";

import { HomepageView } from "@/src/components/next/HomepageView";
import { getBrandsForListing, getCatalogSearchIndex } from "@/src/lib/data/catalog";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tempered Glass Installed at Your Doorstep",
  description: "Book tempered glass and screen guard installation at your doorstep with the same fast Looplic homepage flow.",
};

export default async function TemperedGlassPage() {
  const [brands, searchIndex] = await Promise.all([getBrandsForListing("mobile"), getCatalogSearchIndex("mobile")]);

  return (
    <HomepageView
      brands={brands}
      searchBrands={searchIndex.brands}
      searchSeries={searchIndex.series}
      searchModels={searchIndex.models}
      heroEyebrow="Tempered Glass Booking"
      heroTitle="Tempered Glass Installed at Your Doorstep"
      heroDescription="Book premium tempered glass and screen guard installation with the same fast homepage experience, clear pricing, and doorstep convenience."
      heroBrowseHref="/brands"
      heroSearchPlaceholder="Search your model for tempered glass..."
    />
  );
}

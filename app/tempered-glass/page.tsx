import type { Metadata } from "next";

import { HomepageView } from "@/src/components/next/HomepageView";
import { getBrandsForListing, getCatalogSearchIndex } from "@/src/lib/data/catalog";
import { buildPageMetadata } from "@/src/lib/metadata";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Tempered Glass Installation at Home",
  description:
    "Book premium tempered glass and screen guard installation at your doorstep with fast device lookup, easy booking, and clear service flow.",
  pathname: "/tempered-glass",
  keywords: ["tempered glass installation", "screen guard at home", "doorstep tempered glass booking"],
});

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

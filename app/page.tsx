import type { Metadata } from "next";

import { HomepageView } from "@/src/components/next/HomepageView";
import { getBrandsForListing, getCatalogSearchIndex } from "@/src/lib/data/catalog";
import { buildPageMetadata } from "@/src/lib/metadata";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Doorstep Screen Guard Installation for Mobile Phones",
  description:
    "Book tempered glass and screen guard installation at home for Apple, Samsung, OnePlus, Xiaomi, Google, and more with fast model search and doorstep service.",
  pathname: "/",
  keywords: [
    "doorstep screen guard installation",
    "tempered glass installation at home",
    "mobile screen guard booking",
    "phone tempered glass service",
    "Looplic",
  ],
});

export default async function HomePage() {
  const [brands, searchIndex] = await Promise.all([getBrandsForListing("mobile"), getCatalogSearchIndex("mobile")]);

  return <HomepageView brands={brands} searchBrands={searchIndex.brands} searchSeries={searchIndex.series} searchModels={searchIndex.models} />;
}

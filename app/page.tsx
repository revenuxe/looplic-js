import type { Metadata } from "next";

import { HomepageView } from "@/src/components/next/HomepageView";
import { getCatalogSearchIndex } from "@/src/lib/data/catalog";
import { getHomepageBrands } from "@/src/lib/data/home";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Doorstep Screen Guard Installation",
  description: "Premium screen guard installation at your doorstep for all major mobile brands.",
};

export default async function HomePage() {
  const [brands, searchIndex] = await Promise.all([getHomepageBrands(), getCatalogSearchIndex("mobile")]);

  return <HomepageView brands={brands} searchBrands={searchIndex.brands} searchSeries={searchIndex.series} searchModels={searchIndex.models} />;
}

import type { Metadata } from "next";

import { BrandsCatalogPage } from "@/src/components/next/BrandsCatalogPage";
import { CatalogNavbar } from "@/src/components/next/CatalogNavbar";
import { CatalogServiceTabs } from "@/src/components/next/CatalogServiceTabs";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";
import { getBrandsForListing } from "@/src/lib/data/catalog";
import { buildPageMetadata } from "@/src/lib/metadata";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Mobile Brands for Screen Guard Installation",
  description:
    "Browse all supported phone brands and find your device to book tempered glass and screen guard installation at your doorstep.",
  pathname: "/brands",
  keywords: ["mobile brands", "screen guard brands", "phone model search", "tempered glass booking"],
});

export default async function BrandsPage() {
  const brands = await getBrandsForListing("mobile");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CatalogNavbar />
      <CatalogServiceTabs active="screen-guard" />
      <BrandsCatalogPage
        brands={brands}
        serviceLabel="Screen Guard"
        servicePathPrefix="/brands"
        isScreenGuard
      />
      <HomepageFooter />
    </div>
  );
}

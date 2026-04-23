import type { Metadata } from "next";

import { BrandsCatalogPage } from "@/src/components/next/BrandsCatalogPage";
import { CatalogNavbar } from "@/src/components/next/CatalogNavbar";
import { CatalogServiceTabs } from "@/src/components/next/CatalogServiceTabs";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";
import { CATALOG_REVALIDATE_SECONDS, getBrandsForListing } from "@/src/lib/data/catalog";

export const revalidate = CATALOG_REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "All Mobile Brands",
  description: "Browse all supported phone brands for screen guard installation with dedicated SEO-ready routes.",
};

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

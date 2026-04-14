import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandsCatalogPage } from "@/src/components/next/BrandsCatalogPage";
import { CatalogNavbar } from "@/src/components/next/CatalogNavbar";
import { CatalogServiceTabs } from "@/src/components/next/CatalogServiceTabs";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";
import { getBrandsForListing } from "@/src/lib/data/catalog";

type PageProps = {
  params: Promise<{
    serviceType: string;
  }>;
};

const serviceMap = {
  "mobile-repair": {
    listingType: "mobile" as const,
    label: "Mobile Repair",
    activeTab: "mobile-repair" as const,
  },
  "laptop-repair": {
    listingType: "laptop" as const,
    label: "Laptop Repair",
    activeTab: "laptop-repair" as const,
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { serviceType } = await params;
  const config = serviceMap[serviceType as keyof typeof serviceMap];

  if (!config) {
    return {
      title: "Service Brands",
    };
  }

  return {
    title: `${config.label} Brands`,
    description: `Browse all brands supported for ${config.label.toLowerCase()} with server-rendered catalog pages.`,
  };
}

export default async function ServiceBrandsPage({ params }: PageProps) {
  const { serviceType } = await params;
  const config = serviceMap[serviceType as keyof typeof serviceMap];

  if (!config) {
    notFound();
  }

  const brands = await getBrandsForListing(config.listingType);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CatalogNavbar />
      <CatalogServiceTabs active={config.activeTab} />
      <BrandsCatalogPage
        brands={brands}
        serviceLabel={config.label}
        servicePathPrefix={`/service/${serviceType}/brands`}
        isScreenGuard={false}
      />
      <HomepageFooter />
    </div>
  );
}

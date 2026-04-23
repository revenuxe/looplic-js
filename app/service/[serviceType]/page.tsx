import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogNavbar } from "@/src/components/next/CatalogNavbar";
import { CatalogServiceTabs } from "@/src/components/next/CatalogServiceTabs";
import { HowItWorks } from "@/src/components/next/HowItWorks";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";
import { ServiceLandingPage } from "@/src/components/next/ServiceLandingPage";
import { TrustSignals } from "@/src/components/next/TrustSignals";
import { getBrandsForListing } from "@/src/lib/data/catalog";

export const revalidate = 300;

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
      title: "Service Landing",
    };
  }

  return {
    title: config.label,
    description: `Browse supported brands and start the ${config.label.toLowerCase()} booking flow with dedicated SSR landing pages.`,
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { serviceType } = await params;
  const config = serviceMap[serviceType as keyof typeof serviceMap];

  if (!config) {
    notFound();
  }

  const brands = await getBrandsForListing(config.listingType);

  return (
    <div className="min-h-screen bg-background">
      <CatalogNavbar />
      <CatalogServiceTabs active={config.activeTab} />
      <ServiceLandingPage serviceType={serviceType as "mobile-repair" | "laptop-repair"} brands={brands} />
      <HowItWorks />
      <TrustSignals />
      <HomepageFooter />
    </div>
  );
}

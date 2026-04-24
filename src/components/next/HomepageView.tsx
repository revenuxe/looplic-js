import { HowItWorks } from "@/src/components/next/HowItWorks";
import { HomepageBrandGrid } from "@/src/components/next/HomepageBrandGrid";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";
import { HomepageHeroSection } from "@/src/components/next/HomepageHeroSection";
import { HomepageNavbar } from "@/src/components/next/HomepageNavbar";
import { HomepageServiceTabs } from "@/src/components/next/HomepageServiceTabs";
import { ScreenGuardTypes } from "@/src/components/next/ScreenGuardTypes";
import { TrustSignals } from "@/src/components/next/TrustSignals";
import type { CatalogBrand, SearchModel, SearchSeries } from "@/src/lib/data/catalog";

export function HomepageView({
  brands,
  searchBrands,
  searchSeries,
  searchModels,
  heroTitle,
  heroDescription,
  heroEyebrow,
  heroBrowseHref,
  heroSearchPlaceholder,
}: {
  brands: CatalogBrand[];
  searchBrands: CatalogBrand[];
  searchSeries: SearchSeries[];
  searchModels: SearchModel[];
  heroTitle?: string;
  heroDescription?: string;
  heroEyebrow?: string;
  heroBrowseHref?: string;
  heroSearchPlaceholder?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <HomepageNavbar />
      <HomepageServiceTabs />
      <HomepageHeroSection
        brands={brands.slice(0, 6)}
        searchBrands={searchBrands}
        searchSeries={searchSeries}
        searchModels={searchModels}
        title={heroTitle}
        description={heroDescription}
        eyebrow={heroEyebrow}
        browseHref={heroBrowseHref}
        searchPlaceholder={heroSearchPlaceholder}
      />
      <HomepageBrandGrid brands={brands} />
      <ScreenGuardTypes />
      <HowItWorks />
      <TrustSignals />
      <HomepageFooter />
    </div>
  );
}

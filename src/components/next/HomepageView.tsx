import { HowItWorks } from "@/src/components/next/HowItWorks";
import { HomepageBrandGrid } from "@/src/components/next/HomepageBrandGrid";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";
import { HomepageHeroSection } from "@/src/components/next/HomepageHeroSection";
import { HomepageNavbar } from "@/src/components/next/HomepageNavbar";
import { HomepageServiceTabs } from "@/src/components/next/HomepageServiceTabs";
import { ScreenGuardTypes } from "@/src/components/next/ScreenGuardTypes";
import { TrustSignals } from "@/src/components/next/TrustSignals";
import type { CatalogBrand, SearchModel, SearchSeries } from "@/src/lib/data/catalog";
import type { HomeBrand } from "@/src/lib/data/home";

export function HomepageView({
  brands,
  searchBrands,
  searchSeries,
  searchModels,
}: {
  brands: HomeBrand[];
  searchBrands: CatalogBrand[];
  searchSeries: SearchSeries[];
  searchModels: SearchModel[];
}) {
  return (
    <div className="min-h-screen bg-background">
      <HomepageNavbar />
      <HomepageServiceTabs />
      <HomepageHeroSection brands={brands.slice(0, 6)} searchBrands={searchBrands} searchSeries={searchSeries} searchModels={searchModels} />
      <HomepageBrandGrid brands={brands} />
      <ScreenGuardTypes />
      <HowItWorks />
      <TrustSignals />
      <HomepageFooter />
    </div>
  );
}

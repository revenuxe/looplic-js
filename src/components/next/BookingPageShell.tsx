import type {
  CatalogBrand,
  CatalogModel,
  CatalogSeries,
  ModelScreenGuard,
  RepairCategory,
  RepairSubcategory,
} from "@/src/lib/data/catalog";

import { BookingStepFlow } from "@/src/components/next/BookingStepFlow";
import { CatalogNavbar } from "@/src/components/next/CatalogNavbar";
import { CatalogServiceTabs } from "@/src/components/next/CatalogServiceTabs";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";

type BookingPageShellProps = {
  brand: CatalogBrand;
  series: CatalogSeries;
  model: CatalogModel;
  activeTab: "screen-guard" | "mobile-repair" | "laptop-repair";
  basePath: string;
  isRepair: boolean;
  repairServiceType?: "mobile" | "laptop";
  guards?: ModelScreenGuard[];
  repairCategories?: RepairCategory[];
  repairSubcategories?: RepairSubcategory[];
};

export function BookingPageShell({
  brand,
  series,
  model,
  activeTab,
  basePath,
  isRepair,
  repairServiceType,
  guards = [],
  repairCategories = [],
  repairSubcategories = [],
}: BookingPageShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CatalogNavbar />
      <CatalogServiceTabs active={activeTab} />
      <BookingStepFlow
        brand={brand}
        series={series}
        model={model}
        basePath={basePath}
        isRepair={isRepair}
        repairServiceType={repairServiceType}
        guards={guards}
        repairCategories={repairCategories}
        repairSubcategories={repairSubcategories}
      />
      <HomepageFooter />
    </div>
  );
}

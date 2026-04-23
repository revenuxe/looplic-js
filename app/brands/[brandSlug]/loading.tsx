import { CatalogNavbar } from "@/src/components/next/CatalogNavbar";
import { CatalogServiceTabs } from "@/src/components/next/CatalogServiceTabs";
import { CatalogPageLoading } from "@/src/components/next/CatalogPageLoading";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CatalogNavbar />
      <CatalogServiceTabs active="screen-guard" />
      <CatalogPageLoading />
      <HomepageFooter />
    </div>
  );
}

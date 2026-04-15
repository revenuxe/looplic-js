import type { Metadata } from "next";

import { HomepageView } from "@/src/components/next/HomepageView";
import { getHomepageBrands } from "@/src/lib/data/home";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Doorstep Screen Guard Installation",
  description: "Premium screen guard installation at your doorstep for all major mobile brands.",
};

export default async function HomePage() {
  const brands = await getHomepageBrands();

  return <HomepageView brands={brands} />;
}

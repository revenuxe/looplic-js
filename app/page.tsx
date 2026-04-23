import type { Metadata } from "next";

import { HomepageView } from "@/src/components/next/HomepageView";
import { getHomepageBrands, HOME_REVALIDATE_SECONDS } from "@/src/lib/data/home";

export const revalidate = HOME_REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "Doorstep Screen Guard Installation",
  description: "Premium screen guard installation at your doorstep for all major mobile brands.",
};

export default async function HomePage() {
  const brands = await getHomepageBrands();

  return <HomepageView brands={brands} />;
}

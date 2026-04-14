import type { Metadata } from "next";

import { AccountPageClient } from "@/src/components/next/AccountPageClient";
import { CatalogNavbar } from "@/src/components/next/CatalogNavbar";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";

export const metadata: Metadata = {
  title: "My Account",
  description: "View and track your Looplic bookings.",
};

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CatalogNavbar />
      <AccountPageClient />
      <HomepageFooter />
    </div>
  );
}

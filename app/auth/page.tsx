import type { Metadata } from "next";

import { AuthPageClient } from "@/src/components/next/AuthPageClient";
import { CatalogNavbar } from "@/src/components/next/CatalogNavbar";
import { HomepageFooter } from "@/src/components/next/HomepageFooter";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in or create an account to track your Looplic bookings.",
};

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CatalogNavbar />
      <AuthPageClient />
      <HomepageFooter />
    </div>
  );
}

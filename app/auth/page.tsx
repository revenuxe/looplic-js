import type { Metadata } from "next";
import { Suspense } from "react";

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
      <Suspense
        fallback={
          <main className="flex flex-1 items-center justify-center p-4">
            <div className="text-sm text-muted-foreground">Loading account access...</div>
          </main>
        }
      >
        <AuthPageClient />
      </Suspense>
      <HomepageFooter />
    </div>
  );
}

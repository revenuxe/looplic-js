import type { Metadata } from "next";

import { siteConfig } from "@/src/lib/site";

export function buildMigrationMetadata(title: string, pathname: string): Metadata {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return {
    title,
    description: `${title} route scaffolded for the Looplic Next.js migration.`,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: `${title} route scaffolded for the Looplic Next.js migration.`,
      url: path,
      siteName: siteConfig.name,
      type: "website",
    },
  };
}

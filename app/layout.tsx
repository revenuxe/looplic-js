import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import "@/app/globals.css";
import { AppProviders } from "@/components/Providers";
import { siteConfig } from "@/src/lib/site";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Screen Guard Installation & Device Repair at Home",
    template: "%s | Looplic",
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  applicationName: siteConfig.name,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={nunito.variable}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

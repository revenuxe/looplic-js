import type { Metadata } from "next";
import { Nunito } from "next/font/google";

import "@/app/globals.css";
import { AppProviders } from "@/components/Providers";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.looplic.com"),
  title: {
    default: "Looplic",
    template: "%s | Looplic",
  },
  description: "Doorstep screen guard installation and repair booking platform for mobile and laptop devices.",
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

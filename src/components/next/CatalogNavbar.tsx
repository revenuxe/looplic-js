"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import logo from "@/assets/looplic-logo.webp";
import { AuthHeaderActions } from "@/src/components/next/AuthHeaderActions";

export function CatalogNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/">
          <img src={logo.src} alt="Looplic" className="h-8 md:h-7" />
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/brands" className="transition-colors hover:text-foreground">
            Brands
          </Link>
          <Link href="/bangalore" className="transition-colors hover:text-foreground">
            Bangalore
          </Link>
          <Link href="/tempered-glass" className="transition-colors hover:text-foreground">
            Tempered Glass
          </Link>
          <Link href="/service/mobile-repair" className="transition-colors hover:text-foreground">
            Repairs
          </Link>
          <Link href="/about-us" className="transition-colors hover:text-foreground">
            About
          </Link>
          <Link href="/contact-us" className="transition-colors hover:text-foreground">
            Contact
          </Link>
          <AuthHeaderActions />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <AuthHeaderActions mobile />
          <button onClick={() => setOpen((current) => !current)} className="p-2 text-foreground" aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="overflow-hidden border-b border-border bg-card md:hidden">
          <div className="container flex flex-col gap-3 py-4">
            <Link href="/brands" className="py-2 text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
              Brands
            </Link>
            <Link href="/bangalore" className="py-2 text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
              Bangalore
            </Link>
            <Link href="/tempered-glass" className="py-2 text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
              Tempered Glass
            </Link>
            <Link href="/service/mobile-repair" className="py-2 text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
              Repairs
            </Link>
            <Link href="/about-us" className="py-2 text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
              About
            </Link>
            <Link href="/contact-us" className="py-2 text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
              Contact
            </Link>
            <div className="mt-2">
              <AuthHeaderActions />
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

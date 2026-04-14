"use client";

import { Menu, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import logo from "@/assets/looplic-logo.webp";
import { AuthHeaderActions } from "@/src/components/next/AuthHeaderActions";

export function HomepageNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/">
          <img src={logo.src} alt="Looplic" className="h-8 md:h-7" />
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/brands" className="transition-colors hover:text-foreground">
            Services
          </Link>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How It Works
          </a>
          <a href="#contact" className="transition-colors hover:text-foreground">
            Contact
          </a>
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
              Services
            </Link>
            <a href="#how-it-works" className="py-2 text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
              How It Works
            </a>
            <a href="#contact" className="py-2 text-sm font-medium text-foreground" onClick={() => setOpen(false)}>
              Contact
            </a>
            <div className="mt-2">
              <AuthHeaderActions />
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

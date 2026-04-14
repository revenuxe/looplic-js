import { Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import logo from "@/assets/looplic-logo.webp";

export function HomepageFooter() {
  return (
    <footer id="contact" className="border-t border-border bg-card py-8">
      <div className="container">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <img src={logo.src} alt="Looplic" className="mx-auto mb-2 h-7" />
            <p className="text-[11px] text-muted-foreground">India's trusted doorstep screen guard service</p>
          </div>

          <div className="flex justify-center gap-6 text-xs font-semibold text-muted-foreground">
            <Link href="/brands" className="transition-colors hover:text-foreground">
              Services
            </Link>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How It Works
            </a>
            <a href="#contact" className="transition-colors hover:text-foreground">
              Contact
            </a>
            <Link href="/brands" className="transition-colors hover:text-foreground">
              FAQ
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <a href="tel:+919876543210" className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
              <Phone className="h-3 w-3" /> +91 98765 43210
            </a>
            <a href="mailto:hello@looplic.com" className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground">
              <Mail className="h-3 w-3" /> hello@looplic.com
            </a>
          </div>

          <div className="flex justify-center gap-3">
            {[Instagram, MessageCircle].map((Icon, index) => (
              <a
                key={index}
                href="#contact"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <div className="border-t border-border pt-4 text-center">
            <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} Looplic. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

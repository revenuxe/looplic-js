import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/looplic-logo.webp";
import { companyName, footerLinks, supportEmail, supportPhone, supportPhoneDisplay, whatsappUrl } from "@/src/lib/company";

export function HomepageFooter() {
  return (
    <footer id="contact" className="border-t border-border bg-card py-8">
      <div className="container max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8">
          <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr_0.9fr]">
            <div className="text-center md:text-left">
              <img src={logo.src} alt="Looplic" className="mx-auto mb-3 h-7 md:mx-0" />
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Fast doorstep support for screen guards and repair bookings, backed by clear policies, responsive help, and dependable customer care.
              </p>
            </div>

            <div className="text-center md:text-left">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Menu</div>
              <div className="mt-3 grid gap-2 text-sm font-semibold">
                <Link href="/" className="transition-colors hover:text-foreground">
                  Home
                </Link>
                <Link href="/brands" className="transition-colors hover:text-foreground">
                  Services
                </Link>
                {footerLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="text-center md:text-left">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Support</div>
              <div className="mt-3 flex flex-col gap-2">
                <a href={`tel:+91${supportPhone}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground md:justify-start">
                  <Phone className="h-4 w-4" /> {supportPhoneDisplay}
                </a>
                <a href={`mailto:${supportEmail}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground md:justify-start">
                  <Mail className="h-4 w-4" /> {supportEmail}
                </a>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 md:justify-start">
                  <Image src="/whatsapp.svg" alt="" width={16} height={16} className="h-4 w-4" aria-hidden="true" /> WhatsApp support
                </a>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-all hover:bg-emerald-100"
              aria-label="WhatsApp support"
            >
              <Image src="/whatsapp.svg" alt="" width={16} height={16} className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="border-t border-border pt-4 text-center">
            <p className="text-[10px] text-muted-foreground">Copyright {new Date().getFullYear()} {companyName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import { CheckCircle2, ShieldCheck, Sparkles, Users } from "lucide-react";

import { InfoPageLayout } from "@/src/components/next/InfoPageLayout";
import { companyName, supportEmail, supportPhoneDisplay } from "@/src/lib/company";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${companyName}, our doorstep service approach, and how we support customers with device care across bookings, support, and service quality.`,
};

const pillars = [
  {
    title: "Doorstep convenience",
    description: "We focus on making screen guard installation and repair booking simple, responsive, and easy to access without unnecessary friction.",
    icon: Sparkles,
  },
  {
    title: "Reliable support",
    description: "We aim to communicate clearly, confirm orders promptly, and help customers through booking, updates, and service-related questions.",
    icon: Users,
  },
  {
    title: "Trust and accountability",
    description: "We structure our platform, policies, and customer communications to keep expectations clear for customers and the company.",
    icon: ShieldCheck,
  },
] as const;

export default function AboutUsPage() {
  return (
    <InfoPageLayout
      eyebrow="Our Story"
      title={`${companyName} is built for straightforward doorstep device care.`}
      description="We designed Looplic to make it easier for customers to discover supported devices, place service bookings, and reach support with confidence. Our goal is to keep the experience fast, clear, and dependable from first click to follow-up."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <pillar.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-black tracking-tight text-foreground">{pillar.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-black tracking-tight text-foreground">What we do</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            "Support customers in browsing device brands, series, and models.",
            "Enable booking flows for screen guard installation and selected repair services.",
            "Provide contact channels for order assistance, support, and customer communication.",
            "Maintain policies covering privacy, platform use, service expectations, and customer responsibilities.",
          ].map((item) => (
            <div key={item} className="flex gap-3 rounded-xl border border-border/70 bg-background p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm leading-6 text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-black tracking-tight text-foreground">How we approach service quality</h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            We aim to present our services, supported devices, and booking options as clearly as possible. Availability, timing, pricing, and service scope can vary by device, location, and operational conditions, so we may confirm final details during the booking or support process.
          </p>
          <p>
            Our platform is built to help customers move quickly, but we also care about clarity. That means we maintain dedicated policy pages, visible support contact details, and structured communication pathways so customers know where to go when they need help.
          </p>
          <p>
            For support, partnership questions, or service-related assistance, customers can contact us directly at <strong>{supportEmail}</strong> or <strong>{supportPhoneDisplay}</strong>.
          </p>
        </div>
      </section>
    </InfoPageLayout>
  );
}

import type { Metadata } from "next";

import { InfoPageLayout } from "@/src/components/next/InfoPageLayout";
import { companyName, supportEmail, supportPhoneDisplay } from "@/src/lib/company";
import { buildPageMetadata } from "@/src/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms and Conditions",
  description: `Read the ${companyName} Terms and Conditions for platform use, bookings, cancellations, customer responsibilities, liability limits, and service policies.`,
  pathname: "/terms-and-conditions",
});

const sections = [
  {
    title: "1. Acceptance of terms",
    body: [
      "These Terms and Conditions govern your access to and use of the Looplic website, accounts, booking flows, support channels, and related services. By accessing or using the platform, you agree to be bound by these terms.",
      "If you do not agree with these terms, you should not use the platform or place bookings through it.",
    ],
  },
  {
    title: "2. Service scope",
    body: [
      "Looplic provides a platform for browsing supported device categories, placing bookings, and connecting customers with available screen guard and repair-related service workflows. Service availability may vary by device, inventory, location, timing, operational constraints, and internal review.",
      "We reserve the right to modify, suspend, refuse, limit, or discontinue any feature, route, listing, service category, or booking option at any time without liability where reasonably necessary for business, operational, or legal reasons.",
    ],
  },
  {
    title: "3. Account and booking information",
    body: [
      "You agree to provide accurate, current, and complete information while creating an account, making a booking, or contacting support. You are responsible for the accuracy of your device details, address, contact number, and all other information submitted through the platform.",
      "We may cancel, reject, or hold a booking where information appears incomplete, misleading, fraudulent, technically inconsistent, or operationally unserviceable.",
    ],
  },
  {
    title: "4. Pricing, availability, and confirmation",
    body: [
      "Displayed prices, listings, categories, and service options are subject to change without prior notice. A displayed price or service listing does not guarantee final availability, acceptance, or execution until confirmed by us.",
      "We reserve the right to correct pricing errors, listing inaccuracies, technical issues, or catalog mistakes, including after a booking request is submitted.",
    ],
  },
  {
    title: "5. Scheduling and cancellations",
    body: [
      "Requested time slots and dates are indicative unless expressly confirmed. Actual service timing may depend on technician availability, geography, device scope, traffic, inventory, customer responsiveness, and operational conditions.",
      "We may reschedule, delay, or cancel appointments where required for safety, logistics, service feasibility, force majeure, compliance, or circumstances beyond our reasonable control.",
      "Customers should review booking details carefully. Cancellation rights may be limited once an order progresses beyond the pending stage or once operational costs have already been committed.",
    ],
  },
  {
    title: "6. Customer responsibilities",
    body: [
      "Customers must ensure safe and reasonable access for service performance, provide correct device details, cooperate with verification requests, and avoid misuse of the platform or support channels.",
      "You agree not to use the platform for fraudulent activity, abusive conduct, unlawful content, unauthorized access, or any use that could disrupt operations, damage systems, or harm the company, its personnel, or other users.",
    ],
  },
  {
    title: "7. Warranty, disclaimer, and limitations",
    body: [
      "To the fullest extent permitted by law, the platform and its content are provided on an as-available and as-is basis. We do not guarantee uninterrupted availability, error-free operation, or that every listing, category, or technical detail will always be complete or current.",
      "Except where non-excludable obligations apply, Looplic disclaims implied warranties relating to merchantability, fitness for a particular purpose, uninterrupted access, and non-infringement.",
      "To the maximum extent permitted by law, Looplic shall not be liable for indirect, incidental, special, consequential, punitive, or business-interruption losses, including lost profits, lost opportunities, data loss, service delays, or third-party conduct.",
      "Our aggregate liability relating to platform use or bookings shall be limited to the amount actually paid by you to Looplic for the specific booking directly giving rise to the claim, except where a different standard is required by applicable law.",
    ],
  },
  {
    title: "8. Intellectual property",
    body: [
      "All platform content, branding, text, design, structure, software logic, and visual materials made available by Looplic are owned by us or used under appropriate rights. You may not reproduce, copy, scrape, republish, or commercially exploit platform content without permission.",
    ],
  },
  {
    title: "9. Termination and enforcement",
    body: [
      "We may suspend or terminate access, remove content, restrict bookings, or refuse support where we reasonably believe that these terms, our policies, applicable law, or platform integrity have been violated.",
      "We reserve all rights and remedies available under contract, equity, and applicable law.",
    ],
  },
  {
    title: "10. Governing updates",
    body: [
      "We may update these Terms and Conditions from time to time to reflect business, legal, technical, or operational changes. Continued use of the platform after updated terms are posted indicates acceptance of the revised version.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <InfoPageLayout
      eyebrow="Legal"
      title="Terms and Conditions"
      description={`These Terms and Conditions are intended to set clear expectations between ${companyName} and users of the platform, while protecting operational integrity, customer clarity, and the company’s legal position.`}
    >
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm leading-7 text-muted-foreground">
          By accessing or using the Looplic website, creating an account, placing an order, or contacting us through platform channels, you agree to these Terms and Conditions and our Privacy Policy.
        </p>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-black tracking-tight text-foreground">{section.title}</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-black tracking-tight text-foreground">Questions about these terms</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Questions regarding these Terms and Conditions can be directed to <strong>{supportEmail}</strong> or <strong>{supportPhoneDisplay}</strong>.
        </p>
      </section>
    </InfoPageLayout>
  );
}

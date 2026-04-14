"use client";

import { Check, Eye, Shield, Sparkles, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const guardTypes = [
  {
    name: "Tempered Glass",
    desc: "9H hardness, crystal clear protection",
    price: "₹99",
    tag: "Best Seller",
    features: ["Anti-scratch", "HD Clarity", "Easy apply"],
  },
  {
    name: "Privacy Guard",
    desc: "Anti-spy, visible only from front",
    price: "₹149",
    tag: null,
    features: ["180° privacy", "Tempered", "Smudge-free"],
  },
  {
    name: "Matte Guard",
    desc: "Smooth touch, zero reflections",
    price: "₹99",
    tag: null,
    features: ["Anti-glare", "Fingerprint-free", "Smooth feel"],
  },
  {
    name: "UV Glass",
    desc: "Full-edge coverage, UV bonded",
    price: "₹199",
    tag: "Premium",
    features: ["Full coverage", "UV cured", "Curved fit"],
  },
] as const;

const icons = [Shield, Eye, Sun, Sparkles] as const;

export function ScreenGuardTypes() {
  const [selected, setSelected] = useState(0);

  return (
    <section className="bg-secondary/30 py-10 md:py-16">
      <div className="container">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-extrabold text-foreground md:text-3xl">Pick Your Shield</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            All include <span className="font-bold text-accent">free doorstep installation</span>
          </p>
        </div>

        <div className="mx-auto grid max-w-sm grid-cols-2 gap-2.5 md:max-w-3xl md:grid-cols-4 md:gap-4">
          {guardTypes.map((guard, index) => {
            const isActive = selected === index;
            const Icon = icons[index];

            return (
              <button
                key={guard.name}
                onClick={() => setSelected(index)}
                className={`relative cursor-pointer rounded-2xl border-2 bg-card p-3.5 text-left transition-all duration-200 ${
                  isActive ? "border-primary shadow-elevated-brand" : "border-transparent shadow-card-brand hover:border-border"
                }`}
              >
                {guard.tag ? (
                  <span className="absolute -top-2.5 left-3 rounded-full gradient-brand px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-primary-foreground">
                    {guard.tag}
                  </span>
                ) : null}

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-[13px] font-extrabold leading-tight text-foreground">{guard.name}</h3>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{guard.desc}</p>

                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="text-lg font-extrabold gradient-brand-text">{guard.price}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground">onwards</span>
                </div>

                <div className="mt-2 space-y-1">
                  {guard.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-1">
                      <Check className="h-3 w-3 flex-shrink-0 text-accent" />
                      <span className="text-[10px] font-medium text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {isActive ? <div className="absolute inset-x-3 -bottom-px h-0.5 rounded-full gradient-brand" /> : null}
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/brands"
            className="rounded-2xl gradient-brand px-8 py-3 text-sm font-extrabold text-primary-foreground shadow-elevated-brand transition-transform active:scale-95"
          >
            Book {guardTypes[selected].name} — {guardTypes[selected].price}
          </Link>
        </div>
      </div>
    </section>
  );
}

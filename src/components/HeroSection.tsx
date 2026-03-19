import { Search, Smartphone, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const phoneModels = [
  "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16", "iPhone 15 Pro Max",
  "iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14",
  "Samsung Galaxy S24 Ultra", "Samsung Galaxy S24+", "Samsung Galaxy S24",
  "Samsung Galaxy S23 Ultra", "Samsung Galaxy Z Fold 5", "Samsung Galaxy Z Flip 5",
  "Google Pixel 9 Pro", "Google Pixel 9", "Google Pixel 8 Pro", "Google Pixel 8",
  "OnePlus 12", "OnePlus 11", "OnePlus Nord 3",
  "Xiaomi 14 Pro", "Xiaomi 13", "Redmi Note 13 Pro",
  "Vivo X100 Pro", "Oppo Find X7", "Realme GT 5 Pro",
  "Nothing Phone 2", "Motorola Edge 40 Pro",
];

const quickPicks = ["iPhone 16 Pro", "Samsung S24 Ultra", "Pixel 9 Pro", "OnePlus 12"];

const stats = [
  { value: "50K+", label: "Installations" },
  { value: "4.9★", label: "Rating" },
  { value: "30min", label: "Avg. Time" },
];

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const filtered = query.length > 1
    ? phoneModels.filter(m => m.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  return (
    <section className="relative overflow-hidden pt-6 pb-10 md:pt-16 md:pb-24">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero-bg" />
      <div className="absolute top-10 right-0 w-72 h-72 rounded-full gradient-brand opacity-[0.08] blur-[80px]" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full gradient-brand opacity-[0.06] blur-[60px]" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto text-center px-2"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-5 rounded-full bg-primary/10 border border-primary/20"
          >
            <Smartphone className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary tracking-wide">Doorstep Installation</span>
          </motion.div>

          <h1 className="text-[28px] leading-[1.2] font-extrabold tracking-tight md:text-5xl text-foreground">
            Screen Guard?{" "}
            <span className="gradient-brand-text">We Come to You.</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Search your model → Pick a guard → Book a pro technician at your door in minutes.
          </p>

          {/* Search Bar */}
          <div className="relative mt-7">
            <div className={`flex items-center bg-card rounded-2xl border-2 transition-all duration-300 ${isFocused ? "shadow-search border-primary/50" : "shadow-card-brand border-border"}`}>
              <Search className="ml-4 h-5 w-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search your phone model..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="w-full px-3 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm font-body font-medium"
              />
              <button className="mr-2 px-3 py-2 rounded-xl gradient-brand flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>

            {/* Dropdown */}
            {isFocused && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 right-0 mt-2 bg-card rounded-xl border border-border shadow-elevated-brand z-20 overflow-hidden"
              >
                {filtered.map((model) => (
                  <button
                    key={model}
                    className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors font-body flex items-center gap-3"
                    onMouseDown={() => setQuery(model)}
                  >
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    {model}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Quick Picks */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] text-muted-foreground font-semibold">Popular:</span>
            {quickPicks.map((model) => (
              <button
                key={model}
                onClick={() => setQuery(model)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-card border border-border text-foreground hover:border-primary/40 hover:shadow-sm transition-all"
              >
                {model}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 max-w-sm mx-auto"
        >
          <div className="flex items-center justify-around p-4 rounded-2xl bg-card border border-border shadow-card-brand">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="text-lg font-extrabold gradient-brand-text">{stat.value}</div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

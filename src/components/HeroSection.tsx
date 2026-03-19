import { Search, Smartphone, ArrowRight, MapPin } from "lucide-react";
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

const quickPicks = ["iPhone 16 Pro", "Galaxy S24", "Pixel 9", "OnePlus 12"];

const stats = [
  { value: "50K+", label: "Installs" },
  { value: "4.9★", label: "Rating" },
  { value: "30min", label: "Service" },
];

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const filtered = query.length > 1
    ? phoneModels.filter(m => m.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  return (
    <section className="relative overflow-hidden pt-8 pb-6 md:pt-16 md:pb-20">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero-bg" />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full gradient-brand opacity-[0.06] blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full gradient-brand opacity-[0.04] blur-[80px]" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto text-center"
        >
          {/* Location pill */}
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-5 rounded-full bg-accent/10 border border-accent/20 text-accent"
          >
            <MapPin className="w-3 h-3" />
            <span className="text-[11px] font-bold">Delivering in your city</span>
          </motion.button>

          <h1 className="text-[26px] leading-[1.15] font-extrabold tracking-tight md:text-5xl text-foreground px-4">
            Get Screen Guard{" "}
            <span className="gradient-brand-text block mt-1">Installed at Your Door</span>
          </h1>

          <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Find model → Choose guard → Book technician. Done in 60 seconds.
          </p>

          {/* Search Bar */}
          <div className="relative mt-6 px-1">
            <div className={`flex items-center bg-card rounded-2xl border-2 transition-all duration-300 ${isFocused ? "shadow-search border-primary/50" : "shadow-card-brand border-transparent"}`}>
              <Search className="ml-3.5 h-4.5 w-4.5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search your phone model..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="w-full px-3 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-[13px] font-body font-semibold"
              />
              <button className="mr-1.5 p-2.5 rounded-xl gradient-brand flex-shrink-0 active:scale-95 transition-transform">
                <ArrowRight className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>

            {/* Dropdown */}
            {isFocused && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-1 right-1 mt-2 bg-card rounded-xl border border-border shadow-elevated-brand z-20 overflow-hidden"
              >
                {filtered.map((model) => (
                  <button
                    key={model}
                    className="w-full text-left px-4 py-3 text-[13px] text-foreground hover:bg-secondary transition-colors font-body flex items-center gap-3"
                    onMouseDown={() => setQuery(model)}
                  >
                    <Smartphone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    {model}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Quick Picks */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 px-1">
            <span className="text-[10px] text-muted-foreground font-bold mr-0.5">Trending:</span>
            {quickPicks.map((model) => (
              <button
                key={model}
                onClick={() => setQuery(model)}
                className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-card border border-border text-foreground hover:border-primary/40 active:scale-95 transition-all"
              >
                {model}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-7 max-w-xs mx-auto"
        >
          <div className="flex items-center justify-around py-3.5 px-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-card-brand">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center flex-1">
                <div className="text-base font-extrabold gradient-brand-text leading-none">{stat.value}</div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
                {i < stats.length - 1 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 bg-border" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

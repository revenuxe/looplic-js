import { Search } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-screenguard.jpg";

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

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const filtered = query.length > 1
    ? phoneModels.filter(m => m.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  return (
    <section className="relative overflow-hidden gradient-hero-bg pt-8 pb-16 md:pt-12 md:pb-24">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full gradient-brand opacity-[0.07] blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full gradient-brand opacity-[0.05] blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary font-body">
            Doorstep Installation
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl text-foreground leading-tight">
            Premium Screen Guards,{" "}
            <span className="gradient-brand-text">Installed at Your Door</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-lg mx-auto">
            Find your phone model, pick a screen guard type, and book a certified technician — all in under 60 seconds.
          </p>

          {/* Search Bar */}
          <div className="relative mt-8 max-w-md mx-auto">
            <div className={`flex items-center bg-card rounded-2xl border transition-all duration-300 ${isFocused ? "shadow-search border-primary/40" : "shadow-card-brand border-border"}`}>
              <Search className="ml-4 h-5 w-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search your phone model..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="w-full px-3 py-4 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm md:text-base font-body"
              />
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
                    className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors font-body"
                    onMouseDown={() => setQuery(model)}
                  >
                    {model}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-elevated-brand"
        >
          <img
            src={heroImg}
            alt="Professional screen guard installation"
            className="w-full h-48 md:h-72 object-cover"
            loading="eager"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

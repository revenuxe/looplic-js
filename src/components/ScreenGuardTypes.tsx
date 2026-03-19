import { motion } from "framer-motion";
import { Shield, Eye, Sun, Sparkles, Check } from "lucide-react";
import { useState } from "react";

const guardTypes = [
  {
    icon: Shield,
    name: "Tempered Glass",
    desc: "9H hardness, crystal clear protection",
    price: "₹299",
    tag: "Best Seller",
    features: ["Anti-scratch", "HD Clarity", "Easy apply"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Eye,
    name: "Privacy Guard",
    desc: "Anti-spy, visible only from front",
    price: "₹499",
    tag: null,
    features: ["180° privacy", "Tempered", "Smudge-free"],
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Sun,
    name: "Matte Guard",
    desc: "Smooth touch, zero reflections",
    price: "₹399",
    tag: null,
    features: ["Anti-glare", "Fingerprint-free", "Smooth feel"],
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Sparkles,
    name: "UV Glass",
    desc: "Full-edge coverage, UV bonded",
    price: "₹699",
    tag: "Premium",
    features: ["Full coverage", "UV cured", "Curved fit"],
    gradient: "from-emerald-400 to-teal-500",
  },
];

const ScreenGuardTypes = () => {
  const [selected, setSelected] = useState(0);

  return (
    <section className="py-10 md:py-16 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-3xl font-extrabold text-foreground">
            Pick Your Shield
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            All include <span className="font-bold text-accent">free doorstep installation</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto md:grid-cols-4 md:max-w-3xl md:gap-4">
          {guardTypes.map((guard, i) => {
            const isActive = selected === i;
            return (
              <motion.button
                key={guard.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(i)}
                className={`relative text-left p-3.5 rounded-2xl border-2 transition-all duration-250 cursor-pointer group ${
                  isActive
                    ? "border-primary bg-card shadow-elevated-brand"
                    : "border-transparent bg-card shadow-card-brand hover:border-border"
                }`}
              >
                {/* Tag */}
                {guard.tag && (
                  <span className="absolute -top-2.5 left-3 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider rounded-full gradient-brand text-primary-foreground">
                    {guard.tag}
                  </span>
                )}

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${guard.gradient} flex items-center justify-center mb-3 group-active:scale-95 transition-transform`}>
                  <guard.icon className="w-4.5 h-4.5 text-primary-foreground" />
                </div>

                {/* Name & Price */}
                <h3 className="text-[13px] font-extrabold text-foreground leading-tight">{guard.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{guard.desc}</p>

                {/* Price */}
                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="text-lg font-extrabold gradient-brand-text">{guard.price}</span>
                  <span className="text-[9px] text-muted-foreground font-semibold">onwards</span>
                </div>

                {/* Features */}
                <div className="mt-2 space-y-1">
                  {guard.features.map((f) => (
                    <div key={f} className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-accent flex-shrink-0" />
                      <span className="text-[10px] text-muted-foreground font-medium">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="guard-active"
                    className="absolute inset-x-3 -bottom-px h-0.5 gradient-brand rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 text-center"
        >
          <button className="px-8 py-3 rounded-2xl gradient-brand text-primary-foreground text-sm font-extrabold shadow-elevated-brand active:scale-95 transition-transform">
            Book {guardTypes[selected].name} — {guardTypes[selected].price}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ScreenGuardTypes;

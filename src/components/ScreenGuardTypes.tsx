import { motion } from "framer-motion";
import { Shield, Eye, Sun, Sparkles, ChevronRight } from "lucide-react";

const guardTypes = [
  {
    icon: Shield,
    name: "Tempered Glass",
    desc: "9H hardness, crystal clear",
    price: "₹299",
    tag: "Popular",
    tagColor: "bg-primary",
  },
  {
    icon: Eye,
    name: "Privacy Guard",
    desc: "Anti-spy, visible only to you",
    price: "₹499",
    tag: null,
    tagColor: "",
  },
  {
    icon: Sun,
    name: "Matte / Anti-Glare",
    desc: "Smooth touch, no reflections",
    price: "₹399",
    tag: null,
    tagColor: "",
  },
  {
    icon: Sparkles,
    name: "UV Glass Guard",
    desc: "Full-edge, UV bonded",
    price: "₹699",
    tag: "Premium",
    tagColor: "bg-accent",
  },
];

const ScreenGuardTypes = () => {
  return (
    <section className="py-10 md:py-16 bg-secondary/40">
      <div className="container">
        <div className="flex items-center justify-between mb-6 px-1">
          <div>
            <h2 className="text-xl md:text-3xl font-extrabold text-foreground">
              Choose Protection
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Free doorstep installation included
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {guardTypes.map((guard, i) => (
            <motion.div
              key={guard.name}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-card-brand hover:shadow-elevated-brand hover:border-primary/30 transition-all duration-200 cursor-pointer group active:bg-secondary/50"
            >
              <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <guard.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">{guard.name}</h3>
                  {guard.tag && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md ${guard.tagColor} text-primary-foreground`}>
                      {guard.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{guard.desc}</p>
              </div>
              <div className="text-right flex-shrink-0 flex items-center gap-1">
                <span className="text-base font-extrabold gradient-brand-text">{guard.price}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScreenGuardTypes;

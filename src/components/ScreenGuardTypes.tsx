import { motion } from "framer-motion";
import { Shield, Eye, Sun, Sparkles } from "lucide-react";

const guardTypes = [
  {
    icon: Shield,
    name: "Tempered Glass",
    desc: "9H hardness, crystal clear",
    price: "₹299",
    tag: "Popular",
  },
  {
    icon: Eye,
    name: "Privacy Guard",
    desc: "Anti-spy, visible only to you",
    price: "₹499",
    tag: null,
  },
  {
    icon: Sun,
    name: "Matte / Anti-Glare",
    desc: "Smooth touch, no reflections",
    price: "₹399",
    tag: null,
  },
  {
    icon: Sparkles,
    name: "UV Glass Guard",
    desc: "Full-edge, UV bonded",
    price: "₹699",
    tag: "Premium",
  },
];

const ScreenGuardTypes = () => {
  return (
    <section className="py-12 md:py-16 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Choose Your Protection
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every guard comes with free doorstep installation
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
          {guardTypes.map((guard, i) => (
            <motion.div
              key={guard.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative p-4 md:p-5 rounded-xl bg-card border border-border shadow-card-brand hover:shadow-elevated-brand hover:border-primary/30 transition-all duration-300 cursor-pointer group"
            >
              {guard.tag && (
                <span className="absolute -top-2 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full gradient-brand text-accent-foreground">
                  {guard.tag}
                </span>
              )}
              <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <guard.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{guard.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{guard.desc}</p>
              <p className="mt-3 text-lg font-extrabold gradient-brand-text">{guard.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScreenGuardTypes;

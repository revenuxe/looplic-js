import { motion } from "framer-motion";
import { ShieldCheck, Droplets, Clock, Award } from "lucide-react";

const signals = [
  { icon: ShieldCheck, title: "Certified Techs", desc: "Trained & verified pros" },
  { icon: Droplets, title: "No-Bubble Promise", desc: "Perfect or free redo" },
  { icon: Clock, title: "30-Min Service", desc: "Quick at your door" },
  { icon: Award, title: "6-Month Warranty", desc: "Free crack replacement" },
];

const TrustSignals = () => (
  <section className="py-10 md:py-16 bg-navy text-navy-foreground">
    <div className="container">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-3xl font-extrabold">Why Looplic?</h2>
        <p className="mt-1 text-xs opacity-60">Trusted by 50,000+ customers</p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto md:grid-cols-4 md:max-w-3xl">
        {signals.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="text-center p-4 rounded-2xl border border-primary/10 bg-primary/5"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-2.5">
              <s.icon className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-[13px] font-bold">{s.title}</h3>
            <p className="text-[11px] opacity-60 mt-0.5 leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSignals;

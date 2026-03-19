import { motion } from "framer-motion";
import { ShieldCheck, Droplets, Clock, Award } from "lucide-react";

const signals = [
  { icon: ShieldCheck, title: "Certified Technicians", desc: "Trained & background-verified pros" },
  { icon: Droplets, title: "No-Bubble Guarantee", desc: "Perfect fit or we redo it free" },
  { icon: Clock, title: "30-Min Service", desc: "Quick installation at your door" },
  { icon: Award, title: "6-Month Warranty", desc: "Free replacement if it cracks" },
];

const TrustSignals = () => (
  <section className="py-12 md:py-16 bg-navy text-navy-foreground">
    <div className="container">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">Why Choose Looplic?</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {signals.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="text-center p-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <s.icon className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-sm font-bold">{s.title}</h3>
            <p className="text-xs opacity-70 mt-1">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSignals;

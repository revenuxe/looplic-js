import { motion } from "framer-motion";
import { Search, CalendarCheck, Wrench, ThumbsUp } from "lucide-react";

const steps = [
  { icon: Search, title: "Search Model", desc: "Find your phone in seconds" },
  { icon: CalendarCheck, title: "Pick a Slot", desc: "Choose time that works for you" },
  { icon: Wrench, title: "We Install", desc: "Certified tech at your doorstep" },
  { icon: ThumbsUp, title: "Enjoy!", desc: "Bubble-free, flawless finish" },
];

const HowItWorks = () => (
  <section className="py-12 md:py-16 bg-background">
    <div className="container">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          How It Works
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Book in 4 simple steps</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="text-center"
          >
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-3 shadow-elevated-brand">
              <step.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-xs font-bold text-muted-foreground mb-1">Step {i + 1}</div>
            <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;

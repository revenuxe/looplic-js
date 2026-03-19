import { motion } from "framer-motion";
import { Search, CalendarCheck, Wrench, ThumbsUp } from "lucide-react";

const steps = [
  { icon: Search, title: "Search Model", desc: "Find your phone in seconds", num: "01" },
  { icon: CalendarCheck, title: "Pick a Slot", desc: "Choose a convenient time", num: "02" },
  { icon: Wrench, title: "We Come to You", desc: "Certified tech at your door", num: "03" },
  { icon: ThumbsUp, title: "Done!", desc: "Bubble-free, perfect finish", num: "04" },
];

const HowItWorks = () => (
  <section className="py-10 md:py-16 bg-background overflow-hidden">
    <div className="container">
      <div className="text-center mb-7">
        <h2 className="text-xl md:text-3xl font-extrabold text-foreground">
          Simple as 1-2-3-4
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Book your installation in under a minute</p>
      </div>

      <div className="max-w-sm mx-auto md:max-w-3xl relative">
        {/* Vertical connector line */}
        <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-primary/30 via-accent/30 to-transparent md:hidden" />

        <div className="flex flex-col md:flex-row md:items-stretch gap-3 md:gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-center gap-4 md:flex-col md:items-center md:text-center md:flex-1 relative"
            >
              {/* Number circle */}
              <div className="relative z-10 w-10 h-10 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-xs font-extrabold text-primary-foreground">{step.num}</span>
              </div>

              {/* Content card */}
              <div className="flex-1 py-3 px-4 rounded-2xl bg-card border border-border shadow-card-brand md:py-5 md:px-4 md:mt-3">
                <div className="flex items-center gap-2 md:justify-center mb-1">
                  <step.icon className="w-4 h-4 text-primary" />
                  <h3 className="text-[13px] font-bold text-foreground">{step.title}</h3>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;

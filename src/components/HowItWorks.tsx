import { motion } from "framer-motion";
import { Search, CalendarCheck, Wrench, ThumbsUp } from "lucide-react";

const steps = [
  { icon: Search, title: "Search Model", desc: "Find your phone", color: "from-blue-400 to-blue-600" },
  { icon: CalendarCheck, title: "Pick a Slot", desc: "Choose your time", color: "from-teal-400 to-teal-600" },
  { icon: Wrench, title: "We Install", desc: "Pro at your door", color: "from-indigo-400 to-indigo-600" },
  { icon: ThumbsUp, title: "Enjoy!", desc: "Flawless finish", color: "from-green-400 to-green-600" },
];

const HowItWorks = () => (
  <section className="py-10 md:py-16 bg-background">
    <div className="container">
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-3xl font-extrabold text-foreground">
          How It Works
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Book in 4 simple steps</p>
      </div>

      {/* Vertical timeline on mobile, horizontal on desktop */}
      <div className="max-w-sm mx-auto md:max-w-3xl">
        <div className="flex flex-col md:flex-row md:items-start gap-0 md:gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-4 md:flex-col md:items-center md:text-center md:flex-1 py-3 md:py-0 relative"
            >
              {/* Connector line (mobile) */}
              {i < steps.length - 1 && (
                <div className="absolute left-[23px] top-[52px] w-0.5 h-6 bg-border md:hidden" />
              )}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <step.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-primary uppercase tracking-widest mb-0.5">Step {i + 1}</div>
                <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorks;

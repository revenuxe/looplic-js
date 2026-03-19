import { motion } from "framer-motion";
import { ShieldCheck, Droplets, Clock, Award, Star } from "lucide-react";

const signals = [
  { icon: ShieldCheck, title: "Certified Techs", desc: "Trained & background-verified professionals" },
  { icon: Droplets, title: "No-Bubble Guarantee", desc: "Perfect fit or we redo it absolutely free" },
  { icon: Clock, title: "30-Min Service", desc: "Quick & precise installation at your doorstep" },
  { icon: Award, title: "6-Month Warranty", desc: "Free replacement if it cracks within warranty" },
];

const reviews = [
  { name: "Rahul K.", rating: 5, text: "Super smooth installation, done in 15 mins!" },
  { name: "Priya S.", rating: 5, text: "Best screen guard service ever. No bubbles at all." },
  { name: "Amit R.", rating: 5, text: "Technician was very professional. Highly recommend!" },
];

const TrustSignals = () => (
  <section className="py-10 md:py-16 bg-navy text-navy-foreground">
    <div className="container">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-3xl font-extrabold">Why Looplic?</h2>
        <p className="mt-1 text-xs opacity-50 font-semibold">Loved by our early customers</p>
      </div>

      {/* Trust cards */}
      <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto md:grid-cols-4 md:max-w-3xl md:gap-3">
        {signals.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.07 }}
            className="p-3.5 rounded-2xl border border-primary/10 bg-primary/[0.06] backdrop-blur-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center mb-2.5">
              <s.icon className="w-4.5 h-4.5 text-accent" />
            </div>
            <h3 className="text-[12px] font-extrabold leading-tight">{s.title}</h3>
            <p className="text-[10px] opacity-50 mt-1 leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Mini reviews */}
      <div className="mt-8 max-w-sm mx-auto md:max-w-2xl">
        <h3 className="text-center text-[13px] font-extrabold mb-4 opacity-80">What Customers Say</h3>
        <div className="space-y-2.5">
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-primary/[0.06] border border-primary/10"
            >
              <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold text-primary-foreground">
                {r.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold">{r.name}</span>
                  <div className="flex">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] opacity-60 mt-0.5 leading-relaxed">{r.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TrustSignals;

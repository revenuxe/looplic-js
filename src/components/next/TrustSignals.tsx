import { Award, Clock, Droplets, ShieldCheck, Star } from "lucide-react";

const signals = [
  { icon: ShieldCheck, title: "Certified Techs", desc: "Trained and background-verified professionals" },
  { icon: Droplets, title: "No-Bubble Guarantee", desc: "Perfect fit or we redo it absolutely free" },
  { icon: Clock, title: "30-Min Service", desc: "Quick and precise installation at your doorstep" },
  { icon: Award, title: "6-Month Warranty", desc: "Free replacement if it cracks within warranty" },
];

const reviews = [
  { name: "Rahul K.", rating: 5, text: "Super smooth installation, done in 15 mins!" },
  { name: "Priya S.", rating: 5, text: "Best screen guard service ever. No bubbles at all." },
  { name: "Amit R.", rating: 5, text: "Technician was very professional. Highly recommend!" },
];

export function TrustSignals() {
  return (
    <section className="bg-navy py-10 text-navy-foreground md:py-16">
      <div className="container">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-extrabold md:text-3xl">Why Looplic?</h2>
          <p className="mt-1 text-xs font-semibold opacity-50">Loved by our early customers</p>
        </div>

        <div className="mx-auto grid max-w-sm grid-cols-2 gap-2.5 md:max-w-3xl md:grid-cols-4 md:gap-3">
          {signals.map((signal) => (
            <div key={signal.title} className="rounded-2xl border border-primary/10 bg-primary/[0.06] p-3.5 backdrop-blur-sm">
              <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20">
                <signal.icon className="h-4 w-4 text-accent" />
              </div>
              <h3 className="text-[12px] font-extrabold leading-tight">{signal.title}</h3>
              <p className="mt-1 text-[10px] leading-relaxed opacity-50">{signal.desc}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-sm md:max-w-2xl">
          <h3 className="mb-4 text-center text-[13px] font-extrabold opacity-80">What Customers Say</h3>
          <div className="space-y-2.5">
            {reviews.map((review) => (
              <div key={review.name} className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/[0.06] p-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full gradient-brand text-[11px] font-extrabold text-primary-foreground">
                  {review.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold">{review.name}</span>
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-0.5 text-[10px] leading-relaxed opacity-60">{review.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

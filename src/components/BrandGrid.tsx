import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const brands = [
  { name: "Apple", letter: "A", gradient: "from-gray-700 to-gray-900" },
  { name: "Samsung", letter: "S", gradient: "from-blue-500 to-blue-700" },
  { name: "Google", letter: "G", gradient: "from-red-400 to-yellow-400" },
  { name: "OnePlus", letter: "1+", gradient: "from-red-500 to-red-700" },
  { name: "Xiaomi", letter: "Mi", gradient: "from-orange-400 to-orange-600" },
  { name: "Vivo", letter: "V", gradient: "from-blue-400 to-indigo-500" },
  { name: "Oppo", letter: "O", gradient: "from-green-400 to-green-600" },
  { name: "Realme", letter: "R", gradient: "from-yellow-400 to-yellow-600" },
  { name: "Nothing", letter: "N", gradient: "from-gray-400 to-gray-600" },
];

const BrandGrid = () => {
  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="container">
        <div className="flex items-center justify-between mb-6 px-1">
          <div>
            <h2 className="text-xl md:text-3xl font-extrabold text-foreground">
              Browse by Brand
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Tap a brand to explore models
            </p>
          </div>
          <button className="flex items-center gap-0.5 text-xs font-bold text-primary">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal scroll on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible">
          {brands.map((brand, i) => (
            <motion.button
              key={brand.name}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 snap-start flex flex-col items-center gap-2.5 p-4 w-[88px] rounded-2xl bg-card border border-border shadow-card-brand hover:shadow-elevated-brand hover:border-primary/30 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center`}>
                <span className="text-sm font-extrabold text-primary-foreground">{brand.letter}</span>
              </div>
              <span className="text-[11px] font-bold text-foreground">
                {brand.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandGrid;

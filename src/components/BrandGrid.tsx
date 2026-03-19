import { motion } from "framer-motion";

const brands = [
  { name: "Apple", icon: "🍎" },
  { name: "Samsung", icon: "📱" },
  { name: "Google", icon: "🔍" },
  { name: "OnePlus", icon: "➕" },
  { name: "Xiaomi", icon: "📲" },
  { name: "Vivo", icon: "🔷" },
  { name: "Oppo", icon: "🟢" },
  { name: "Realme", icon: "⚡" },
  { name: "Nothing", icon: "⚪" },
];

const BrandGrid = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Browse by Brand
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Select your brand to find compatible screen guards
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-2xl mx-auto">
          {brands.map((brand, i) => (
            <motion.button
              key={brand.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border shadow-card-brand hover:shadow-elevated-brand hover:border-primary/30 transition-all duration-300 cursor-pointer"
            >
              <span className="text-2xl">{brand.icon}</span>
              <span className="text-xs font-semibold text-foreground font-body">
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

import { motion } from "framer-motion";
import { ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Brand = {
  id: string;
  name: string;
  letter: string;
  gradient: string;
  image_url: string | null;
};

const fallbackBrands: Brand[] = [
  { id: "1", name: "Apple", letter: "A", gradient: "from-gray-700 to-gray-900", image_url: null },
  { id: "2", name: "Samsung", letter: "S", gradient: "from-blue-500 to-blue-700", image_url: null },
  { id: "3", name: "Google", letter: "G", gradient: "from-red-400 to-yellow-400", image_url: null },
  { id: "4", name: "OnePlus", letter: "1+", gradient: "from-red-500 to-red-700", image_url: null },
  { id: "5", name: "Xiaomi", letter: "Mi", gradient: "from-orange-400 to-orange-600", image_url: null },
  { id: "6", name: "Vivo", letter: "V", gradient: "from-blue-400 to-indigo-500", image_url: null },
  { id: "7", name: "Oppo", letter: "O", gradient: "from-green-400 to-green-600", image_url: null },
  { id: "8", name: "Realme", letter: "R", gradient: "from-yellow-400 to-yellow-600", image_url: null },
  { id: "9", name: "Nothing", letter: "N", gradient: "from-gray-400 to-gray-600", image_url: null },
];

const BrandGrid = () => {
  const [brands, setBrands] = useState<Brand[]>(fallbackBrands);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("brands")
      .select("id, name, letter, gradient, image_url")
      .order("sort_order")
      .order("name")
      .then(({ data }) => {
        if (data && data.length > 0) setBrands(data);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="container">
        <div className="flex items-center justify-between mb-5 px-1">
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

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 md:gap-3">
            {brands.map((brand, i) => (
              <motion.button
                key={brand.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                whileTap={{ scale: 0.93 }}
                className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl bg-card border border-border shadow-card-brand hover:shadow-elevated-brand hover:border-primary/30 active:bg-secondary/60 transition-all duration-200 cursor-pointer"
              >
                {brand.image_url ? (
                  <img src={brand.image_url} alt={brand.name} className="w-10 h-10 rounded-xl object-contain" />
                ) : (
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center shadow-sm`}>
                    <span className="text-xs font-extrabold text-primary-foreground">{brand.letter}</span>
                  </div>
                )}
                <span className="text-[11px] font-bold text-foreground">
                  {brand.name}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandGrid;

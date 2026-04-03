import { motion } from "framer-motion";
import { ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const [showAll, setShowAll] = useState(false);

  // 3 cols mobile, 4 sm, 5 md — 3 rows
  const getVisibleCount = () => {
    if (typeof window === "undefined") return 15;
    if (window.innerWidth >= 768) return 15; // 5 cols × 3 rows
    if (window.innerWidth >= 640) return 12; // 4 cols × 3 rows
    return 9; // 3 cols × 3 rows
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount);

  useEffect(() => {
    const handler = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

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

  const displayedBrands = showAll ? brands : brands.slice(0, visibleCount);
  const hasMore = brands.length > visibleCount;

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
          <Link to="/brands" className="flex items-center gap-0.5 text-xs font-bold text-primary">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 md:gap-3">
              {displayedBrands.map((brand, i) => (
                <Link to={`/brands/${brand.id}`} key={brand.id}>
                  <motion.div
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
                  </motion.div>
                </Link>
              ))}

              {/* Show More button in the same grid row */}
              {hasMore && !showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="flex flex-col items-center justify-center gap-2 py-3.5 px-2 rounded-2xl bg-card border border-dashed border-border hover:border-primary/40 hover:bg-secondary/40 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground">Show More</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default BrandGrid;

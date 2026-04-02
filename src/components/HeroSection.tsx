import { Search, Smartphone, ArrowRight, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type SearchResult = {
  modelId: string;
  modelName: string;
  seriesId: string;
  seriesName: string;
  brandId: string;
  brandName: string;
};

type Brand = {
  id: string;
  name: string;
  letter: string;
  gradient: string;
  image_url: string | null;
};

const stats = [
  { value: "2000+", label: "Installs" },
  { value: "4.8★", label: "Rating" },
  { value: "30min", label: "Service" },
];

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const navigate = useNavigate();

  // Load brands for hero display
  useEffect(() => {
    supabase
      .from("brands")
      .select("id, name, letter, gradient, image_url")
      .eq("service_type", "mobile")
      .order("sort_order")
      .order("name")
      .limit(6)
      .then(({ data }) => {
        if (data) setBrands(data);
        setLoadingBrands(false);
      });
  }, []);

  const searchModels = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    const words = q.trim().split(/\s+/).filter(w => w.length > 0);
    const { data } = await supabase
      .from("models")
      .select("id, name, series_id, series!inner(id, name, brand_id, brands!inner(id, name))")
      .limit(100);
    if (data) {
      const mapped = data.map((m: any) => ({
        modelId: m.id, modelName: m.name, seriesId: m.series.id, seriesName: m.series.name,
        brandId: m.series.brands.id, brandName: m.series.brands.name,
      }));
      const filtered = mapped.filter((r) => {
        const combined = `${r.brandName} ${r.seriesName} ${r.modelName}`.toLowerCase();
        return words.every(w => combined.includes(w.toLowerCase()));
      }).slice(0, 6);
      setResults(filtered);
    }
    setSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchModels(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchModels]);

  const handleSelect = (r: SearchResult) => {
    setQuery(""); setIsFocused(false);
    navigate(`/brands/${r.brandId}/${r.seriesId}/${r.modelId}`);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-6 md:pt-16 md:pb-20">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero-bg" />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full gradient-brand opacity-[0.06] blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full gradient-brand opacity-[0.04] blur-[80px]" />

      <div className="container relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-lg mx-auto text-center">
          <h1 className="text-[26px] leading-[1.15] font-extrabold tracking-tight md:text-5xl text-foreground px-4">
            Get Screen Guard{" "}
            <span className="gradient-brand-text block mt-1">Installed at Your Door</span>
          </h1>
          <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Find model → Choose guard → Book technician. Done in 60 seconds.
          </p>

          {/* Search Bar */}
          <div className="relative mt-6 px-1">
            <div className={`flex items-center bg-card rounded-2xl border-2 transition-all duration-300 ${isFocused ? "shadow-search border-primary/50" : "shadow-card-brand border-transparent"}`}>
              <Search className="ml-3.5 h-4.5 w-4.5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search your phone model..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="w-full px-3 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-[13px] font-body font-semibold"
              />
              {searching && <div className="mr-2"><div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
              <button onClick={() => { if (results.length > 0) handleSelect(results[0]); }} className="mr-1.5 p-2.5 rounded-xl gradient-brand flex-shrink-0 active:scale-95 transition-transform">
                <ArrowRight className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {isFocused && results.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute left-1 right-1 mt-2 bg-card rounded-xl border border-border shadow-elevated-brand z-20 overflow-hidden">
                  {results.map((r) => (
                    <button key={r.modelId} className="w-full text-left px-4 py-3 text-[13px] text-foreground hover:bg-secondary transition-colors font-body flex items-center gap-3" onMouseDown={() => handleSelect(r)}>
                      <Smartphone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="font-bold">{r.modelName}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">{r.brandName} · {r.seriesName}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Pick a Brand - inline in hero like fixma.in */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-xs font-bold text-muted-foreground">— Pick a brand for your phone —</p>
            <Link to="/brands" className="flex items-center gap-0.5 text-[10px] font-bold text-primary">
              All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {!loadingBrands && brands.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {brands.map((brand, i) => (
                <motion.div key={brand.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + i * 0.05 }}>
                  <Link
                    to={`/brands/${brand.id}`}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl bg-card border border-border shadow-card-brand hover:shadow-elevated-brand hover:border-primary/30 active:scale-95 transition-all"
                  >
                    {brand.image_url ? (
                      <img src={brand.image_url} alt={brand.name} className="w-10 h-10 rounded-xl object-contain" />
                    ) : (
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center`}>
                        <span className="text-xs font-extrabold text-primary-foreground">{brand.letter}</span>
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-foreground">{brand.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="mt-6 max-w-xs mx-auto">
          <div className="flex items-center justify-around py-3.5 px-3 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-card-brand">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center flex-1 relative">
                <div className="text-base font-extrabold gradient-brand-text leading-none">{stat.value}</div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</div>
                {i < stats.length - 1 && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 bg-border" />}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Loader2, ChevronRight } from "lucide-react";

type Brand = { id: string; name: string; letter: string; gradient: string; image_url: string | null };

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("brands").select("id, name, letter, gradient, image_url").order("sort_order").order("name")
      .then(({ data }) => { if (data) setBrands(data); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-5">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Brands</span>
          </div>

          <h1 className="text-2xl font-extrabold text-foreground mb-1">Select Your Brand</h1>
          <p className="text-xs text-muted-foreground mb-6">Choose your phone brand to find the right screen guard</p>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : brands.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-16">No brands available yet</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {brands.map((brand, i) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                >
                  <Link
                    to={`/brands/${brand.id}`}
                    className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-card border border-border shadow-card-brand hover:shadow-elevated-brand hover:border-primary/30 active:scale-95 transition-all cursor-pointer"
                  >
                    {brand.image_url ? (
                      <img src={brand.image_url} alt={brand.name} className="w-12 h-12 rounded-xl object-contain" />
                    ) : (
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center shadow-sm`}>
                        <span className="text-sm font-extrabold text-primary-foreground">{brand.letter}</span>
                      </div>
                    )}
                    <span className="text-xs font-bold text-foreground text-center">{brand.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrandsPage;

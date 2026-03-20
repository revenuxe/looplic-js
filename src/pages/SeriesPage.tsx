import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Loader2, ChevronRight, Smartphone } from "lucide-react";

type Series = { id: string; name: string };
type Brand = { id: string; name: string };

const SeriesPage = () => {
  const { brandId } = useParams();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandId) return;
    Promise.all([
      supabase.from("brands").select("id, name").eq("id", brandId).single(),
      supabase.from("series").select("id, name").eq("brand_id", brandId).order("name"),
    ]).then(([brandRes, seriesRes]) => {
      if (brandRes.data) setBrand(brandRes.data);
      if (seriesRes.data) setSeriesList(seriesRes.data);
      setLoading(false);
    });
  }, [brandId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-5 flex-wrap">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/brands" className="hover:text-foreground transition-colors">Brands</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{brand?.name || "..."}</span>
          </div>

          <h1 className="text-2xl font-extrabold text-foreground mb-1">{brand?.name || "..."} Series</h1>
          <p className="text-xs text-muted-foreground mb-6">Select your phone series</p>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : seriesList.length === 0 ? (
            <div className="text-center py-16">
              <Smartphone className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-semibold">No series available for {brand?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {seriesList.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <Link
                    to={`/brands/${brandId}/${s.id}`}
                    className="flex flex-col items-center justify-center p-5 rounded-2xl bg-card border border-border shadow-card-brand hover:shadow-elevated-brand hover:border-primary/30 active:scale-[0.98] transition-all text-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-sm font-bold text-foreground">{s.name}</span>
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

export default SeriesPage;

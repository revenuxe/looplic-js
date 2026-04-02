import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Loader2, ChevronRight, Smartphone, Shield, ArrowRight } from "lucide-react";

type Series = { id: string; name: string };
type Brand = { id: string; name: string; image_url: string | null; gradient: string; letter: string };

const SeriesPage = () => {
  const { brandId, serviceType } = useParams();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  const isServiceRoute = !!serviceType;

  useEffect(() => {
    if (!brandId) return;
    Promise.all([
      supabase.from("brands").select("id, name, image_url, gradient, letter").eq("id", brandId).single(),
      supabase.from("series").select("id, name").eq("brand_id", brandId).order("name"),
    ]).then(([brandRes, seriesRes]) => {
      if (brandRes.data) {
        setBrand(brandRes.data);
        document.title = `${brandRes.data.name} Screen Guard & Repair | Looplic`;
      }
      if (seriesRes.data) setSeriesList(seriesRes.data);
      setLoading(false);
    });
  }, [brandId]);

  const getSeriesLink = (seriesId: string) => {
    if (isServiceRoute) return `/service/${serviceType}/brands/${brandId}/${seriesId}`;
    return `/brands/${brandId}/${seriesId}`;
  };

  const getBrandsLink = () => {
    if (isServiceRoute) return `/service/${serviceType}/brands`;
    return "/brands";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-5 flex-wrap">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={getBrandsLink()} className="hover:text-foreground transition-colors">Brands</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{brand?.name || "..."}</span>
          </div>

          {/* Brand Hero */}
          <div className="flex items-center gap-4 mb-6">
            {brand?.image_url ? (
              <img src={brand.image_url} alt={`${brand.name} logo`} className="w-16 h-16 rounded-2xl object-contain border border-border shadow-card-brand" />
            ) : brand ? (
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center shadow-sm`}>
                <span className="text-xl font-extrabold text-primary-foreground">{brand.letter}</span>
              </div>
            ) : null}
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-foreground">
                {brand?.name || "..."} Phone Series
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Select your {brand?.name} series to find screen guards & repair services
              </p>
            </div>
          </div>

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
                    to={getSeriesLink(s.id)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-card-brand hover:shadow-elevated-brand hover:border-primary/30 active:scale-[0.98] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-bold text-foreground">{s.name}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* SEO content */}
          {brand && seriesList.length > 0 && (
            <div className="mt-12 max-w-2xl">
              <h2 className="text-lg font-extrabold text-foreground mb-2">
                {brand.name} Screen Guard & Repair Services
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We offer premium screen guard installation and professional repair services for all {brand.name} phone models.
                Choose your {brand.name} series above to find the perfect screen protection or repair service for your device.
                All services include doorstep installation with a no-bubble guarantee.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SeriesPage;

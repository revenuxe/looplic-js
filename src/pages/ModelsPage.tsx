import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Loader2, ChevronRight, Smartphone, ArrowRight } from "lucide-react";

type Model = { id: string; name: string };
type Breadcrumb = { brandName: string; seriesName: string; brandImage: string | null; brandGradient: string; brandLetter: string };

const ModelsPage = () => {
  const { brandId, seriesId, serviceType } = useParams();
  const [bc, setBc] = useState<Breadcrumb>({ brandName: "...", seriesName: "...", brandImage: null, brandGradient: "from-blue-500 to-cyan-500", brandLetter: "?" });
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const isServiceRoute = !!serviceType;

  useEffect(() => {
    if (!brandId || !seriesId) return;
    Promise.all([
      supabase.from("brands").select("name, image_url, gradient, letter").eq("id", brandId).single(),
      supabase.from("series").select("name").eq("id", seriesId).single(),
      supabase.from("models").select("id, name").eq("series_id", seriesId).order("name"),
    ]).then(([brandRes, seriesRes, modelsRes]) => {
      const bName = brandRes.data?.name || "...";
      const sName = seriesRes.data?.name || "...";
      setBc({
        brandName: bName, seriesName: sName,
        brandImage: brandRes.data?.image_url || null,
        brandGradient: brandRes.data?.gradient || "from-blue-500 to-cyan-500",
        brandLetter: brandRes.data?.letter || "?",
      });
      document.title = `${bName} ${sName} Screen Guard & Repair | Looplic`;
      if (modelsRes.data) setModels(modelsRes.data);
      setLoading(false);
    });
  }, [brandId, seriesId]);

  const getModelLink = (modelId: string) => {
    if (isServiceRoute) return `/service/${serviceType}/book/${brandId}/${seriesId}/${modelId}`;
    return `/brands/${brandId}/${seriesId}/${modelId}`;
  };

  const getBrandsLink = () => isServiceRoute ? `/service/${serviceType}/brands` : "/brands";
  const getSeriesLink = () => isServiceRoute ? `/service/${serviceType}/brands/${brandId}` : `/brands/${brandId}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-5 flex-wrap">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={getBrandsLink()} className="hover:text-foreground transition-colors">Brands</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={getSeriesLink()} className="hover:text-foreground transition-colors">{bc.brandName}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{bc.seriesName}</span>
          </div>

          {/* Hero */}
          <div className="flex items-center gap-4 mb-6">
            {bc.brandImage ? (
              <img src={bc.brandImage} alt={bc.brandName} className="w-14 h-14 rounded-2xl object-contain border border-border" />
            ) : (
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bc.brandGradient} flex items-center justify-center`}>
                <span className="text-lg font-extrabold text-primary-foreground">{bc.brandLetter}</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
                {bc.brandName} {bc.seriesName} Models
              </h1>
              <p className="text-xs text-muted-foreground mt-1">Select your phone model for screen guard or repair</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : models.length === 0 ? (
            <div className="text-center py-16">
              <Smartphone className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-semibold">No models available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {models.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <Link
                    to={getModelLink(m.id)}
                    className="flex items-center justify-between gap-2 py-4 px-4 rounded-2xl bg-card border border-border shadow-card-brand hover:shadow-elevated-brand hover:border-primary/30 active:scale-95 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-primary flex-shrink-0" />
                      <span className="text-xs font-bold text-foreground">{m.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* SEO */}
          {models.length > 0 && (
            <div className="mt-12 max-w-2xl">
              <h2 className="text-lg font-extrabold text-foreground mb-2">
                {bc.brandName} {bc.seriesName} Screen Guard & Services
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Browse all {bc.brandName} {bc.seriesName} models above. Each model comes with multiple screen guard options
                including tempered glass, privacy guards, matte finish, and more. All installations are done at your doorstep
                with professional tools and a no-bubble guarantee.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ModelsPage;

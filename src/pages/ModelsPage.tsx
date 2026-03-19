import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Loader2, ChevronRight, Smartphone } from "lucide-react";

type Model = { id: string; name: string };
type Breadcrumb = { brandName: string; seriesName: string };

const ModelsPage = () => {
  const { brandId, seriesId } = useParams();
  const [bc, setBc] = useState<Breadcrumb>({ brandName: "...", seriesName: "..." });
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandId || !seriesId) return;
    Promise.all([
      supabase.from("brands").select("name").eq("id", brandId).single(),
      supabase.from("series").select("name").eq("id", seriesId).single(),
      supabase.from("models").select("id, name").eq("series_id", seriesId).order("name"),
    ]).then(([brandRes, seriesRes, modelsRes]) => {
      setBc({ brandName: brandRes.data?.name || "...", seriesName: seriesRes.data?.name || "..." });
      if (modelsRes.data) setModels(modelsRes.data);
      setLoading(false);
    });
  }, [brandId, seriesId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-5 flex-wrap">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/brands" className="hover:text-foreground transition-colors">Brands</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/brands/${brandId}`} className="hover:text-foreground transition-colors">{bc.brandName}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{bc.seriesName}</span>
          </div>

          <h1 className="text-2xl font-extrabold text-foreground mb-1">{bc.seriesName}</h1>
          <p className="text-xs text-muted-foreground mb-6">Select your phone model</p>

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
                    to={`/brands/${brandId}/${seriesId}/${m.id}`}
                    className="flex flex-col items-center gap-2 py-5 px-3 rounded-2xl bg-card border border-border shadow-card-brand hover:shadow-elevated-brand hover:border-primary/30 active:scale-95 transition-all text-center"
                  >
                    <Smartphone className="w-8 h-8 text-primary" />
                    <span className="text-xs font-bold text-foreground">{m.name}</span>
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

export default ModelsPage;

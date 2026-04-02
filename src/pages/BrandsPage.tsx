import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Loader2, ChevronRight, Shield, Search, Star, Clock, CheckCircle2 } from "lucide-react";

type Brand = { id: string; name: string; letter: string; gradient: string; image_url: string | null };

const BrandsPage = () => {
  const { serviceType } = useParams();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const sType = serviceType || "mobile";
  const isScreenGuard = !serviceType;

  useEffect(() => {
    document.title = isScreenGuard
      ? "Screen Guard for All Phone Brands | Looplic"
      : `${sType === "laptop" ? "Laptop" : "Mobile"} Repair - All Brands | Looplic`;

    supabase.from("brands").select("id, name, letter, gradient, image_url")
      .eq("service_type", sType === "laptop-repair" || sType === "laptop" ? "laptop" : "mobile")
      .order("sort_order").order("name")
      .then(({ data }) => { if (data) setBrands(data); setLoading(false); });
  }, [sType]);

  const filtered = search.trim()
    ? brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
    : brands;

  const basePath = isScreenGuard ? "/brands" : `/service/${serviceType}/brands`;

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

          {/* SEO Hero */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-4xl font-extrabold text-foreground mb-2">
              {isScreenGuard ? "Screen Guard for All Phone Brands" : `${sType === "laptop" ? "Laptop" : "Mobile"} Repair Services`}
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              {isScreenGuard
                ? "Choose your phone brand below and get premium screen protection installed at your doorstep. We cover all major brands."
                : "Select your device brand to explore our professional repair services with doorstep convenience."}
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-16">
              {search ? "No brands match your search" : "No brands available yet"}
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
              {filtered.map((brand, i) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.02 }}
                >
                  <Link
                    to={`${basePath}/${brand.id}`}
                    className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-card border border-border shadow-card-brand hover:shadow-elevated-brand hover:border-primary/30 active:scale-95 transition-all cursor-pointer"
                  >
                    {brand.image_url ? (
                      <img src={brand.image_url} alt={`${brand.name} screen guard`} className="w-12 h-12 rounded-xl object-contain" />
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

          {/* SEO Content Section */}
          <div className="mt-12 max-w-2xl">
            <h2 className="text-lg font-extrabold text-foreground mb-4">Why Choose Looplic?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Premium Quality</h3>
                  <p className="text-xs text-muted-foreground mt-1">Top-grade materials with no-bubble guarantee</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">30-Min Service</h3>
                  <p className="text-xs text-muted-foreground mt-1">Quick doorstep installation</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border">
                <Star className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">4.8★ Rated</h3>
                  <p className="text-xs text-muted-foreground mt-1">Trusted by 2000+ customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrandsPage;

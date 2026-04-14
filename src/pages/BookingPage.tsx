import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Loader2, ChevronRight, Shield, Check, Phone, User, MapPin, Hash, Wrench } from "lucide-react";
import { toast } from "sonner";

type Guard = { id: string; guard_type: string; price: number };
type RepairCategory = { id: string; name: string; image_url: string | null };
type RepairSubcategory = { id: string; category_id: string; name: string; image_url: string | null; price: number };
type Breadcrumb = { brandName: string; seriesName: string; modelName: string };

const displayGuardType = (guardType: string) => {
  const parts = guardType.split(" - ");
  return parts.length > 1 ? parts.slice(1).join(" - ") : guardType;
};

const guardIcons: Record<string, string> = {
  "Tempered Glass": "🛡️", "Privacy Guard": "👁️", "Privacy": "👁️",
  "Matte Guard": "☀️", "Matte": "☀️", "UV Glass": "✨",
  "Ceramic Guard": "💎", "11D": "🛡️",
};

const BookingPage = () => {
  const { brandId, seriesId, modelId, serviceType } = useParams();
  const { user } = useAuth();
  const [bc, setBc] = useState<Breadcrumb>({ brandName: "...", seriesName: "...", modelName: "..." });
  const [guards, setGuards] = useState<Guard[]>([]);
  const [repairCategories, setRepairCategories] = useState<RepairCategory[]>([]);
  const [repairSubs, setRepairSubs] = useState<RepairSubcategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null);
  const [selectedSub, setSelectedSub] = useState<RepairSubcategory | null>(null);

  // Booking form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  const isRepair = serviceType === "mobile-repair" || serviceType === "laptop-repair";
  const repairServiceType = serviceType === "laptop-repair" ? "laptop" : "mobile";

  useEffect(() => {
    if (!brandId || !seriesId || !modelId) return;
    const promises: Promise<any>[] = [
      supabase.from("brands").select("name").eq("id", brandId).single(),
      supabase.from("series").select("name").eq("id", seriesId).single(),
      supabase.from("models").select("name").eq("id", modelId).single(),
    ];

    if (isRepair) {
      promises.push(
        (supabase.from("repair_categories") as any).select("*").eq("service_type", repairServiceType).order("name")
      );
    } else {
      promises.push(
        supabase.from("model_screen_guards").select("id, guard_type, price").eq("model_id", modelId).order("guard_type")
      );
    }

    Promise.all(promises).then(([brandRes, seriesRes, modelRes, dataRes]) => {
      setBc({
        brandName: brandRes.data?.name || "...",
        seriesName: seriesRes.data?.name || "...",
        modelName: modelRes.data?.name || "...",
      });
      if (isRepair) {
        if (dataRes.data) setRepairCategories(dataRes.data);
      } else {
        if (dataRes.data) setGuards(dataRes.data);
      }
      setLoading(false);
    });
  }, [brandId, seriesId, modelId, isRepair, repairServiceType]);

  // Fetch subcategories when a repair category is selected
  useEffect(() => {
    if (!selectedCat) { setRepairSubs([]); return; }
    (supabase.from("repair_subcategories") as any).select("*").eq("category_id", selectedCat).order("name")
      .then(({ data }: any) => { if (data) setRepairSubs(data); });
  }, [selectedCat]);

  const selectedItemLabel = isRepair
    ? selectedSub?.name || ""
    : displayGuardType(selectedGuard?.guard_type || "");
  const selectedPrice = isRepair ? selectedSub?.price : selectedGuard?.price;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    if (phone.trim().length < 10) { toast.error("Please enter a valid phone number"); return; }

    setSubmitting(true);
    const insertData: any = {
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      model_id: modelId!,
      location: location.trim() || null,
      pincode: pincode.trim() || null,
      service_type: isRepair ? repairServiceType + "_repair" : "screen_guard",
    };
    if (isRepair && selectedSub) {
      insertData.repair_category_id = selectedCat;
      insertData.repair_subcategory_id = selectedSub.id;
    } else if (selectedGuard) {
      insertData.guard_type = selectedGuard.guard_type;
    }
    if (user) insertData.user_id = user.id;
    const { error } = await supabase.from("bookings").insert(insertData);

    if (error) { toast.error("Booking failed. Please try again."); }
    else { setBooked(true); toast.success("Booking confirmed!"); }
    setSubmitting(false);
  };

  const basePath = serviceType ? `/service/${serviceType}` : "";

  if (booked) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground mb-2">Booking Confirmed! 🎉</h2>
            <p className="text-sm text-muted-foreground mb-1">
              {selectedItemLabel} for <strong>{bc.modelName}</strong>
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              We'll contact you at <strong>{phone}</strong> to confirm your slot.
            </p>
            <Link to="/" className="inline-block px-6 py-3 rounded-2xl gradient-brand text-primary-foreground text-sm font-bold">
              Back to Home
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mb-5 flex-wrap">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`${basePath}/brands`} className="hover:text-foreground transition-colors">Brands</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`${basePath}/brands/${brandId}`} className="hover:text-foreground transition-colors">{bc.brandName}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`${basePath}/brands/${brandId}/${seriesId}`} className="hover:text-foreground transition-colors">{bc.seriesName}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{bc.modelName}</span>
          </div>

          <h1 className="text-xl font-extrabold text-foreground mb-1">
            {isRepair ? "Choose Repair Service" : "Choose Screen Guard"}
          </h1>
          <p className="text-xs text-muted-foreground mb-5">
            for <span className="font-bold text-foreground">{bc.brandName} {bc.modelName}</span>
          </p>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : isRepair ? (
            /* ─── Repair Flow ─── */
            <>
              {repairCategories.length === 0 ? (
                <div className="text-center py-16">
                  <Wrench className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground font-semibold">No repair services available</p>
                </div>
              ) : (
                <>
                  {/* Category selection */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                    {repairCategories.map((cat, i) => (
                      <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.05 }}
                        onClick={() => { setSelectedCat(cat.id); setSelectedSub(null); setShowForm(false); }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                          selectedCat === cat.id
                            ? "border-primary bg-primary/5 shadow-elevated-brand"
                            : "border-border bg-card shadow-card-brand hover:border-primary/30"
                        }`}
                      >
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-xl object-contain" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <span className="text-xs font-bold text-foreground text-center">{cat.name}</span>
                        {selectedCat === cat.id && (
                          <div className="w-4 h-4 rounded-full gradient-brand flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Subcategories */}
                  {selectedCat && (
                    <div className="space-y-2.5 mb-6">
                      <h3 className="text-sm font-bold text-foreground">Select Service</h3>
                      {repairSubs.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">No services available in this category</p>
                      ) : repairSubs.map((sub, i) => {
                        const isSelected = selectedSub?.id === sub.id;
                        return (
                          <motion.button
                            key={sub.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: i * 0.05 }}
                            onClick={() => { setSelectedSub(sub); setShowForm(true); }}
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-elevated-brand"
                                : "border-border bg-card shadow-card-brand hover:border-primary/30"
                            }`}
                          >
                            {sub.image_url ? (
                              <img src={sub.image_url} alt={sub.name} className="w-10 h-10 rounded-xl object-contain flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                                <Wrench className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <span className="text-sm font-bold text-foreground">{sub.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-extrabold gradient-brand-text">₹{sub.price}</span>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            /* ─── Screen Guard Flow ─── */
            <>
              {guards.length === 0 ? (
                <div className="text-center py-16">
                  <Shield className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground font-semibold">No screen guards available for this model</p>
                  <p className="text-xs text-muted-foreground mt-1">Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-2.5 mb-6">
                  {guards.map((g, i) => {
                    const isSelected = selectedGuard?.id === g.id;
                    return (
                      <motion.button
                        key={g.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.05 }}
                        onClick={() => { setSelectedGuard(g); setShowForm(true); }}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-elevated-brand"
                            : "border-border bg-card shadow-card-brand hover:border-primary/30"
                        }`}
                      >
                        <span className="text-2xl">{guardIcons[displayGuardType(g.guard_type)] || "🛡️"}</span>
                        <div className="flex-1">
                          <span className="text-sm font-bold text-foreground">{displayGuardType(g.guard_type)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-extrabold gradient-brand-text">₹{g.price}</span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Booking Form */}
          {showForm && (isRepair ? selectedSub : selectedGuard) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-card border border-border shadow-elevated-brand"
            >
              <h3 className="text-sm font-extrabold text-foreground mb-1">Book {isRepair ? "Repair" : "Installation"}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {selectedItemLabel} — <span className="font-bold text-primary">₹{selectedPrice}</span>
              </p>

              <form onSubmit={handleBook} className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={15}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Location / Address" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={200}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={10}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <button type="submit" disabled={submitting || !name.trim() || !phone.trim()}
                  className="w-full py-3.5 rounded-2xl gradient-brand text-primary-foreground text-sm font-extrabold disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? "Booking..." : `Book Now — ₹${selectedPrice}`}
                </button>
              </form>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                {isRepair ? "Professional repair at your doorstep" : "Free doorstep installation • No-bubble guarantee"}
              </p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;

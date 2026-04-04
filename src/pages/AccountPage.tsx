import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Loader2, LogOut, User, CalendarCheck, Clock, CheckCircle2, XCircle, Package, ChevronRight } from "lucide-react";

type Booking = {
  id: string;
  service_type: string;
  guard_type: string | null;
  status: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  location: string | null;
  model_id: string | null;
  notes: string | null;
  // joined
  model_name?: string;
  brand_name?: string;
};

const statusTabs = [
  { id: "all", label: "All", icon: Package },
  { id: "pending", label: "Booked", icon: CalendarCheck },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { id: "in_progress", label: "In Progress", icon: Clock },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
  { id: "cancelled", label: "Cancelled", icon: XCircle },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const AccountPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?redirect=/account", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      setLoadingBookings(true);
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        // Enrich with model/brand names
        const enriched = await Promise.all(
          data.map(async (b: any) => {
            let model_name = "";
            let brand_name = "";
            if (b.model_id) {
              const { data: model } = await supabase.from("models").select("name, series_id").eq("id", b.model_id).single();
              if (model) {
                model_name = model.name;
                const { data: series } = await supabase.from("series").select("brand_id").eq("id", model.series_id).single();
                if (series) {
                  const { data: brand } = await supabase.from("brands").select("name").eq("id", series.brand_id).single();
                  brand_name = brand?.name || "";
                }
              }
            }
            return { ...b, model_name, brand_name };
          })
        );
        setBookings(enriched);
      }
      setLoadingBookings(false);
    };
    fetchBookings();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const filteredBookings = activeTab === "all" ? bookings : bookings.filter((b) => b.status === activeTab);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-6">
          {/* Profile header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-foreground">
                  {user.user_metadata?.full_name || "My Account"}
                </h1>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>

          {/* Status tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {statusTabs.map((tab) => {
              const count = tab.id === "all" ? bookings.length : bookings.filter((b) => b.status === tab.id).length;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "gradient-brand text-primary-foreground shadow-md"
                      : "bg-card border border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {count > 0 && (
                    <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-white/20" : "bg-secondary"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bookings list */}
          {loadingBookings ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16">
              <CalendarCheck className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-semibold">
                {activeTab === "all" ? "No bookings yet" : `No ${statusTabs.find((t) => t.id === activeTab)?.label.toLowerCase()} bookings`}
              </p>
              <Link to="/" className="inline-block mt-4 text-xs font-bold text-primary">
                Browse Services <ChevronRight className="w-3 h-3 inline" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredBookings.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="p-4 rounded-2xl bg-card border border-border shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {b.brand_name} {b.model_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {b.service_type === "screen_guard" ? "Screen Guard" : b.service_type === "mobile" ? "Mobile Repair" : "Laptop Repair"}
                        {b.guard_type && ` — ${b.guard_type}`}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColors[b.status] || "bg-secondary text-foreground"}`}>
                      {b.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {b.location && (
                      <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                        📍 {b.location}
                      </p>
                    )}
                  </div>
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

export default AccountPage;

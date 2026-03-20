import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2, Eye, X, MapPin, Smartphone, Shield, Phone } from "lucide-react";
import { toast } from "sonner";

type Booking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  guard_type: string | null;
  status: string;
  notes: string | null;
  location: string | null;
  pincode: string | null;
  created_at: string;
  model_id: string | null;
};

type BookingDetail = Booking & {
  modelName?: string;
  seriesName?: string;
  brandName?: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const BookingsTab = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setBookings(data as Booking[]);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const openDetail = async (booking: Booking) => {
    setLoadingDetail(true);
    setDetail(booking);

    // Fetch model → series → brand chain
    if (booking.model_id) {
      try {
        const { data: model } = await supabase.from("models").select("name, series_id").eq("id", booking.model_id).single();
        if (model) {
          const { data: series } = await supabase.from("series").select("name, brand_id").eq("id", model.series_id).single();
          let brandName = "";
          if (series) {
            const { data: brand } = await supabase.from("brands").select("name").eq("id", series.brand_id).single();
            brandName = brand?.name || "";
          }
          setDetail(prev => prev ? { ...prev, modelName: model.name, seriesName: series?.name || "", brandName } : prev);
        }
      } catch { /* ignore */ }
    }
    setLoadingDetail(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success("Status updated"); fetchBookings(); }
  };

  const deleteBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Booking deleted"); fetchBookings(); setDetail(null); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm font-semibold">No bookings yet</p>
        <p className="text-xs mt-1">Bookings from customers will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 space-y-2">
        {bookings.map((b) => (
          <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-foreground">{b.customer_name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[b.status] || "bg-secondary text-foreground"}`}>
                  {b.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {b.guard_type && <span className="text-[10px] text-primary font-bold">{b.guard_type}</span>}
                <span className="text-[10px] text-muted-foreground">
                  {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <select
                value={b.status}
                onChange={(e) => updateStatus(b.id, e.target.value)}
                className="text-[10px] border border-border rounded-lg px-1.5 py-1 bg-card text-foreground focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button onClick={() => openDetail(b)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => deleteBooking(b.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setDetail(null)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border shadow-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card rounded-t-3xl sm:rounded-t-2xl z-10">
              <span className="text-sm font-bold text-foreground">Booking Details</span>
              <button onClick={() => setDetail(null)} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              {/* Customer Info */}
              <div className="p-3 rounded-xl bg-secondary/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Customer</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[detail.status]}`}>{detail.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">{detail.customer_name}</span>
                  <a href={`tel:${detail.customer_phone}`} className="flex items-center gap-1 text-xs font-bold text-primary">
                    <Phone className="w-3 h-3" /> {detail.customer_phone}
                  </a>
                </div>
              </div>

              {/* Device Info */}
              <div className="p-3 rounded-xl bg-secondary/50 space-y-2">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Device & Guard</span>
                {loadingDetail ? (
                  <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
                ) : (
                  <>
                    {detail.brandName && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-semibold">Brand</span>
                        <span className="text-sm font-bold text-foreground">{detail.brandName}</span>
                      </div>
                    )}
                    {detail.seriesName && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-semibold">Series</span>
                        <span className="text-sm font-semibold text-foreground">{detail.seriesName}</span>
                      </div>
                    )}
                    {detail.modelName && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1"><Smartphone className="w-3 h-3" /> Model</span>
                        <span className="text-sm font-bold text-foreground">{detail.modelName}</span>
                      </div>
                    )}
                    {!detail.brandName && !detail.modelName && (
                      <p className="text-xs text-muted-foreground">No device info available</p>
                    )}
                  </>
                )}
                {detail.guard_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1"><Shield className="w-3 h-3" /> Guard Type</span>
                    <span className="text-sm font-bold text-primary">{detail.guard_type}</span>
                  </div>
                )}
              </div>

              {/* Location Info */}
              {(detail.location || detail.pincode) && (
                <div className="p-3 rounded-xl bg-secondary/50 space-y-2">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Location</span>
                  {detail.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</span>
                      <span className="text-sm font-semibold text-foreground text-right max-w-[60%]">{detail.location}</span>
                    </div>
                  )}
                  {detail.pincode && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-semibold">Pincode</span>
                      <span className="text-sm font-semibold text-foreground">{detail.pincode}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Time */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-muted-foreground font-semibold">Booked</span>
                <span className="text-xs text-muted-foreground">{new Date(detail.created_at).toLocaleString("en-IN")}</span>
              </div>

              {detail.notes && (
                <div className="px-1">
                  <span className="text-xs text-muted-foreground font-semibold">Notes</span>
                  <p className="text-sm text-foreground mt-0.5">{detail.notes}</p>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <a href={`tel:${detail.customer_phone}`} className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Call Customer
                </a>
                <a href={`https://wa.me/91${detail.customer_phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl border-2 border-green-500 text-green-600 text-xs font-bold hover:bg-green-50 transition-colors">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingsTab;

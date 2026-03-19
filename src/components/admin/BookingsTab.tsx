import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2, Eye, X, MapPin } from "lucide-react";
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

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const BookingsTab = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setBookings(data as Booking[]);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

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
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
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
              <button onClick={() => setDetail(b)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
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
          <div className="relative bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-sm font-bold text-foreground">Booking Details</span>
              <button onClick={() => setDetail(null)} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">Customer</span>
                <span className="text-sm font-bold text-foreground">{detail.customer_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">Phone</span>
                <a href={`tel:${detail.customer_phone}`} className="text-sm font-bold text-primary">{detail.customer_phone}</a>
              </div>
              {detail.guard_type && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold">Guard Type</span>
                  <span className="text-sm font-semibold text-foreground">{detail.guard_type}</span>
                </div>
              )}
              {detail.location && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1"><MapPin className="w-3 h-3" />Location</span>
                  <span className="text-sm font-semibold text-foreground text-right max-w-[60%]">{detail.location}</span>
                </div>
              )}
              {detail.pincode && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold">Pincode</span>
                  <span className="text-sm font-semibold text-foreground">{detail.pincode}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">Status</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[detail.status]}`}>{detail.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">Booked</span>
                <span className="text-xs text-muted-foreground">{new Date(detail.created_at).toLocaleString("en-IN")}</span>
              </div>

              <div className="pt-2 flex gap-2">
                <a href={`tel:${detail.customer_phone}`} className="flex-1 py-2.5 rounded-xl gradient-brand text-primary-foreground text-xs font-bold text-center">
                  Call Customer
                </a>
                <button onClick={() => deleteBooking(detail.id)} className="px-4 py-2.5 rounded-xl border border-destructive text-destructive text-xs font-bold hover:bg-destructive/10">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingsTab;

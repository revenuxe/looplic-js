import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Booking = {
  id: string;
  customer_name: string;
  customer_phone: string;
  guard_type: string | null;
  status: string;
  notes: string | null;
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

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setBookings(data);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error("Failed to update");
    else {
      toast.success("Status updated");
      fetchBookings();
    }
  };

  const deleteBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Booking deleted");
      fetchBookings();
    }
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
    <div className="mt-4 space-y-3">
      {bookings.map((b) => (
        <div key={b.id} className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-foreground">{b.customer_name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[b.status] || "bg-secondary text-foreground"}`}>
                {b.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{b.customer_phone}</p>
            {b.guard_type && <p className="text-xs text-muted-foreground">Guard: {b.guard_type}</p>}
            <p className="text-[10px] text-muted-foreground mt-1">
              {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={b.status}
              onChange={(e) => updateStatus(b.id, e.target.value)}
              className="text-xs border border-border rounded-lg px-2 py-1.5 bg-card text-foreground focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => deleteBooking(b.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingsTab;

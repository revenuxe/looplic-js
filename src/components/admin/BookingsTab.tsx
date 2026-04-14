import { useEffect, useMemo, useState } from "react";
import { Eye, Loader2, MapPin, Phone, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/src/components/ui/input";
import { formatBookingServiceType, formatBookingStatus, type BookingRow } from "@/src/lib/bookings";
import { createClient } from "@/src/lib/supabase/client";

type BookingView = BookingRow & {
  brand_name: string;
  model_name: string;
  repair_category_name: string;
  repair_subcategory_name: string;
};

const statusColors: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  confirmed: "border-sky-200 bg-sky-50 text-sky-800",
  in_progress: "border-violet-200 bg-violet-50 text-violet-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-rose-200 bg-rose-50 text-rose-800",
};

const BookingsTab = () => {
  const supabase = createClient();
  const [bookings, setBookings] = useState<BookingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [detail, setDetail] = useState<BookingView | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  async function fetchBookings() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) {
      setBookings([]);
      setErrorMessage(error.message || "Failed to load bookings.");
      setLoading(false);
      return;
    }

    const rows = (data || []) as BookingRow[];
    if (!rows.length) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const modelIds = [...new Set(rows.map((booking) => booking.model_id).filter(Boolean))] as string[];
    const repairCategoryIds = [...new Set(rows.map((booking) => booking.repair_category_id).filter(Boolean))] as string[];
    const repairSubcategoryIds = [...new Set(rows.map((booking) => booking.repair_subcategory_id).filter(Boolean))] as string[];

    const [{ data: models }, { data: repairCategories }, { data: repairSubcategories }] = await Promise.all([
      modelIds.length
        ? supabase.from("models").select("id, name, series_id").in("id", modelIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string; series_id: string }> }),
      repairCategoryIds.length
        ? supabase.from("repair_categories").select("id, name").in("id", repairCategoryIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
      repairSubcategoryIds.length
        ? supabase.from("repair_subcategories").select("id, name").in("id", repairSubcategoryIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
    ]);

    const modelMap = new Map((models || []).map((model) => [model.id, model]));
    const seriesIds = [...new Set((models || []).map((model) => model.series_id).filter(Boolean))];
    const { data: seriesRows } = seriesIds.length
      ? await supabase.from("series").select("id, brand_id").in("id", seriesIds)
      : { data: [] as Array<{ id: string; brand_id: string }> };
    const seriesMap = new Map((seriesRows || []).map((series) => [series.id, series]));
    const brandIds = [...new Set((seriesRows || []).map((series) => series.brand_id).filter(Boolean))];
    const { data: brandRows } = brandIds.length
      ? await supabase.from("brands").select("id, name").in("id", brandIds)
      : { data: [] as Array<{ id: string; name: string }> };

    const brandMap = new Map((brandRows || []).map((brand) => [brand.id, brand.name]));
    const repairCategoryMap = new Map((repairCategories || []).map((category) => [category.id, category.name]));
    const repairSubcategoryMap = new Map((repairSubcategories || []).map((subcategory) => [subcategory.id, subcategory.name]));

    setBookings(
      rows.map((booking) => {
        const model = booking.model_id ? modelMap.get(booking.model_id) : undefined;
        const series = model ? seriesMap.get(model.series_id) : undefined;
        return {
          ...booking,
          brand_name: series ? brandMap.get(series.brand_id) || "" : "",
          model_name: model?.name || "",
          repair_category_name: booking.repair_category_id ? repairCategoryMap.get(booking.repair_category_id) || "" : "",
          repair_subcategory_name: booking.repair_subcategory_id ? repairSubcategoryMap.get(booking.repair_subcategory_id) || "" : "",
        };
      }),
    );
    setLoading(false);
  }

  useEffect(() => {
    fetchBookings();
    const channel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchBookings)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      const matchesService = serviceFilter === "all" || booking.service_type === serviceFilter;
      const matchesSearch =
        !query ||
        [booking.booking_code, booking.customer_name, booking.customer_phone, booking.brand_name, booking.model_name, booking.location, booking.guard_type]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query));
      return matchesStatus && matchesService && matchesSearch;
    });
  }, [bookings, searchQuery, serviceFilter, statusFilter]);

  async function updateStatus(id: string, status: string) {
    setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
    setDetail((current) => (current && current.id === id ? { ...current, status } : current));
    const { error } = await supabase.from("bookings").update({ status } as never).eq("id", id);
    if (error) {
      toast.error(error.message || "Failed to update booking status.");
      fetchBookings();
      return;
    }
    toast.success("Booking status updated.");
  }

  async function deleteBooking(id: string) {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      toast.error(error.message || "Failed to delete booking.");
      return;
    }
    toast.success("Booking deleted.");
    setDetail(null);
    fetchBookings();
  }

  const stats = [
    { label: "Total", value: bookings.length },
    { label: "Active", value: bookings.filter((booking) => ["pending", "confirmed", "in_progress"].includes(booking.status)).length },
    { label: "Completed", value: bookings.filter((booking) => booking.status === "completed").length },
  ];

  return (
    <>
      <div className="mt-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</div>
              <div className="mt-2 text-2xl font-black text-foreground">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by order code, customer, phone, device, or address" className="pl-9" />
            </div>
            <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
              <option value="all">All services</option>
              <option value="screen_guard">Screen Guard</option>
              <option value="mobile_repair">Mobile Repair</option>
              <option value="laptop_repair">Laptop Repair</option>
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : null}
        {!loading && errorMessage ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700">{errorMessage}</div> : null}
        {!loading && !errorMessage && filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-muted-foreground">
            <p className="text-sm font-semibold text-foreground">{bookings.length === 0 ? "No bookings yet" : "No bookings match these filters"}</p>
            <p className="mt-1 text-xs">New customer orders will appear here automatically.</p>
          </div>
        ) : null}

        {!loading && !errorMessage && filteredBookings.length > 0 ? (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{booking.booking_code || "Pending code"}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusColors[booking.status] || "border-border bg-secondary text-foreground"}`}>{formatBookingStatus(booking.status)}</span>
                    </div>
                    <div className="text-base font-black text-foreground">{booking.customer_name}</div>
                    <div className="text-sm text-muted-foreground">{formatBookingServiceType(booking.service_type)} • {[booking.brand_name, booking.model_name].filter(Boolean).join(" ") || "Device pending"}</div>
                    <div className="text-xs text-muted-foreground">{booking.scheduled_date ? `${new Date(booking.scheduled_date).toLocaleDateString("en-IN")} • ${booking.time_slot || "No slot"}` : new Date(booking.created_at).toLocaleString("en-IN")}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={booking.status} onChange={(event) => updateStatus(booking.id, event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button type="button" onClick={() => setDetail(booking)} className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-primary">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => deleteBooking(booking.id)} className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {detail ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={() => setDetail(null)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border border-border bg-card shadow-xl sm:max-w-xl sm:rounded-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card p-4">
              <div>
                <div className="text-sm font-black text-foreground">{detail.booking_code || detail.id}</div>
                <div className="text-xs text-muted-foreground">{formatBookingServiceType(detail.service_type)}</div>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-4">
              <div className="rounded-2xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-black text-foreground">{detail.customer_name}</div>
                    <div className="text-sm text-muted-foreground">{[detail.brand_name, detail.model_name].filter(Boolean).join(" ") || "Device pending"}</div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusColors[detail.status] || "border-border bg-secondary text-foreground"}`}>{formatBookingStatus(detail.status)}</span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 p-4 text-sm"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Phone</div><a href={`tel:${detail.customer_phone}`} className="mt-2 inline-flex items-center gap-2 font-semibold text-primary"><Phone className="h-4 w-4" />{detail.customer_phone}</a></div>
                <div className="rounded-2xl border border-border/70 p-4 text-sm"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Schedule</div><div className="mt-2 font-semibold text-foreground">{detail.scheduled_date ? `${new Date(detail.scheduled_date).toLocaleDateString("en-IN")} • ${detail.time_slot || "No slot"}` : "Not scheduled yet"}</div></div>
              </div>
              <div className="rounded-2xl border border-border/70 p-4 text-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Address</div>
                <div className="mt-2 flex items-start gap-2 text-foreground"><MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" /><span>{detail.location || "No address saved"}</span></div>
                <div className="mt-2 text-muted-foreground">{detail.pincode ? `Pincode ${detail.pincode}` : ""}</div>
              </div>
              <div className="rounded-2xl border border-border/70 p-4 text-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Service details</div>
                <div className="mt-2 text-foreground">{detail.guard_type || detail.repair_subcategory_name || detail.repair_category_name || formatBookingServiceType(detail.service_type)}</div>
                <div className="mt-2 text-muted-foreground">Booked on {new Date(detail.created_at).toLocaleString("en-IN")}</div>
                {detail.notes ? <div className="mt-2 text-muted-foreground">{detail.notes}</div> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default BookingsTab;


"use client";

import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  LogOut,
  MapPin,
  Package,
  PencilLine,
  Phone,
  Save,
  Search,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { isValidPhoneNumber, isValidPincode, type BookingRow } from "@/src/lib/bookings";
import { buildCustomerProfileInsert, type CustomerProfile } from "@/src/lib/profile";
import { createClient } from "@/src/lib/supabase/client";

type AccountBooking = {
  booking_code: string | null;
  id: string;
  service_type: string;
  guard_type: string | null;
  status: string;
  created_at: string;
  location: string | null;
  scheduled_date: string | null;
  time_slot: string | null;
  model_id: string | null;
  repair_category_id: string | null;
  repair_subcategory_id: string | null;
  notes: string | null;
  pincode: string | null;
  model_name: string;
  brand_name: string;
  repair_category_name: string;
  repair_subcategory_name: string;
};

const statusTabs = [
  { id: "all", label: "All Orders", icon: Package },
  { id: "pending", label: "Booked", icon: CalendarCheck },
  { id: "confirmed", label: "Confirmed", icon: ShieldCheck },
  { id: "in_progress", label: "In Progress", icon: Clock3 },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
  { id: "cancelled", label: "Cancelled", icon: XCircle },
] as const;

const statusColors: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  confirmed: "border-sky-200 bg-sky-50 text-sky-800",
  in_progress: "border-violet-200 bg-violet-50 text-violet-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-rose-200 bg-rose-50 text-rose-800",
};

type ProfileFormState = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

function createProfileForm(profile: CustomerProfile | null, user: SupabaseUser | null): ProfileFormState {
  return {
    fullName: profile?.full_name || user?.user_metadata?.full_name || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    city: profile?.city || "",
    pincode: profile?.pincode || "",
  };
}

function formatServiceType(serviceType: string) {
  if (serviceType === "screen_guard") return "Screen Guard";
  if (serviceType === "mobile_repair") return "Mobile Repair";
  if (serviceType === "laptop_repair") return "Laptop Repair";
  return serviceType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getBookingTitle(booking: AccountBooking) {
  const title = [booking.brand_name, booking.model_name].filter(Boolean).join(" ");
  return title || "Device booking";
}

function getBookingDescriptor(booking: AccountBooking) {
  if (booking.service_type === "screen_guard") {
    return booking.guard_type ? `Screen Guard • ${booking.guard_type}` : "Screen Guard";
  }

  if (booking.repair_subcategory_name) {
    return `${formatServiceType(booking.service_type)} • ${booking.repair_subcategory_name}`;
  }

  if (booking.repair_category_name) {
    return `${formatServiceType(booking.service_type)} • ${booking.repair_category_name}`;
  }

  return formatServiceType(booking.service_type);
}

function canCancelBooking(booking: AccountBooking) {
  return booking.status === "pending";
}

export function AccountPageClient() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [bookings, setBookings] = useState<AccountBooking[]>([]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(createProfileForm(null, null));
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);
  const [bookingActionError, setBookingActionError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;

      if (ignore) {
        return;
      }

      if (!currentUser) {
        router.replace("/auth?redirect=/account");
        return;
      }

      setUser(currentUser);
      setLoadingUser(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (ignore) {
        return;
      }

      const currentUser = session?.user ?? null;
      if (!currentUser) {
        router.replace("/auth?redirect=/account");
        return;
      }

      setUser(currentUser);
      setLoadingUser(false);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  useEffect(() => {
    let ignore = false;

    async function loadBookings() {
      if (!user) {
        return;
      }

      setLoadingBookings(true);
      const [{ data }, { data: profileData }] = await Promise.all([
        supabase.from("bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("customer_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      if (ignore) {
        return;
      }

      const currentProfile = (profileData as CustomerProfile | null) ?? null;
      setProfile(currentProfile);
      setProfileForm((currentForm) => (editingProfile ? currentForm : createProfileForm(currentProfile, user)));

      const bookingRows = (data || []) as BookingRow[];

      if (!bookingRows.length) {
        setBookings([]);
        setLoadingBookings(false);
        return;
      }

      const modelIds = [...new Set(bookingRows.map((booking) => booking.model_id).filter(Boolean))] as string[];
      const repairCategoryIds = [...new Set(bookingRows.map((booking) => booking.repair_category_id).filter(Boolean))] as string[];
      const repairSubcategoryIds = [...new Set(bookingRows.map((booking) => booking.repair_subcategory_id).filter(Boolean))] as string[];

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
      const { data: seriesRows } =
        seriesIds.length ? await supabase.from("series").select("id, brand_id").in("id", seriesIds) : { data: [] as Array<{ id: string; brand_id: string }> };
      const seriesMap = new Map((seriesRows || []).map((series) => [series.id, series]));
      const brandIds = [...new Set((seriesRows || []).map((series) => series.brand_id).filter(Boolean))];
      const { data: brandRows } =
        brandIds.length ? await supabase.from("brands").select("id, name").in("id", brandIds) : { data: [] as Array<{ id: string; name: string }> };
      const brandMap = new Map((brandRows || []).map((brand) => [brand.id, brand]));
      const repairCategoryMap = new Map((repairCategories || []).map((category) => [category.id, category.name]));
      const repairSubcategoryMap = new Map((repairSubcategories || []).map((subcategory) => [subcategory.id, subcategory.name]));

      const enriched = bookingRows.map((booking) => {
        const model = booking.model_id ? modelMap.get(booking.model_id) : undefined;
        const series = model ? seriesMap.get(model.series_id) : undefined;
        const brand = series ? brandMap.get(series.brand_id) : undefined;

        return {
          ...booking,
          brand_name: brand?.name || "",
          model_name: model?.name || "",
          repair_category_name: booking.repair_category_id ? repairCategoryMap.get(booking.repair_category_id) || "" : "",
          repair_subcategory_name: booking.repair_subcategory_id ? repairSubcategoryMap.get(booking.repair_subcategory_id) || "" : "",
        };
      });

      if (!ignore) {
        setBookings(enriched);
        setLoadingBookings(false);
      }
    }

    if (!user?.id) {
      return () => {
        ignore = true;
      };
    }

    loadBookings();

    const bookingsChannel = supabase
      .channel(`account-bookings-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${user.id}` }, loadBookings)
      .subscribe();

    const profilesChannel = supabase
      .channel(`account-profiles-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "customer_profiles", filter: `user_id=eq.${user.id}` }, loadBookings)
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [editingProfile, supabase, user]);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus = activeTab === "all" || booking.status === activeTab;
      const matchesQuery =
        !normalizedQuery ||
        [
          booking.id,
          booking.brand_name,
          booking.model_name,
          booking.location,
          booking.guard_type,
          booking.repair_category_name,
          booking.repair_subcategory_name,
          formatServiceType(booking.service_type),
          formatStatus(booking.status),
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedQuery));

      return matchesStatus && matchesQuery;
    });
  }, [activeTab, bookings, searchQuery]);

  const dashboardStats = useMemo(
    () => [
      { label: "Total orders", value: bookings.length, hint: "All bookings synced live", icon: Package },
      {
        label: "Active orders",
        value: bookings.filter((booking) => ["pending", "confirmed", "in_progress"].includes(booking.status)).length,
        hint: "Booked, confirmed, or in service",
        icon: Clock3,
      },
      {
        label: "Upcoming visits",
        value: bookings.filter((booking) => booking.scheduled_date && !["completed", "cancelled"].includes(booking.status)).length,
        hint: "Orders with a scheduled slot",
        icon: CalendarCheck,
      },
      {
        label: "Completed",
        value: bookings.filter((booking) => booking.status === "completed").length,
        hint: "Finished orders in your history",
        icon: CheckCircle2,
      },
    ],
    [bookings],
  );

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  function handleProfileChange(field: keyof ProfileFormState, value: string) {
    setProfileError("");
    setProfileSuccess("");
    setProfileForm((current) => ({ ...current, [field]: value }));
  }

  function startEditingProfile() {
    setProfileError("");
    setProfileSuccess("");
    setProfileForm(createProfileForm(profile, user));
    setEditingProfile(true);
  }

  function cancelEditingProfile() {
    setProfileError("");
    setProfileSuccess("");
    setProfileForm(createProfileForm(profile, user));
    setEditingProfile(false);
  }

  async function handleSaveProfile() {
    if (!user) return;

    const trimmed = Object.fromEntries(Object.entries(profileForm).map(([key, value]) => [key, value.trim()])) as ProfileFormState;

    if (!trimmed.fullName) {
      setProfileError("Please enter your full name.");
      return;
    }
    if (trimmed.phone && !isValidPhoneNumber(trimmed.phone)) {
      setProfileError("Please enter a valid phone number.");
      return;
    }
    if (trimmed.pincode && !isValidPincode(trimmed.pincode)) {
      setProfileError("Please enter a valid 6-digit pincode.");
      return;
    }

    setSavingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    const payload = buildCustomerProfileInsert({
      userId: user.id,
      fullName: trimmed.fullName,
      phone: trimmed.phone,
      address: trimmed.address,
      city: trimmed.city,
      pincode: trimmed.pincode,
    });

    const [{ error: profileSaveError }, { error: authUpdateError }] = await Promise.all([
      supabase.from("customer_profiles").upsert(payload as any, { onConflict: "user_id" }),
      supabase.auth.updateUser({ data: { full_name: trimmed.fullName } }),
    ]);

    if (profileSaveError || authUpdateError) {
      setProfileError(profileSaveError?.message || authUpdateError?.message || "We couldn't save your profile right now.");
      setSavingProfile(false);
      return;
    }

    const nextProfile: CustomerProfile = {
      address: trimmed.address || null,
      city: trimmed.city || null,
      created_at: profile?.created_at || new Date().toISOString(),
      full_name: trimmed.fullName,
      phone: trimmed.phone || null,
      pincode: trimmed.pincode || null,
      updated_at: new Date().toISOString(),
      user_id: user.id,
    };

    setProfile(nextProfile);
    setProfileForm(createProfileForm(nextProfile, user));
    setProfileSuccess("Profile updated successfully.");
    setSavingProfile(false);
    setEditingProfile(false);
    router.refresh();
  }

  async function handleCancelBooking(bookingId: string) {
    if (!user) {
      return;
    }

    setBookingActionError("");
    setCancelingBookingId(bookingId);

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" } as never)
      .eq("id", bookingId)
      .eq("user_id", user.id)
      .eq("status", "pending");

    if (error) {
      setBookingActionError(error.message || "We couldn't cancel this booking right now.");
      setCancelingBookingId(null);
      return;
    }

    setBookings((current) => current.map((booking) => (booking.id === bookingId ? { ...booking, status: "cancelled" } : booking)));
    setCancelingBookingId(null);
  }

  if (loadingUser || !user) {
    return (
      <main className="flex min-h-[60vh] flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  const customerName = profile?.full_name || user.user_metadata?.full_name || "My Account";
  const statusCounts = new Map(statusTabs.map((tab) => [tab.id, tab.id === "all" ? bookings.length : bookings.filter((booking) => booking.status === tab.id).length]));

  return (
    <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.12),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0)_0%,_rgba(248,250,252,0.92)_100%)]">
      <div className="container max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:py-8">
        <section className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/70 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 py-5 text-white sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl min-w-0">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Orders Dashboard
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl md:text-3xl">{customerName}</h1>
                    <p className="truncate text-sm text-white/70">{user.email}</p>
                  </div>
                </div>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/75">
                  Track every booking, update your address fast, and cancel booked requests before they are confirmed.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/60">Primary contact</div>
                  <div className="mt-1 font-semibold text-white">{profile?.phone || "Add your phone number"}</div>
                </div>
                <Button variant="secondary" size="sm" onClick={handleSignOut} className="rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
            {dashboardStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-2xl font-black tracking-tight text-foreground">{stat.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground">
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.95fr]">
          <div className="order-2 space-y-4 xl:order-1">
            <div className="rounded-[24px] border border-border/70 bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-foreground">Your bookings</h2>
                    <p className="text-sm text-muted-foreground">Search orders, filter status, and manage bookings from your phone.</p>
                  </div>
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search orders" className="h-11 rounded-xl border-border/70 bg-background pl-9" />
                </div>

                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                  {statusTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                          isActive ? "border-transparent gradient-brand text-primary-foreground shadow-md" : "border-border/70 bg-background text-muted-foreground"
                        }`}
                      >
                        <tab.icon className="h-3.5 w-3.5" />
                        {tab.label}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${isActive ? "bg-white/20" : "bg-secondary text-foreground"}`}>{statusCounts.get(tab.id) || 0}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {bookingActionError ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{bookingActionError}</p> : null}

            {loadingBookings ? (
              <div className="flex justify-center rounded-[24px] border border-border/70 bg-card py-20 shadow-sm">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
                <CalendarCheck className="mx-auto mb-4 h-11 w-11 text-muted-foreground/35" />
                <p className="text-base font-semibold text-foreground">{activeTab === "all" && !searchQuery ? "No bookings yet" : "No orders match this view"}</p>
                <p className="mt-2 text-sm text-muted-foreground">Try another filter or book a new service to see it appear here.</p>
                <Link href="/" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Browse services
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <article key={booking.id} className="rounded-[24px] border border-border/70 bg-card p-4 shadow-sm">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{booking.booking_code || `#${booking.id.slice(0, 8).toUpperCase()}`}</span>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusColors[booking.status] || "border-border bg-secondary text-foreground"}`}>
                          {formatStatus(booking.status)}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-black tracking-tight text-foreground">{getBookingTitle(booking)}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{getBookingDescriptor(booking)}</p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border/70 bg-background p-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><CalendarCheck className="h-3.5 w-3.5" />Schedule</div>
                          <div className="mt-2 text-sm font-semibold text-foreground">{booking.scheduled_date ? formatDate(booking.scheduled_date) : "Scheduling pending"}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{booking.time_slot || "Time slot to be assigned"}</div>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background p-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><MapPin className="h-3.5 w-3.5" />Address</div>
                          <div className="mt-2 text-sm font-semibold text-foreground">{booking.location || "Address not saved yet"}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{booking.pincode ? `Pincode ${booking.pincode}` : "Add pincode in your profile"}</div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-background p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Timeline</div>
                            <div className="mt-2 text-sm font-semibold text-foreground">Booked on {formatDate(booking.created_at)}</div>
                            <div className="mt-1 text-sm text-muted-foreground">{booking.notes || "No additional notes were added to this order."}</div>
                          </div>
                          {canCancelBooking(booking) ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancelingBookingId === booking.id}
                              className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-700"
                            >
                              {cancelingBookingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                        {canCancelBooking(booking) ? <p className="mt-3 text-xs text-muted-foreground">You can cancel this booking until it is confirmed by the team.</p> : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="order-1 space-y-4 xl:order-2">
            <section className="rounded-[24px] border border-border/70 bg-card p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-foreground">Profile details</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Keep your contact info ready for faster confirmations.</p>
                </div>
                {!editingProfile ? (
                  <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={startEditingProfile}>
                    <PencilLine className="h-4 w-4" />
                    Edit
                  </Button>
                ) : null}
              </div>

              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Full name</label>
                    <Input value={profileForm.fullName} onChange={(event) => handleProfileChange("fullName", event.target.value)} disabled={!editingProfile} className="rounded-xl" placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Phone number</label>
                    <Input value={profileForm.phone} onChange={(event) => handleProfileChange("phone", event.target.value)} disabled={!editingProfile} className="rounded-xl" placeholder="10-digit phone number" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Address</label>
                  <Textarea value={profileForm.address} onChange={(event) => handleProfileChange("address", event.target.value)} disabled={!editingProfile} className="min-h-[96px] rounded-xl" placeholder="House, street, or landmark" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">City</label>
                    <Input value={profileForm.city} onChange={(event) => handleProfileChange("city", event.target.value)} disabled={!editingProfile} className="rounded-xl" placeholder="City" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Pincode</label>
                    <Input value={profileForm.pincode} onChange={(event) => handleProfileChange("pincode", event.target.value)} disabled={!editingProfile} className="rounded-xl" placeholder="6-digit pincode" />
                  </div>
                </div>
                {profileError ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{profileError}</p> : null}
                {profileSuccess ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{profileSuccess}</p> : null}

                {editingProfile ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="button" onClick={handleSaveProfile} disabled={savingProfile} className="rounded-xl sm:flex-1">
                      {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save profile
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEditingProfile} disabled={savingProfile} className="rounded-xl sm:flex-1">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3 rounded-2xl border border-border/70 bg-background p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4" />{profile?.phone || "No phone number saved yet"}</div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4" />
                      <span>{profile?.address ? [profile.address, profile.city, profile.pincode].filter(Boolean).join(", ") : "No service address saved yet"}</span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[24px] border border-border/70 bg-card p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-black tracking-tight text-foreground">Quick snapshot</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-border/70 bg-background p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Latest booking</div>
                  <div className="mt-2 text-sm font-semibold text-foreground">{bookings[0] ? `${bookings[0].booking_code || getBookingTitle(bookings[0])} • ${formatStatus(bookings[0].status)}` : "No bookings yet"}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{bookings[0]?.scheduled_date ? formatDate(bookings[0].scheduled_date) : "Create a booking to get started"}</div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recommended next step</div>
                  <div className="mt-2 text-sm text-foreground">
                    {profile?.address && profile?.phone ? "Your account is ready for faster checkout on the next booking." : "Complete your profile details so future bookings need less manual input."}
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

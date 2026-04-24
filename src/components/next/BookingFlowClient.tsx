"use client";

import { CalendarDays, Check, ChevronRight, Clock3, Hash, Loader2, LogIn, MapPin, Phone, Shield, User, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  CatalogBrand,
  CatalogModel,
  CatalogSeries,
  ModelScreenGuard,
  RepairCategory,
  RepairSubcategory,
} from "@/src/lib/data/catalog";
import { buildBookingInsert, isMissingBookingCodeColumnError, isValidPhoneNumber, isValidPincode, parseBookingLocation } from "@/src/lib/bookings";
import { createClient } from "@/src/lib/supabase/client";

type SavedProfile = {
  customer_name: string;
  customer_phone: string;
  address: string;
  city: string;
  pincode: string;
};

type BookingFlowClientProps = {
  brand: CatalogBrand;
  series: CatalogSeries;
  model: CatalogModel;
  basePath: string;
  isRepair: boolean;
  repairServiceType?: "mobile" | "laptop";
  guards: ModelScreenGuard[];
  repairCategories: RepairCategory[];
  repairSubcategories: RepairSubcategory[];
};

const PROFILE_STORAGE_KEY = "looplic-booking-profile";
const TIME_SLOTS = ["8 AM - 11 AM", "11 AM - 2 PM", "2 PM - 5 PM", "5 PM - 8 PM"] as const;

const serviceBadges: Record<string, string> = {
  "Tempered Glass": "Shield",
  "Privacy Guard": "Privacy",
  Privacy: "Privacy",
  "Matte Guard": "Matte",
  Matte: "Matte",
  "UV Glass": "UV",
  "Ceramic Guard": "Ceramic",
  "11D": "Shield",
};

function displayGuardType(guardType: string) {
  const parts = guardType.split(" - ");
  return parts.length > 1 ? parts.slice(1).join(" - ") : guardType;
}

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

export function BookingFlowClient({
  brand,
  series,
  model,
  basePath,
  isRepair,
  repairServiceType,
  guards,
  repairCategories,
  repairSubcategories,
}: BookingFlowClientProps) {
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter();

  const [selectedGuard, setSelectedGuard] = useState<ModelScreenGuard | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<RepairSubcategory | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileConfirmed, setProfileConfirmed] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [scheduledDate, setScheduledDate] = useState(getTodayDateString());
  const [timeSlot, setTimeSlot] = useState<(typeof TIME_SLOTS)[number] | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookedCode, setBookedCode] = useState("");

  const selectedOption = isRepair ? selectedSubcategory : selectedGuard;
  const selectedLabel = isRepair ? selectedSubcategory?.name || "" : displayGuardType(selectedGuard?.guard_type || "");
  const selectedPrice = isRepair ? selectedSubcategory?.price : selectedGuard?.price;
  const redirectHref = `/auth?redirect=${encodeURIComponent(pathname || "/")}`;

  const visibleSubcategories = useMemo(() => {
    return selectedCategoryId ? repairSubcategories.filter((subcategory) => subcategory.category_id === selectedCategoryId) : [];
  }, [repairSubcategories, selectedCategoryId]);

  const canConfirmProfile =
    name.trim().length > 0 &&
    isValidPhoneNumber(phone) &&
    address.trim().length > 0 &&
    city.trim().length > 0 &&
    isValidPincode(pincode);

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!ignore) {
        setUser(currentUser);
        setAuthLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!ignore) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    let ignore = false;

    async function hydrateProfile() {
      if (!user || profileLoaded) {
        return;
      }

      try {
        const storedProfile = typeof window !== "undefined" ? window.localStorage.getItem(PROFILE_STORAGE_KEY) : null;

        if (storedProfile) {
          const parsed = JSON.parse(storedProfile) as SavedProfile & { location?: string };
          const parsedLocation = parseBookingLocation(parsed.location);
          if (!ignore) {
            setName(parsed.customer_name || "");
            setPhone(parsed.customer_phone || "");
            setAddress(parsed.address || parsedLocation.address);
            setCity(parsed.city || parsedLocation.city);
            setPincode(parsed.pincode || "");
          }
        }

        const { data } = await supabase
          .from("bookings")
          .select("customer_name, customer_phone, location, pincode")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!ignore && data) {
          const parsedLocation = parseBookingLocation(data.location);
          setName(data.customer_name || "");
          setPhone(data.customer_phone || "");
          setAddress(parsedLocation.address);
          setCity(parsedLocation.city);
          setPincode(data.pincode || "");
        }
      } finally {
        if (!ignore) {
          setProfileLoaded(true);
        }
      }
    }

    hydrateProfile();

    return () => {
      ignore = true;
    };
  }, [profileLoaded, supabase, user]);

  useEffect(() => {
    setProfileConfirmed(false);
  }, [selectedGuard, selectedCategoryId, selectedSubcategory]);

  async function handleBook() {
    if (!selectedOption || !selectedPrice) {
      toast.error("Please choose a service first");
      return;
    }

    if (!user) {
      router.push(redirectHref);
      return;
    }

    if (!canConfirmProfile) {
      toast.error("Please complete your name, phone, address, city, and pincode");
      return;
    }

    if (!scheduledDate || !timeSlot) {
      toast.error("Please select a date and time slot");
      return;
    }

    setSubmitting(true);

    const insertData = buildBookingInsert({
      customerName: name,
      customerPhone: phone,
      modelId: model.id,
      address,
      city,
      pincode,
      scheduledDate,
      timeSlot,
      serviceType: isRepair ? `${repairServiceType}_repair` : "screen_guard",
      userId: user.id,
      repairCategoryId: isRepair ? selectedCategoryId : null,
      repairSubcategoryId: isRepair ? selectedSubcategory?.id ?? null : null,
      guardType: !isRepair ? selectedGuard?.guard_type ?? null : null,
    });

    const bookingInsert = await supabase.from("bookings").insert(insertData).select("booking_code").single();
    const bookingCode = bookingInsert.data?.booking_code || "";

    if (bookingInsert.error && isMissingBookingCodeColumnError(bookingInsert.error)) {
      const fallbackInsert = await supabase.from("bookings").insert(insertData);
      if (fallbackInsert.error) {
        toast.error("Booking failed. Please try again.");
        setSubmitting(false);
        return;
      }
    } else if (bookingInsert.error) {
      toast.error("Booking failed. Please try again.");
      setSubmitting(false);
      return;
    }

    if (typeof window !== "undefined") {
      const profileToSave: SavedProfile = {
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
      };
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileToSave));
    }

    toast.success("Booking confirmed!");
    setBookedCode(bookingCode);
    setBooked(true);
    setSubmitting(false);
  }

  if (booked) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-brand">
            <Check className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-extrabold text-foreground">Booking Confirmed!</h2>
          {bookedCode ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">{bookedCode}</p> : null}
          <p className="mb-1 text-sm text-muted-foreground">
            {selectedLabel} for <strong>{model.name}</strong>
          </p>
          <p className="mb-1 text-xs text-muted-foreground">
            {scheduledDate} | {timeSlot}
          </p>
          <p className="mb-6 text-xs text-muted-foreground">
            We&apos;ll contact you at <strong>{phone}</strong> to confirm your slot.
          </p>
          <Link href="/" className="inline-block rounded-2xl gradient-brand px-6 py-3 text-sm font-bold text-primary-foreground">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="container py-6">
        <div className="mb-5 flex flex-wrap items-center gap-1 text-xs font-semibold text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`${basePath}/brands`} className="transition-colors hover:text-foreground">Brands</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`${basePath}/brands/${brand.slug}`} className="transition-colors hover:text-foreground">{brand.name}</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`${basePath}/brands/${brand.slug}/${series.slug}`} className="transition-colors hover:text-foreground">{series.name}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{model.name}</span>
        </div>

        <h1 className="mb-1 text-xl font-extrabold text-foreground">{isRepair ? "Choose Repair Service" : "Choose Screen Guard"}</h1>
        <p className="mb-5 text-xs text-muted-foreground">
          for <span className="font-bold text-foreground">{brand.name} {model.name}</span>
        </p>

        {isRepair ? (
          repairCategories.length === 0 ? (
            <div className="py-16 text-center">
              <Wrench className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">No repair services available</p>
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {repairCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setSelectedSubcategory(null);
                    }}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                      selectedCategoryId === category.id
                        ? "border-primary bg-primary/5 shadow-elevated-brand"
                        : "border-border bg-card shadow-card-brand hover:border-primary/30"
                    }`}
                  >
                    {category.image_url ? (
                      <img src={category.image_url} alt={category.name} className="h-10 w-10 rounded-xl object-contain" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                        <Wrench className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <span className="text-center text-xs font-bold text-foreground">{category.name}</span>
                  </button>
                ))}
              </div>

              {selectedCategoryId ? (
                <div className="mb-6 space-y-2.5">
                  <h3 className="text-sm font-bold text-foreground">Select Service</h3>
                  {visibleSubcategories.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">No services available in this category</p>
                  ) : (
                    visibleSubcategories.map((subcategory) => {
                      const isSelected = selectedSubcategory?.id === subcategory.id;
                      return (
                        <button
                          key={subcategory.id}
                          onClick={() => setSelectedSubcategory(subcategory)}
                          className={`flex w-full items-center gap-3 rounded-3xl border p-4 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-elevated-brand ring-2 ring-primary/10"
                              : "border-border/80 bg-card shadow-card-brand hover:-translate-y-0.5 hover:border-primary/30"
                          }`}
                        >
                          {subcategory.image_url ? (
                            <img src={subcategory.image_url} alt={subcategory.name} className="h-10 w-10 rounded-xl object-contain" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                              <Wrench className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <span className="block text-sm font-bold text-foreground">{subcategory.name}</span>
                            <span className="mt-1 inline-flex rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                              At-home repair service
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Starts from
                            </span>
                            <span className="text-lg font-extrabold gradient-brand-text">Rs. {subcategory.price}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : null}
            </>
          )
        ) : guards.length === 0 ? (
          <div className="py-16 text-center">
            <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-semibold text-muted-foreground">No screen guards available for this model</p>
            <p className="mt-1 text-xs text-muted-foreground">Check back soon!</p>
          </div>
        ) : (
          <div className="mb-6 space-y-2.5">
            {guards.map((guard) => {
              const isSelected = selectedGuard?.id === guard.id;
              const label = displayGuardType(guard.guard_type);
              return (
                <button
                  key={guard.id}
                  onClick={() => setSelectedGuard(guard)}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-elevated-brand"
                      : "border-border bg-card shadow-card-brand hover:border-primary/30"
                  }`}
                >
                  <span className="text-sm font-bold text-primary">{serviceBadges[label] || "Shield"}</span>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-foreground">{label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold gradient-brand-text">Rs. {guard.price}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedOption ? (
          authLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !user ? (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card-brand">
              <h3 className="mb-2 text-base font-extrabold text-foreground">Login or create account to continue</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Your saved name, phone, address, and future bookings will be reused across screen guard and repair services.
              </p>
              <Link href={redirectHref} className="inline-flex items-center gap-2 rounded-2xl gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground">
                <LogIn className="h-4 w-4" />
                Login or Create Account
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="rounded-2xl border border-border bg-card p-5 shadow-card-brand">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-extrabold text-foreground">Your Details and Address</h3>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100}
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="tel" placeholder="Phone number" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={15}
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <textarea placeholder="Address" value={address} onChange={(event) => setAddress(event.target.value)} rows={3} maxLength={200}
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="City" value={city} onChange={(event) => setCity(event.target.value)} maxLength={80}
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Pincode" value={pincode} onChange={(event) => setPincode(event.target.value)} maxLength={10}
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!canConfirmProfile) {
                        toast.error("Please complete your name, phone, address, city, and pincode");
                        return;
                      }
                      setProfileConfirmed(true);
                    }}
                    className="rounded-2xl gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground"
                  >
                    Save and Continue
                  </button>
                </div>
              </section>

              {profileConfirmed ? (
                <section className="rounded-2xl border border-border bg-card p-5 shadow-card-brand">
                  <div className="mb-4 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-extrabold text-foreground">Choose Date and Time Slot</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Service Date</label>
                      <input type="date" min={getTodayDateString()} value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Preferred Time Slot</label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {TIME_SLOTS.map((slot) => {
                          const isActive = timeSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setTimeSlot(slot)}
                              className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-all ${
                                isActive
                                  ? "border-primary bg-primary/5 text-foreground shadow-elevated-brand"
                                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                              }`}
                            >
                              <Clock3 className="h-4 w-4" />
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-foreground">
                      <div className="font-bold">{selectedLabel}</div>
                      <div className="mt-1 text-muted-foreground">{brand.name} {model.name}</div>
                      <div className="mt-2 font-extrabold text-primary">Rs. {selectedPrice}</div>
                    </div>

                    <button
                      type="button"
                      onClick={handleBook}
                      disabled={submitting || !scheduledDate || !timeSlot}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-brand py-3.5 text-sm font-extrabold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {submitting ? "Booking..." : "Confirm Booking"}
                    </button>
                  </div>
                </section>
              ) : null}
            </div>
          )
        ) : null}
      </div>
    </main>
  );
}

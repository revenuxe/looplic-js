"use client";

import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Hash, Loader2, LogIn, MapPin, Phone, Shield, User, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { buildBookingInsert, isValidPhoneNumber, isValidPincode, parseBookingLocation } from "@/src/lib/bookings";
import type { BookingInsert } from "@/src/lib/bookings";
import { buildCustomerProfileInsert } from "@/src/lib/profile";
import type {
  CatalogBrand,
  CatalogModel,
  CatalogSeries,
  ModelScreenGuard,
  RepairCategory,
  RepairSubcategory,
} from "@/src/lib/data/catalog";
import { createClient } from "@/src/lib/supabase/client";

type BookingStepFlowProps = {
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

type FlowStep = "select" | "repair" | "details" | "schedule";

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

export function BookingStepFlow({
  brand,
  series,
  model,
  basePath,
  isRepair,
  repairServiceType,
  guards,
  repairCategories,
  repairSubcategories,
}: BookingStepFlowProps) {
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [scheduledDate, setScheduledDate] = useState(getTodayDateString());
  const [timeSlot, setTimeSlot] = useState<(typeof TIME_SLOTS)[number] | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [optionSearch, setOptionSearch] = useState("");

  const stepParam = searchParams.get("step");
  const selectedCategoryId = searchParams.get("category");
  const selectedRepairId = searchParams.get("repair");
  const selectedGuardId = searchParams.get("guard");

  const currentStep: FlowStep = (() => {
    if (stepParam === "repair" || stepParam === "details" || stepParam === "schedule") {
      return stepParam;
    }
    if (isRepair && selectedCategoryId) {
      return "repair";
    }
    return "select";
  })();

  const selectedGuard = useMemo(() => guards.find((guard) => guard.id === selectedGuardId) ?? null, [guards, selectedGuardId]);
  const selectedSubcategory = useMemo(
    () => repairSubcategories.find((subcategory) => subcategory.id === selectedRepairId) ?? null,
    [repairSubcategories, selectedRepairId],
  );
  const selectedCategory = useMemo(
    () => repairCategories.find((category) => category.id === selectedCategoryId) ?? null,
    [repairCategories, selectedCategoryId],
  );
  const visibleSubcategories = useMemo(
    () => (selectedCategoryId ? repairSubcategories.filter((subcategory) => subcategory.category_id === selectedCategoryId) : []),
    [repairSubcategories, selectedCategoryId],
  );
  const filteredGuards = useMemo(() => {
    const query = optionSearch.trim().toLowerCase();
    if (!query) {
      return guards;
    }

    return guards.filter((guard) => displayGuardType(guard.guard_type).toLowerCase().includes(query));
  }, [guards, optionSearch]);
  const filteredCategories = useMemo(() => {
    const query = optionSearch.trim().toLowerCase();
    if (!query) {
      return repairCategories;
    }

    return repairCategories.filter((category) => category.name.toLowerCase().includes(query));
  }, [optionSearch, repairCategories]);
  const filteredSubcategories = useMemo(() => {
    const query = optionSearch.trim().toLowerCase();
    if (!query) {
      return visibleSubcategories;
    }

    return visibleSubcategories.filter((subcategory) => subcategory.name.toLowerCase().includes(query));
  }, [optionSearch, visibleSubcategories]);

  const selectedOption = isRepair ? selectedSubcategory : selectedGuard;
  const selectedLabel = isRepair ? selectedSubcategory?.name || "" : displayGuardType(selectedGuard?.guard_type || "");
  const selectedPrice = isRepair ? selectedSubcategory?.price : selectedGuard?.price;
  const hasSavedProfile =
    name.trim().length > 0 &&
    isValidPhoneNumber(phone) &&
    address.trim().length > 0 &&
    city.trim().length > 0 &&
    isValidPincode(pincode);

  function buildFlowHref(step: FlowStep, overrides?: { category?: string | null; repair?: string | null; guard?: string | null }) {
    const params = new URLSearchParams();
    const category = overrides?.category ?? selectedCategoryId;
    const repair = overrides?.repair ?? selectedRepairId;
    const guard = overrides?.guard ?? selectedGuardId;

    if (step !== "select") {
      params.set("step", step);
    }
    if (category) {
      params.set("category", category);
    }
    if (repair) {
      params.set("repair", repair);
    }
    if (guard) {
      params.set("guard", guard);
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  function pushFlow(step: FlowStep, overrides?: { category?: string | null; repair?: string | null; guard?: string | null }) {
    router.push(buildFlowHref(step, overrides));
  }

  function replaceFlow(step: FlowStep, overrides?: { category?: string | null; repair?: string | null; guard?: string | null }) {
    router.replace(buildFlowHref(step, overrides));
  }

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;

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
        const { data: profileData } = await supabase
          .from("customer_profiles")
          .select("full_name, phone, address, city, pincode")
          .eq("user_id", user.id)
          .maybeSingle();

        const customerProfile = profileData as
          | {
              full_name: string | null;
              phone: string | null;
              address: string | null;
              city: string | null;
              pincode: string | null;
            }
          | null;

        if (!ignore && customerProfile) {
          setName(customerProfile.full_name || "");
          setPhone(customerProfile.phone || "");
          setAddress(customerProfile.address || "");
          setCity(customerProfile.city || "");
          setPincode(customerProfile.pincode || "");
        }

        const { data } = await supabase
          .from("bookings")
          .select("customer_name, customer_phone, location, pincode")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const bookingProfile = data as
          | {
              customer_name: string | null;
              customer_phone: string | null;
              location: string | null;
              pincode: string | null;
            }
          | null;

        if (!ignore && bookingProfile && !customerProfile) {
          const parsedLocation = parseBookingLocation(bookingProfile.location);
          setName(bookingProfile.customer_name || "");
          setPhone(bookingProfile.customer_phone || "");
          setAddress(parsedLocation.address);
          setCity(parsedLocation.city);
          setPincode(bookingProfile.pincode || "");
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
    if (currentStep === "repair" && !selectedCategoryId) {
      replaceFlow("select", { category: null, repair: null, guard: null });
      return;
    }

    if ((currentStep === "details" || currentStep === "schedule") && !selectedOption) {
      replaceFlow(isRepair && selectedCategoryId ? "repair" : "select", { repair: null, guard: null });
      return;
    }

    if (currentStep === "schedule" && user && profileLoaded && !hasSavedProfile) {
      replaceFlow("details");
    }
  }, [currentStep, hasSavedProfile, isRepair, profileLoaded, selectedCategoryId, selectedOption, user]);

  useEffect(() => {
    setOptionSearch("");
  }, [currentStep, selectedCategoryId, model.id]);

  async function continueAfterSelection(selection: { guard?: string; category?: string; repair?: string }) {
    if (!user) {
      router.push(`/auth?redirect=${encodeURIComponent(buildFlowHref("details", selection))}`);
      return;
    }

    const nextStep = profileLoaded && hasSavedProfile ? "schedule" : "details";
    pushFlow(nextStep, selection);
  }

  async function handleBook() {
    if (!selectedOption || !selectedPrice) {
      toast.error("Please choose a service first");
      return;
    }
    if (!user) {
      router.push(`/auth?redirect=${encodeURIComponent(buildFlowHref("details"))}`);
      return;
    }
    if (!hasSavedProfile) {
      toast.error("Please complete your name, phone, address, city, and valid pincode");
      replaceFlow("details");
      return;
    }
    if (!scheduledDate || !timeSlot) {
      toast.error("Please select a date and time slot");
      return;
    }

    setSubmitting(true);
    const profilePayload = buildCustomerProfileInsert({
      userId: user.id,
      fullName: name,
      phone,
      address,
      city,
      pincode,
    });
    const { error: profileError } = await supabase.from("customer_profiles").upsert(profilePayload as any);
    if (profileError) {
      toast.error(profileError.message);
      setSubmitting(false);
      return;
    }
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
      }) as BookingInsert;
    const { error } = await supabase.from("bookings").insert(insertData as any);

    if (error) {
      toast.error(error.message || "Booking failed. Please try again.");
      setSubmitting(false);
      return;
    }

    toast.success("Booking confirmed!");
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
          <p className="mb-1 text-sm text-muted-foreground">{selectedLabel} for <strong>{model.name}</strong></p>
          <p className="mb-1 text-xs text-muted-foreground">{scheduledDate} | {timeSlot}</p>
          <p className="mb-6 text-xs text-muted-foreground">We&apos;ll contact you at <strong>{phone}</strong> to confirm your slot.</p>
          <Link href="/" className="inline-block rounded-2xl gradient-brand px-6 py-3 text-sm font-bold text-primary-foreground">Back to Home</Link>
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

        {currentStep !== "select" ? (
          <button
            type="button"
            onClick={() => {
              if (currentStep === "repair") pushFlow("select", { category: null, repair: null, guard: null });
              else if (currentStep === "details") pushFlow(isRepair ? "repair" : "select", { repair: null });
              else pushFlow(hasSavedProfile ? (isRepair ? "repair" : "select") : "details");
            }}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </button>
        ) : null}

        <h1 className="mb-1 text-xl font-extrabold text-foreground">
          {currentStep === "details" ? "Your Details and Address" : currentStep === "schedule" ? "Choose Date and Time Slot" : currentStep === "repair" ? "Choose Repair Service" : isRepair ? "Choose Repair Category" : "Choose Screen Guard"}
        </h1>
        <p className="mb-5 text-xs text-muted-foreground">for <span className="font-bold text-foreground">{brand.name} {model.name}</span></p>

        {currentStep === "select" || currentStep === "repair" ? (
          <div className="relative mb-5 max-w-sm">
            <input
              type="text"
              placeholder={
                currentStep === "repair"
                  ? "Search repair service..."
                  : isRepair
                    ? "Search repair category..."
                    : "Search screen guard..."
              }
              value={optionSearch}
              onChange={(event) => setOptionSearch(event.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        ) : null}

        {currentStep === "select" && !isRepair ? (
          filteredGuards.length === 0 ? (
            <div className="py-16 text-center">
              <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">
                {optionSearch ? "No screen guards match your search" : "No screen guards available for this model"}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredGuards.map((guard) => {
                const label = displayGuardType(guard.guard_type);
                return (
                  <button key={guard.id} onClick={() => continueAfterSelection({ guard: guard.id })} className="flex w-full items-center gap-3 rounded-2xl border-2 border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-card-brand">
                    <span className="text-sm font-bold text-primary">{serviceBadges[label] || "Shield"}</span>
                    <div className="flex-1"><span className="text-sm font-bold text-foreground">{label}</span></div>
                    <div className="text-right"><span className="text-lg font-extrabold gradient-brand-text">Rs. {guard.price}</span></div>
                  </button>
                );
              })}
            </div>
          )
        ) : null}

        {currentStep === "select" && isRepair ? (
          filteredCategories.length === 0 ? (
            <div className="py-16 text-center">
              <Wrench className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">
                {optionSearch ? "No repair categories match your search" : "No repair categories available"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {filteredCategories.map((category) => (
                <button key={category.id} onClick={() => pushFlow("repair", { category: category.id, repair: null, guard: null })} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-card-brand">
                  {category.image_url ? <img src={category.image_url} alt={category.name} className="h-10 w-10 rounded-xl object-contain" /> : <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary"><Wrench className="h-5 w-5 text-primary" /></div>}
                  <span className="text-center text-xs font-bold text-foreground">{category.name}</span>
                </button>
              ))}
            </div>
          )
        ) : null}

        {currentStep === "repair" ? (
          <div className="space-y-2.5">
            <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-foreground">
              <div className="font-bold">{selectedCategory?.name || "Repair Category"}</div>
              <div className="mt-1 text-xs text-muted-foreground">Choose the exact repair to continue</div>
            </div>
            {filteredSubcategories.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {optionSearch ? "No repair services match your search" : "No services available in this category"}
              </p>
            ) : (
              filteredSubcategories.map((subcategory) => (
                <button key={subcategory.id} onClick={() => continueAfterSelection({ category: selectedCategoryId || "", repair: subcategory.id })} className="flex w-full items-center gap-3 rounded-2xl border-2 border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-card-brand">
                  {subcategory.image_url ? <img src={subcategory.image_url} alt={subcategory.name} className="h-10 w-10 rounded-xl object-contain" /> : <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary"><Wrench className="h-5 w-5 text-muted-foreground" /></div>}
                  <div className="flex-1"><span className="text-sm font-bold text-foreground">{subcategory.name}</span></div>
                  <div className="text-right"><span className="text-lg font-extrabold gradient-brand-text">Rs. {subcategory.price}</span></div>
                </button>
              ))
            )}
          </div>
        ) : null}

        {currentStep === "details" ? (
          authLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !user ? (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card-brand">
              <h3 className="mb-2 text-base font-extrabold text-foreground">Login or create account to continue</h3>
              <p className="mb-4 text-sm text-muted-foreground">Your saved name, phone, address, and future bookings will be reused across services.</p>
              <Link href={`/auth?redirect=${encodeURIComponent(buildFlowHref("details"))}`} className="inline-flex items-center gap-2 rounded-2xl gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground"><LogIn className="h-4 w-4" />Login or Create Account</Link>
            </div>
          ) : (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-card-brand">
              <div className="mb-4 rounded-2xl bg-secondary/60 p-4 text-sm text-foreground">
                <div className="font-bold">{selectedLabel}</div>
                <div className="mt-1 text-muted-foreground">{brand.name} {model.name}</div>
                <div className="mt-2 font-extrabold text-primary">Rs. {selectedPrice}</div>
              </div>
              <div className="space-y-3">
                <div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div className="relative"><Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="tel" placeholder="Phone number" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={15} className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div className="relative"><MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><textarea placeholder="Address" value={address} onChange={(event) => setAddress(event.target.value)} rows={3} maxLength={200} className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div className="relative"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" placeholder="City" value={city} onChange={(event) => setCity(event.target.value)} maxLength={80} className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                <div className="relative"><Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" placeholder="Pincode" value={pincode} onChange={(event) => setPincode(event.target.value)} maxLength={10} className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={async () => {
                    if (!user) {
                      router.push(`/auth?redirect=${encodeURIComponent(buildFlowHref("details"))}`);
                      return;
                    }
                    if (!hasSavedProfile) {
                      toast.error("Please complete your name, phone, address, city, and valid pincode");
                      return;
                    }
                    const { error } = await supabase.from("customer_profiles").upsert(
                      buildCustomerProfileInsert({
                        userId: user.id,
                        fullName: name,
                        phone,
                        address,
                        city,
                        pincode,
                      }) as any,
                    );
                    if (error) {
                      toast.error(error.message);
                      return;
                    }
                    toast.success("Details saved");
                    pushFlow("schedule");
                  }}
                  className="rounded-2xl gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground"
                >
                  Save and Continue
                </button>
              </div>
            </section>
          )
        ) : null}

        {currentStep === "schedule" ? (
          authLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !user ? (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card-brand">
              <h3 className="mb-2 text-base font-extrabold text-foreground">Login or create account to continue</h3>
              <Link href={`/auth?redirect=${encodeURIComponent(buildFlowHref("details"))}`} className="inline-flex items-center gap-2 rounded-2xl gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground"><LogIn className="h-4 w-4" />Login or Create Account</Link>
            </div>
          ) : (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-card-brand">
              <div className="mb-4 rounded-2xl bg-secondary/60 p-4 text-sm text-foreground">
                <div className="font-bold">{selectedLabel}</div>
                <div className="mt-1 text-muted-foreground">{brand.name} {model.name}</div>
                <div className="mt-1 text-muted-foreground">{address}, {city} - {pincode}</div>
                <div className="mt-2 font-extrabold text-primary">Rs. {selectedPrice}</div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Service Date</label>
                  <input type="date" min={getTodayDateString()} value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Preferred Time Slot</label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {TIME_SLOTS.map((slot) => {
                      const isActive = timeSlot === slot;
                      return (
                        <button key={slot} type="button" onClick={() => setTimeSlot(slot)} className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition-all ${isActive ? "border-primary bg-primary/5 text-foreground shadow-elevated-brand" : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}>
                          <Clock3 className="h-4 w-4" />
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button type="button" onClick={handleBook} disabled={submitting || !scheduledDate || !timeSlot} className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-brand py-3.5 text-sm font-extrabold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </section>
          )
        ) : null}
      </div>
    </main>
  );
}

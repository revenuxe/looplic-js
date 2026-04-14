import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type BookingRow = Tables<"bookings">;
export type BookingInsert = TablesInsert<"bookings">;

export type BookingAddressInput = {
  address: string;
  city?: string;
  pincode: string;
};

export function buildBookingLocation({ address, city, pincode }: BookingAddressInput) {
  return [address.trim(), city?.trim()].filter(Boolean).join(", ");
}

export function parseBookingLocation(location: string | null | undefined) {
  if (!location) {
    return { address: "", city: "" };
  }

  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return { address: location, city: "" };
  }

  return {
    address: parts.slice(0, -1).join(", "),
    city: parts.at(-1) || "",
  };
}

export function isValidPhoneNumber(phone: string) {
  return phone.replace(/\D/g, "").length >= 10;
}

export function isValidPincode(pincode: string) {
  return /^\d{6}$/.test(pincode.trim());
}

export function buildBookingInsert(input: {
  customerName: string;
  customerPhone: string;
  modelId: string;
  serviceType: BookingInsert["service_type"];
  address: string;
  city?: string;
  pincode: string;
  scheduledDate?: string;
  timeSlot?: string;
  userId?: string | null;
  guardType?: string | null;
  repairCategoryId?: string | null;
  repairSubcategoryId?: string | null;
}): BookingInsert {
  return {
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
    model_id: input.modelId,
    location: buildBookingLocation({
      address: input.address,
      city: input.city,
      pincode: input.pincode,
    }),
    pincode: input.pincode.trim(),
    scheduled_date: input.scheduledDate || null,
    time_slot: input.timeSlot || null,
    service_type: input.serviceType,
    user_id: input.userId ?? null,
    guard_type: input.guardType ?? null,
    repair_category_id: input.repairCategoryId ?? null,
    repair_subcategory_id: input.repairSubcategoryId ?? null,
  };
}

export function formatBookingServiceType(serviceType: string) {
  if (serviceType === "screen_guard") {
    return "Screen Guard";
  }

  if (serviceType === "mobile_repair") {
    return "Mobile Repair";
  }

  if (serviceType === "laptop_repair") {
    return "Laptop Repair";
  }

  return serviceType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatBookingStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

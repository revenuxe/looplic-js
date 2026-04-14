import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type CustomerProfile = Tables<"customer_profiles">;
export type CustomerProfileInsert = TablesInsert<"customer_profiles">;

export function buildCustomerProfileInsert(input: {
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}): CustomerProfileInsert {
  return {
    user_id: input.userId,
    full_name: input.fullName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    city: input.city.trim(),
    pincode: input.pincode.trim(),
  };
}

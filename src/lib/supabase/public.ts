import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { supabaseAnonKey, supabaseUrl } from "@/src/lib/supabase/config";

let publicClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createPublicClient() {
  if (publicClient) {
    return publicClient;
  }

  publicClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return publicClient;
}

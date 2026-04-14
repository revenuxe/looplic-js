import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/integrations/supabase/types";
import { supabaseAnonKey, supabaseUrl } from "@/src/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}

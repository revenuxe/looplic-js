import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { supabaseAnonKey, supabaseUrl } from "@/src/lib/supabase/config";

let publicClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const requestTimeoutMs = isBuildPhase ? 2500 : 8000;

async function timedFetch(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error(`Supabase request timed out after ${requestTimeoutMs}ms`)), requestTimeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: init?.signal ?? controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

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
    global: {
      fetch: timedFetch,
    },
  });

  return publicClient;
}

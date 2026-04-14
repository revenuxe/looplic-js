"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { createClient } from "@/src/lib/supabase/client";

export function useAdminSession() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function checkAdminRole(currentUser: User | null) {
      if (ignore) {
        return;
      }

      if (!currentUser) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!ignore) {
          setIsAdmin(!!data);
        }
      } catch {
        if (!ignore) {
          setIsAdmin(false);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAdminRole(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdminRole(session?.user ?? null);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { user, isAdmin, loading, signIn, signOut };
}

"use client";

import { Loader2, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/src/lib/supabase/client";

export function AuthHeaderActions({ mobile = false }: { mobile?: boolean }) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!ignore) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!ignore) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return <Loader2 className={mobile ? "h-4 w-4 animate-spin text-primary" : "h-4 w-4 animate-spin text-muted-foreground"} />;
  }

  if (!user) {
    return mobile ? (
      <Link href="/auth" className="px-2 py-1 text-xs font-bold text-primary">
        Sign In
      </Link>
    ) : (
      <Link
        href="/auth"
        className="rounded-lg gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Sign In
      </Link>
    );
  }

  return mobile ? (
    <div className="flex items-center gap-2">
      <Link href="/account" className="inline-flex items-center gap-1 text-xs font-bold text-primary">
        <User className="h-3.5 w-3.5" />
        Account
      </Link>
      <button onClick={handleSignOut} className="text-xs font-bold text-muted-foreground">
        Logout
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
      >
        <User className="h-4 w-4" />
        Account
      </Link>
      <button
        onClick={handleSignOut}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );
}

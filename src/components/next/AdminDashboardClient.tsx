"use client";

import { CalendarCheck, Laptop, Loader2, LogOut, Shield, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import BookingsTab from "@/src/components/admin/BookingsTab";
import { LaptopRepairServicesTab, MobileRepairServicesTab, ScreenGuardServicesTab } from "@/src/components/admin/ServicesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { useAdminSession } from "@/src/hooks/useAdminSession";

export function AdminDashboardClient() {
  const router = useRouter();
  const { user, isAdmin, loading, signOut } = useAdminSession();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/admin/login");
    }
  }, [isAdmin, loading, router, user]);

  async function handleSignOut() {
    await signOut();
    router.replace("/admin/login");
  }

  if (loading || !user || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-lg">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              Admin
            </div>
            <div>
              <div className="text-sm font-extrabold text-foreground">Looplic Dashboard</div>
              <div className="text-[10px] text-muted-foreground">{user.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </header>

      <div className="container py-6">
        <Tabs defaultValue="screen-guard" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="screen-guard" className="gap-1.5 text-xs">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Screen Guard</span>
              <span className="sm:hidden">Guard</span>
            </TabsTrigger>
            <TabsTrigger value="mobile-repair" className="gap-1.5 text-xs">
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mobile Repair</span>
              <span className="sm:hidden">Mobile</span>
            </TabsTrigger>
            <TabsTrigger value="laptop-repair" className="gap-1.5 text-xs">
              <Laptop className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Laptop Repair</span>
              <span className="sm:hidden">Laptop</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1.5 text-xs">
              <CalendarCheck className="h-3.5 w-3.5" />
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="screen-guard">
            <ScreenGuardServicesTab />
          </TabsContent>

          <TabsContent value="mobile-repair">
            <MobileRepairServicesTab />
          </TabsContent>

          <TabsContent value="laptop-repair">
            <LaptopRepairServicesTab />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import logo from "@/assets/looplic-logo.webp";
import { LogOut, Loader2, Package, CalendarCheck } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BookingsTab from "@/components/admin/BookingsTab";
import ServicesTab from "@/components/admin/ServicesTab";

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Looplic" className="h-6" />
            <span className="text-xs font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">Admin</span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="container py-6">
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="w-full max-w-xs">
            <TabsTrigger value="services" className="flex-1 gap-1.5">
              <Package className="w-3.5 h-3.5" />
              Services
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1 gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5" />
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <ServicesTab />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

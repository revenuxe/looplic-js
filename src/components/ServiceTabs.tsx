import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Smartphone, Laptop, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const services = [
  { id: "screen-guard", label: "Screen Guard", shortLabel: "Guard", icon: Shield, color: "from-blue-500 to-cyan-500" },
  { id: "mobile-repair", label: "Mobile Repair", shortLabel: "Mobile", icon: Smartphone, color: "from-orange-500 to-red-500" },
  { id: "laptop-repair", label: "Laptop Repair", shortLabel: "Laptop", icon: Laptop, color: "from-violet-500 to-purple-600" },
];

const ServiceTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Determine active tab from URL
  const getActiveId = () => {
    if (location.pathname.startsWith("/service/")) {
      const type = location.pathname.split("/")[2];
      return type || null;
    }
    return null; // homepage = no active tab (screen-guard is default home)
  };

  const activeId = getActiveId();

  const handleClick = (id: string) => {
    if (loadingId) return;
    setLoadingId(id);
    setTimeout(() => {
      if (id === "screen-guard") {
        navigate("/");
      } else {
        navigate(`/service/${id}`);
      }
      setLoadingId(null);
    }, 500);
  };

  return (
    <section className="border-b border-border bg-card/80 backdrop-blur-md sticky top-14 z-40">
      <div className="container">
        <div className="flex items-center justify-center gap-1 py-1.5">
          {services.map((s) => {
            const Icon = s.icon;
            const isLoading = loadingId === s.id;
            const isActive = activeId === s.id || (s.id === "screen-guard" && activeId === null && location.pathname === "/");

            return (
              <button
                key={s.id}
                onClick={() => handleClick(s.id)}
                disabled={isLoading}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 disabled:opacity-70 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeServiceTab"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5 sm:gap-2">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.shortLabel}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceTabs;

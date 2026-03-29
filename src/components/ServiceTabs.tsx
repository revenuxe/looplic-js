import { useNavigate } from "react-router-dom";
import { Shield, Wrench, Laptop, Loader2 } from "lucide-react";
import { useState } from "react";

const services = [
  { id: "screen-guard", label: "Screen Guard", icon: Shield, color: "from-blue-500 to-cyan-500" },
  { id: "mobile-repair", label: "Mobile Repair", icon: Wrench, color: "from-orange-500 to-red-500" },
  { id: "laptop-repair", label: "Laptop Repair", icon: Laptop, color: "from-violet-500 to-purple-600" },
];

const ServiceTabs = () => {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    setLoadingId(id);
    setTimeout(() => {
      navigate(`/service/${id}`);
    }, 600);
  };

  return (
    <section className="py-2 border-b border-border bg-card/60 backdrop-blur-sm sticky top-14 z-40">
      <div className="container">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {services.map((s) => {
            const Icon = s.icon;
            const isLoading = loadingId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleClick(s.id)}
                disabled={isLoading}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-foreground hover:bg-secondary active:scale-95 transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceTabs;

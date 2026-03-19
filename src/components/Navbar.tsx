import logo from "@/assets/looplic-logo.webp";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-14">
        <img src={logo} alt="Looplic" className="h-8 md:h-7" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Services</a>
          <a href="#" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          <button className="px-4 py-2 rounded-lg gradient-brand text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            Book Now
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-card border-b border-border"
          >
            <div className="container py-4 flex flex-col gap-3">
              <a href="#" className="text-sm font-medium text-foreground py-2">Services</a>
              <a href="#" className="text-sm font-medium text-foreground py-2">How It Works</a>
              <a href="#" className="text-sm font-medium text-foreground py-2">Contact</a>
              <button className="mt-2 w-full py-3 rounded-lg gradient-brand text-primary-foreground text-sm font-bold">
                Book Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

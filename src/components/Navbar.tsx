import logo from "@/assets/looplic-logo.webp";
import { Menu, X, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-14">
        <Link to="/"><img src={logo} alt="Looplic" className="h-8 md:h-7" /></Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Services</a>
          <a href="#" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : user ? (
            <Link to="/account" className="flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-brand text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              <User className="w-4 h-4" /> My Account
            </Link>
          ) : (
            <Link to="/auth" className="px-4 py-2 rounded-lg gradient-brand text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          {!loading && (
            user ? (
              <Link to="/account" className="p-2 text-primary">
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <Link to="/auth" className="text-xs font-bold text-primary px-2 py-1">
                Sign In
              </Link>
            )
          )}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
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
              {user ? (
                <Link to="/account" onClick={() => setOpen(false)} className="mt-2 w-full py-3 rounded-lg gradient-brand text-primary-foreground text-sm font-bold text-center">
                  My Account
                </Link>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="mt-2 w-full py-3 rounded-lg gradient-brand text-primary-foreground text-sm font-bold text-center">
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logo from "@/assets/looplic-logo.webp";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (mode === "signup" && !name.trim()) return;

    setSubmitting(true);
    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        navigate(redirect, { replace: true });
      }
    } else {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Check your email to verify.");
        navigate(redirect, { replace: true });
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-6">
            <img src={logo} alt="Looplic" className="h-8 mx-auto mb-4" />
            <h1 className="text-xl font-extrabold text-foreground">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === "login"
                ? "Sign in to track your bookings"
                : "Sign up to manage your bookings"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-card text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-card text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={72}
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-border bg-card text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl gradient-brand text-primary-foreground text-sm font-extrabold disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="font-bold text-primary">
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="font-bold text-primary">
                  Sign In
                </button>
              </>
            )}
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;

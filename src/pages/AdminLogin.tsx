import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import logo from "@/assets/looplic-logo.webp";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect } from "react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, isAdmin, loading, user } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [loading, user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message);
      setSubmitting(false);
    }
    // onAuthStateChange will handle redirect
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logo} alt="Looplic" className="h-8 mx-auto mb-4" />
          <h1 className="text-xl font-extrabold text-foreground">Admin Login</h1>
          <p className="text-xs text-muted-foreground mt-1">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="admin@looplic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-destructive font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl gradient-brand text-primary-foreground text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

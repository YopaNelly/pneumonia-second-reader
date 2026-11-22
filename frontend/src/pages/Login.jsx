import { useState } from "react";
import { motion } from "framer-motion";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { Field } from "../components/ui.jsx";
import { configured, supabase } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast(error.message, "error");
    toast("Welcome back", "success");
    navigate(location.state?.from || "/dashboard", { replace: true });
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your analyses and history"
      footer={
        <>
          No account yet?{" "}
          <Link to="/signup" className="text-sky-300 hover:text-sky-200">
            Create one
          </Link>
        </>
      }
    >
      {!configured && (
        <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
          Supabase keys are missing in frontend/.env. Add them and rebuild.
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        <Field icon={Mail} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          icon={Lock}
          type={showPw ? "text" : "password"}
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          right={
            <button type="button" onClick={() => setShowPw((v) => !v)} className="text-[var(--muted)] hover:text-white">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        <div className="text-right text-sm">
          <Link to="/forgot-password" className="text-sky-300 hover:text-sky-200">
            Forgot password?
          </Link>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign in"}
        </motion.button>
      </form>
    </AuthShell>
  );
}

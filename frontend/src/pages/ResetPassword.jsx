import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { Field } from "../components/ui.jsx";
import { supabase } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
import { PasswordChecklist, passwordChecks } from "../lib/password.jsx";

export default function ResetPassword() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const checks = passwordChecks(password, confirm);
  const valid = checks.every((c) => c.ok);

  async function submit(e) {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast(error.message, "error");
    toast("Password updated", "success");
    navigate("/dashboard", { replace: true });
  }

  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-[var(--muted)]">Loading...</div>;
  }

  if (!user) {
    return (
      <AuthShell
        title="Link invalid or expired"
        subtitle="Reset links work once and expire after a short time"
        footer={
          <Link to="/login" className="text-sky-300 hover:text-sky-200">
            Back to sign in
          </Link>
        }
      >
        <Link to="/forgot-password" className="btn-primary block rounded-xl py-3 text-center">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create a new password" subtitle="Choose a strong password for your account">
      <form onSubmit={submit} className="space-y-4">
        <Field
          icon={Lock}
          type={showPw ? "text" : "password"}
          required
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          right={
            <button type="button" onClick={() => setShowPw((v) => !v)} className="text-[var(--muted)] hover:text-white">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        <Field
          icon={Lock}
          type={showPw ? "text" : "password"}
          required
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <PasswordChecklist checks={checks} />
        <motion.button
          whileHover={{ scale: valid ? 1.02 : 1 }}
          whileTap={{ scale: valid ? 0.98 : 1 }}
          disabled={!valid || loading}
          className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Reset password"}
        </motion.button>
      </form>
    </AuthShell>
  );
}

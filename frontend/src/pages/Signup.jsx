import { useState } from "react";
import { motion } from "framer-motion";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Check, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { Field } from "../components/ui.jsx";
import { configured, supabase } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";

export default function Signup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const rules = [
    { ok: password.length >= 8, text: "At least 8 characters" },
    { ok: /\d/.test(password), text: "One number" },
    { ok: /[A-Z]/.test(password), text: "One uppercase letter" },
    { ok: password.length > 0 && password === confirm, text: "Passwords match" },
  ];
  const valid = rules.every((r) => r.ok) && agree && name.trim().length > 1;

  async function submit(e) {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    });
    setLoading(false);
    if (error) return toast(error.message, "error");
    if (data.session) {
      toast("Account created", "success");
      navigate("/dashboard", { replace: true });
    } else {
      toast("Account created. Check your email to confirm, then sign in.", "info");
      navigate("/login", { replace: true });
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Your analyses stay private to you"
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="text-sky-300 hover:text-sky-200">
            Sign in
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
        <Field icon={User} required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
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
        <Field
          icon={Lock}
          type={showPw ? "text" : "password"}
          required
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {rules.map((r) => (
            <li key={r.text} className={`flex items-center gap-1.5 transition ${r.ok ? "text-emerald-300" : "text-[var(--muted)]"}`}>
              <motion.span animate={{ scale: r.ok ? [1, 1.4, 1] : 1 }}>
                <Check size={13} />
              </motion.span>
              {r.text}
            </li>
          ))}
        </ul>

        <label className="flex items-start gap-2 text-xs text-[var(--muted)]">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-sky-400" />
          I understand this is a research prototype, not a medical device, and results must be
          reviewed by a qualified clinician.
        </label>

        <motion.button
          whileHover={{ scale: valid ? 1.02 : 1 }}
          whileTap={{ scale: valid ? 0.98 : 1 }}
          disabled={!valid || loading}
          className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Create account"}
        </motion.button>
      </form>
    </AuthShell>
  );
}

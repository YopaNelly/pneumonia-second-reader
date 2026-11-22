import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, MailCheck } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { Field } from "../components/ui.jsx";
import { supabase } from "../lib/api.js";
import { useToast } from "../lib/toast.jsx";

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast(error.message, "error");
    setSent(true);
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we will send a reset link"
      footer={
        <Link to="/login" className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      }
    >
      {sent ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-400/15"
          >
            <MailCheck size={30} className="text-emerald-300" />
          </motion.div>
          <p className="font-semibold">Check your inbox</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            If an account exists for {email}, a reset link is on its way. The link opens a page
            where you can choose a new password.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field icon={Mail} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Send reset link"}
          </motion.button>
        </form>
      )}
    </AuthShell>
  );
}

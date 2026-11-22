import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { supabase } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
import { Field, PageHeader } from "../components/ui.jsx";
import { PasswordChecklist, passwordChecks } from "../lib/password.jsx";

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const currentName = user?.user_metadata?.full_name || "";
  const [name, setName] = useState(currentName);
  const [savingName, setSavingName] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const checks = passwordChecks(password, confirm);
  const pwValid = checks.every((c) => c.ok);
  const nameChanged = name.trim().length > 1 && name.trim() !== currentName;
  const initial = (currentName || user?.email || "?").charAt(0).toUpperCase();
  const since = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "";

  async function saveName(e) {
    e.preventDefault();
    if (!nameChanged) return;
    setSavingName(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setSavingName(false);
    if (error) return toast(error.message, "error");
    toast("Name updated", "success");
  }

  async function savePassword(e) {
    e.preventDefault();
    if (!pwValid) return;
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPw(false);
    if (error) return toast(error.message, "error");
    setPassword("");
    setConfirm("");
    toast("Password changed", "success");
  }

  return (
    <div>
      <PageHeader title="My" accent="profile" subtitle="Manage your account details and password." />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass flex items-center gap-5 p-6">
        <motion.div
          whileHover={{ rotate: 6, scale: 1.05 }}
          className="btn-primary grid h-20 w-20 shrink-0 place-items-center rounded-3xl text-3xl"
        >
          {initial}
        </motion.div>
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold">{currentName || "Unnamed user"}</p>
          <p className="truncate text-sm text-[var(--muted)]">{user?.email}</p>
          {since && <p className="mt-1 text-xs text-[var(--muted)]">Member since {since}</p>}
        </div>
      </motion.div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          onSubmit={saveName}
          className="glass space-y-4 p-6"
        >
          <p className="font-semibold">Personal details</p>
          <Field icon={User} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="opacity-60">
            <Field icon={Mail} value={user?.email || ""} readOnly />
          </div>
          <motion.button
            whileHover={{ scale: nameChanged ? 1.02 : 1 }}
            whileTap={{ scale: nameChanged ? 0.98 : 1 }}
            disabled={!nameChanged || savingName}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 disabled:opacity-50"
          >
            {savingName ? <Loader2 size={18} className="animate-spin" /> : "Save changes"}
          </motion.button>
        </motion.form>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          onSubmit={savePassword}
          className="glass space-y-4 p-6"
        >
          <p className="font-semibold">Change password</p>
          <Field icon={Lock} type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Field icon={Lock} type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <PasswordChecklist checks={checks} />
          <motion.button
            whileHover={{ scale: pwValid ? 1.02 : 1 }}
            whileTap={{ scale: pwValid ? 0.98 : 1 }}
            disabled={!pwValid || savingPw}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 disabled:opacity-50"
          >
            {savingPw ? <Loader2 size={18} className="animate-spin" /> : "Update password"}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}

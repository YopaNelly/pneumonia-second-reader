import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Database, Download, EyeOff, Loader2, Share2, ShieldCheck, Trash2, UserX } from "lucide-react";
import { api, supabase } from "../lib/api.js";
import { useToast } from "../lib/toast.jsx";
import { PageHeader } from "../components/ui.jsx";

const facts = [
  {
    icon: Database,
    title: "What is stored",
    color: "text-sky-300",
    items: [
      "Your account email and name.",
      "For analyses you save: the X-ray (re-encoded, with all embedded metadata removed), its heatmap, the model result, and the date.",
    ],
  },
  {
    icon: EyeOff,
    title: "What is never stored",
    color: "text-emerald-300",
    items: ["Patient names or identifiers.", "Original file names.", "Anything from analyses you did not choose to save."],
  },
  {
    icon: ShieldCheck,
    title: "Who can see it",
    color: "text-amber-300",
    items: [
      "Only you can see your saved analyses.",
      "Clinicians can see an image only if you ticked “Also allow model improvement”, and they see it without the model's prediction.",
    ],
  },
];

export default function Privacy() {
  const navigate = useNavigate();
  const toast = useToast();
  const [busy, setBusy] = useState("");
  const [dialog, setDialog] = useState(null);
  const [typed, setTyped] = useState("");

  async function download() {
    setBusy("export");
    try {
      const data = await api("/api/account/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-second-reader-data.json";
      a.click();
      URL.revokeObjectURL(url);
      toast("Download started", "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy("");
    }
  }

  async function withdraw() {
    setBusy("withdraw");
    try {
      const res = await api("/api/account/withdraw-consent", { method: "POST" });
      toast(res.withdrawn ? `Stopped sharing ${res.withdrawn} image(s)` : "Nothing was being shared", "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy("");
    }
  }

  function closeDialog() {
    if (busy) return;
    setDialog(null);
    setTyped("");
  }

  async function confirmDelete() {
    if (typed !== "DELETE") return;
    setBusy("delete");
    try {
      if (dialog === "data") {
        const res = await api("/api/account/data", { method: "DELETE" });
        toast(`${res.deleted} analysis(es) deleted`, "success");
        setBusy("");
        setDialog(null);
        setTyped("");
      } else {
        await api("/api/account", { method: "DELETE" });
        await supabase.auth.signOut({ scope: "local" }).catch(() => {});
        toast("Account deleted", "success");
        navigate("/welcome", { replace: true });
      }
    } catch (e) {
      toast(e.message, "error");
      setBusy("");
    }
  }

  const actions = [
    { key: "export", icon: Download, title: "Download my data", text: "A JSON file with your account details and the results of all your analyses.", button: "Download", onClick: download },
    { key: "withdraw", icon: Share2, title: "Stop sharing for model improvement", text: "Withdraws consent on all your images. They stay in your history but are never used for training.", button: "Stop sharing", onClick: withdraw },
  ];

  return (
    <div>
      <PageHeader title="Privacy and" accent="data" subtitle="What this app keeps about you, and what you control." />

      <div className="grid gap-4 md:grid-cols-3">
        {facts.map(({ icon: Icon, title, color, items }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass p-5">
            <p className="mb-3 flex items-center gap-2 font-semibold">
              <Icon size={18} className={color} /> {title}
            </p>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="glass mt-5 divide-y divide-white/10 overflow-hidden">
        {actions.map(({ key, icon: Icon, title, text, button, onClick }) => (
          <div key={key} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10">
                <Icon size={18} className="text-sky-300" />
              </div>
              <div>
                <p className="font-medium">{title}</p>
                <p className="max-w-md text-sm text-[var(--muted)]">{text}</p>
              </div>
            </div>
            <button onClick={onClick} disabled={Boolean(busy)} className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2 text-sm transition hover:bg-white/15 disabled:opacity-50">
              {busy === key ? <Loader2 size={15} className="animate-spin" /> : button}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-400/5 p-5">
        <p className="font-semibold text-rose-200">Danger zone</p>
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">Delete all my analyses</p>
              <p className="max-w-md text-sm text-[var(--muted)]">Permanently removes every saved image, heatmap, and result. Your account stays.</p>
            </div>
            <button onClick={() => setDialog("data")} className="flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-400/10 px-5 py-2 text-sm text-rose-200 transition hover:bg-rose-400/20">
              <Trash2 size={15} /> Delete analyses
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
            <div>
              <p className="font-medium">Delete my account</p>
              <p className="max-w-md text-sm text-[var(--muted)]">Removes your analyses and your account. This cannot be undone.</p>
            </div>
            <button onClick={() => setDialog("account")} className="flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2 text-sm font-semibold">
              <UserX size={15} /> Delete account
            </button>
          </div>
        </div>
        <p className="mt-4 text-xs text-[var(--muted)]">
          Deleting removes files from this app. It cannot recall copies that were already exported
          for model training, so every retraining run should start from a fresh export.
        </p>
      </div>

      <AnimatePresence>
        {dialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-sm" onClick={closeDialog}>
            <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }} onClick={(e) => e.stopPropagation()} className="glass w-full max-w-sm p-6 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-rose-400/15">
                <Trash2 className="text-rose-300" />
              </div>
              <p className="text-lg font-semibold">{dialog === "data" ? "Delete all analyses?" : "Delete your account?"}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {dialog === "data" ? "Every saved image and result is removed permanently." : "Your analyses and your account are removed permanently."} Type <strong className="text-white">DELETE</strong> to confirm.
              </p>
              <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="DELETE" className="field mt-4 !px-4 text-center" />
              <div className="mt-5 flex gap-3">
                <button onClick={closeDialog} disabled={Boolean(busy)} className="flex-1 rounded-xl bg-white/10 py-2.5 text-sm">
                  Cancel
                </button>
                <button onClick={confirmDelete} disabled={typed !== "DELETE" || Boolean(busy)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold disabled:opacity-40">
                  {busy === "delete" ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

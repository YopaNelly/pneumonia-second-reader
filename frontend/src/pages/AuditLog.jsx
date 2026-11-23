import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, RefreshCw, ScrollText, Share2, Shield, Trash2, UserX } from "lucide-react";
import { api } from "../lib/api.js";
import { EmptyState, PageHeader, Skeleton, fmtDate } from "../components/ui.jsx";

const kinds = {
  "review.submit": {
    label: "Reviews",
    icon: ClipboardCheck,
    color: "text-sky-300",
    text: (a) =>
      `Labeled a case ${a.detail?.label === "PNEUMONIA" ? "pneumonia" : "normal"}, ${
        a.detail?.agreed ? "agreeing with" : "differing from"
      } the model`,
  },
  "role.change": {
    label: "Role changes",
    icon: Shield,
    color: "text-amber-300",
    text: (a) => `Changed ${a.detail?.email || "a user"} from ${a.detail?.from} to ${a.detail?.to}`,
  },
  "consent.withdraw": {
    label: "Consent withdrawn",
    icon: Share2,
    color: "text-emerald-300",
    text: (a) => `Stopped sharing ${a.detail?.count ?? 0} image(s) for model improvement`,
  },
  "data.delete": {
    label: "Data deletions",
    icon: Trash2,
    color: "text-rose-300",
    text: (a) => `Deleted ${a.detail?.count ?? 0} analysis(es)`,
  },
  "account.delete": {
    label: "Account deletions",
    icon: UserX,
    color: "text-rose-300",
    text: () => "Deleted their account",
  },
};

export default function AuditLog() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const d = await api("/api/admin/audit");
      setItems(d.items);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = (items || []).filter((a) => filter === "all" || a.action === filter);

  return (
    <div>
      <PageHeader title="Audit" accent="log" subtitle="Who did what, newest first. Review notes and images are never logged.">
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-sky-400"
          >
            <option value="all" className="bg-slate-900">All events</option>
            {Object.entries(kinds).map(([key, k]) => (
              <option key={key} value={key} className="bg-slate-900">
                {k.label}
              </option>
            ))}
          </select>
          <button onClick={load} disabled={busy} className="glass flex items-center gap-2 px-4 py-2 text-sm transition hover:bg-white/10">
            <RefreshCw size={15} className={busy ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </PageHeader>

      {error && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div>
      )}

      {!items && !error && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <EmptyState icon={ScrollText} title="Nothing logged yet" text="Reviews, role changes, and deletions will appear here." />
      )}

      {items && items.length > 0 && shown.length === 0 && (
        <p className="text-[var(--muted)]">No events of this type.</p>
      )}

      <div className="space-y-3">
        {shown.map((a, i) => {
          const k = kinds[a.action] || { icon: ScrollText, color: "text-slate-300", text: () => a.action };
          const Icon = k.icon;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i, 12) * 0.03 }}
              className="glass flex items-start gap-4 p-4"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10">
                <Icon size={18} className={k.color} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{a.actor_email || "Deleted account"}</span>{" "}
                  <span className="text-[var(--muted)]">{k.text(a)}</span>
                </p>
                <p className="text-xs text-[var(--muted)]">{fmtDate(a.created_at)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

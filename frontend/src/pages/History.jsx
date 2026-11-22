import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { History as HistoryIcon, ScanSearch } from "lucide-react";
import { api } from "../lib/api.js";
import { EmptyState, LabelBadge, PageHeader, Skeleton, fmtDate } from "../components/ui.jsx";

const filters = [
  { key: "ALL", label: "All" },
  { key: "PNEUMONIA", label: "Pneumonia" },
  { key: "NORMAL", label: "Normal" },
];

export default function History() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    let alive = true;
    api("/api/history")
      .then((d) => alive && setItems(d.items))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const shown = (items || []).filter((i) => filter === "ALL" || i.predicted_label === filter);

  return (
    <div>
      <PageHeader title="Analysis" accent="history" subtitle="Every X-ray you chose to save, newest first.">
        <div className="glass flex p-1">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className="relative rounded-xl px-4 py-1.5 text-sm">
              {filter === f.key && (
                <motion.span
                  layoutId="filter-pill"
                  className="btn-primary absolute inset-0 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`relative ${filter === f.key ? "text-slate-900" : "text-[var(--muted)]"}`}>{f.label}</span>
            </button>
          ))}
        </div>
      </PageHeader>

      {error && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div>
      )}

      {!items && !error && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <EmptyState
          icon={HistoryIcon}
          title="Nothing saved yet"
          text="Analyze an X-ray with “Save to my history” on, and it will show up here."
          action={
            <Link to="/analyze" className="btn-primary mt-2 flex items-center gap-2 rounded-xl px-5 py-2.5">
              <ScanSearch size={16} /> Analyze an X-ray
            </Link>
          }
        />
      )}

      {items && items.length > 0 && shown.length === 0 && (
        <p className="text-[var(--muted)]">No {filter.toLowerCase()} analyses in your history.</p>
      )}

      <motion.div layout className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {shown.map((r, i) => (
          <motion.div
            key={r.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 12) * 0.04 }}
            whileHover={{ y: -5 }}
          >
            <Link to={`/history/${r.id}`} className="glass glow-card group block overflow-hidden">
              <div className="aspect-square overflow-hidden bg-black">
                {r.image_url && (
                  <img src={r.image_url} alt="X-ray" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                )}
              </div>
              <div className="space-y-1 p-3">
                <div className="flex items-center justify-between">
                  <LabelBadge label={r.predicted_label} />
                  <span className="text-xs font-medium">{(r.probability * 100).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-[var(--muted)]">{fmtDate(r.created_at)}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

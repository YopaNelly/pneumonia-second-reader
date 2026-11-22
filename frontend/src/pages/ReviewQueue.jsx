import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ClipboardCheck, EyeOff } from "lucide-react";
import { api } from "../lib/api.js";
import { EmptyState, PageHeader, Skeleton, fmtDate } from "../components/ui.jsx";

export default function ReviewQueue() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api("/api/review/queue")
      .then((d) => alive && setItems(d.items))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Review"
        accent="queue"
        subtitle="Cases shared for model improvement that still need a clinician label."
      >
        {items && (
          <span className="glass px-4 py-2 text-sm">
            {items.length}
            {items.length === 50 ? "+" : ""} waiting
          </span>
        )}
      </PageHeader>

      <div className="mb-5 flex gap-3 rounded-2xl border border-sky-400/30 bg-sky-400/10 p-4 text-sm text-sky-100">
        <EyeOff size={18} className="mt-0.5 shrink-0" />
        <p>
          <strong>Blinded review.</strong> The model&apos;s prediction is hidden until you submit your
          own label, so it cannot influence your reading. Cases are listed oldest first.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div>
      )}

      {!items && !error && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <EmptyState icon={ClipboardCheck} title="All caught up" text="No cases are waiting for review right now." />
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {(items || []).map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 12) * 0.04 }}
            whileHover={{ y: -5 }}
          >
            <Link to={`/review/${r.id}`} className="glass glow-card group block overflow-hidden">
              <div className="aspect-square overflow-hidden bg-black">
                {r.image_url && (
                  <img src={r.image_url} alt="X-ray" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                )}
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-xs text-[var(--muted)]">{fmtDate(r.created_at)}</span>
                <span className="text-xs font-semibold text-sky-300">Review</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

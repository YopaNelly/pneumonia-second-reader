import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ClipboardCheck, ScanSearch, ShieldAlert } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { AnimatedNumber, EmptyState, LabelBadge, Ring, Skeleton, fmtDate } from "../components/ui.jsx";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([api("/api/history/stats"), api("/api/history")])
      .then(([s, h]) => {
        if (!alive) return;
        setStats(s);
        setRecent(h.items.slice(0, 6));
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Doctor";

  const cards = stats
    ? [
        { label: "Analyses", value: stats.total, icon: ScanSearch, glow: "rgba(56,189,248,0.28)" },
        { label: "Pneumonia flagged", value: stats.pneumonia, icon: ShieldAlert, glow: "rgba(251,113,133,0.28)" },
        { label: "Normal", value: stats.normal, icon: CheckCircle2, glow: "rgba(52,211,153,0.28)" },
        { label: "Awaiting review", value: stats.pending, icon: ClipboardCheck, glow: "rgba(251,191,36,0.28)" },
      ]
    : [];
  const max = stats ? Math.max(1, ...stats.last7days.map((d) => d.count)) : 1;
  const share = stats && stats.total ? stats.pneumonia / stats.total : 0;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome back, <span className="text-gradient">{name}</span>
      </h1>
      <p className="mt-1 text-[var(--muted)]">Here is your second-reader activity.</p>

      {error && (
        <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div>
      )}

      {!stats && !error && (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {stats && (
        <>
          <motion.div variants={container} initial="hidden" animate="show" className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, glow }) => (
              <motion.div
                key={label}
                variants={item}
                whileHover={{ y: -4 }}
                className="glass glow-card p-4"
                style={{ backgroundImage: `linear-gradient(135deg, ${glow}, transparent 70%)` }}
              >
                <Icon size={20} className="text-white/80" />
                <p className="mt-3 text-3xl font-semibold">
                  <AnimatedNumber value={value} />
                </p>
                <p className="text-sm text-[var(--muted)]">{label}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="glass p-5 md:col-span-2">
              <p className="font-semibold">Analyses, last 7 days</p>
              <div className="mt-4 flex h-44 items-end gap-3">
                {stats.last7days.map((d) => (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs text-[var(--muted)]">{d.count}</span>
                    <motion.div
                      initial={{ height: 4 }}
                      animate={{ height: Math.max(4, (d.count / max) * 120) }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="btn-primary w-full rounded-t-lg"
                    />
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(`${d.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass flex flex-col items-center justify-center gap-3 p-5 text-center">
              <p className="font-semibold">Pneumonia share</p>
              <Ring value={share} color="var(--danger)" label="of analyses" />
              <p className="text-xs text-[var(--muted)]">
                {stats.agreement === null
                  ? "No clinician reviews yet"
                  : `Clinician agreement: ${(stats.agreement * 100).toFixed(1)}%`}
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-xl font-semibold">Recent analyses</p>
            {recent && recent.length > 0 && (
              <Link to="/history" className="flex items-center gap-1 text-sm text-sky-300 hover:text-sky-200">
                View all <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {recent && recent.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={ScanSearch}
                title="No analyses yet"
                text="Analyze your first chest X-ray and it will appear here."
                action={
                  <Link to="/analyze" className="btn-primary mt-2 rounded-xl px-5 py-2.5">
                    Analyze an X-ray
                  </Link>
                }
              />
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              {(recent || []).map((r) => (
                <motion.div key={r.id} variants={item} whileHover={{ y: -4 }}>
                  <Link to={`/history/${r.id}`} className="glass glow-card block overflow-hidden">
                    <div className="aspect-square bg-black">
                      {r.image_url && <img src={r.image_url} alt="X-ray" className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex items-center justify-between p-3">
                      <LabelBadge label={r.predicted_label} />
                      <span className="text-xs text-[var(--muted)]">{fmtDate(r.created_at)}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

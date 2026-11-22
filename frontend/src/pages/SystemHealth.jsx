import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Gauge, RefreshCw, Server, Timer } from "lucide-react";
import { BASE } from "../lib/api.js";
import { PageHeader, Skeleton } from "../components/ui.jsx";

function Dot({ ok }) {
  const color = ok ? "bg-emerald-400" : "bg-rose-400";
  return (
    <span className="relative flex h-3 w-3">
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${color}`} />
      <span className={`relative inline-flex h-3 w-3 rounded-full ${color}`} />
    </span>
  );
}

export default function SystemHealth() {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);

  const check = useCallback(async () => {
    setBusy(true);
    const t0 = performance.now();
    try {
      const res = await fetch(`${BASE}/api/health`);
      const data = await res.json();
      setState({ api: true, ml: data.ml, ms: Math.round(performance.now() - t0), at: new Date() });
    } catch {
      setState({ api: false, ml: null, ms: null, at: new Date() });
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    check();
    const t = setInterval(check, 10000);
    return () => clearInterval(t);
  }, [check]);

  const ml = state && state.ml && typeof state.ml === "object" ? state.ml : null;
  const mlOk = ml?.status === "ok";
  const modelOk = ml?.model_loaded === true;
  const allOk = Boolean(state?.api && mlOk && modelOk);

  const rows = state
    ? [
        { icon: Server, title: "API server", ok: state.api, text: state.api ? "Responding" : "Unreachable" },
        { icon: Brain, title: "ML service", ok: mlOk, text: mlOk ? "Responding" : "Unreachable" },
        { icon: Gauge, title: "Model", ok: modelOk, text: modelOk ? "Loaded" : "Not loaded" },
      ]
    : [];

  return (
    <div>
      <PageHeader title="System" accent="health" subtitle="Live status, refreshed every 10 seconds.">
        <button
          onClick={check}
          disabled={busy}
          className="glass flex items-center gap-2 px-4 py-2 text-sm transition hover:bg-white/10"
        >
          <RefreshCw size={15} className={busy ? "animate-spin" : ""} /> Refresh
        </button>
      </PageHeader>

      {!state ? (
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass flex items-center gap-4 p-5"
            style={{
              backgroundImage: `linear-gradient(135deg, ${
                allOk ? "rgba(52,211,153,0.18)" : "rgba(251,113,133,0.18)"
              }, transparent 70%)`,
            }}
          >
            <Dot ok={allOk} />
            <div>
              <p className="text-lg font-semibold">{allOk ? "All systems operational" : "Service degraded"}</p>
              <p className="text-sm text-[var(--muted)]">Last checked {state.at.toLocaleTimeString()}</p>
            </div>
          </motion.div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {rows.map(({ icon: Icon, title, ok, text }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * (i + 1) }}
                className="glass p-5"
              >
                <div className="flex items-center justify-between">
                  <Icon size={20} className="text-white/80" />
                  <Dot ok={ok} />
                </div>
                <p className="mt-3 font-semibold">{title}</p>
                <p className={`text-sm ${ok ? "text-emerald-300" : "text-rose-300"}`}>{text}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="glass flex items-center gap-4 p-5">
              <Timer size={20} className="text-sky-300" />
              <div>
                <p className="text-sm text-[var(--muted)]">API response time</p>
                <p className="text-xl font-semibold">{state.ms === null ? "n/a" : `${state.ms} ms`}</p>
              </div>
            </div>
            <div className="glass flex items-center gap-4 p-5">
              <Gauge size={20} className="text-sky-300" />
              <div>
                <p className="text-sm text-[var(--muted)]">Decision threshold</p>
                <p className="text-xl font-semibold">{ml?.threshold ?? "n/a"}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BarChart3, CheckCircle2, ClipboardCheck, Info, Users } from "lucide-react";
import { api } from "../lib/api.js";
import { AnimatedNumber, EmptyState, PageHeader, Skeleton } from "../components/ui.jsx";

const pct = (v) => (v === null || v === undefined ? "n/a" : `${(v * 100).toFixed(1)}%`);

function Cell({ label, value, good, max }) {
  const alpha = max ? 0.12 + 0.35 * (value / max) : 0.12;
  const rgb = good ? "52,211,153" : "251,113,133";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-white/10 p-5 text-center"
      style={{ background: `rgba(${rgb},${alpha})` }}
    >
      <p className="text-3xl font-semibold">
        <AnimatedNumber value={value} />
      </p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </motion.div>
  );
}

function Metric({ label, hint, m }) {
  return (
    <div className="glass p-4">
      <div className="flex items-baseline justify-between">
        <p className="font-medium">{label}</p>
        <p className="text-xl font-semibold">{pct(m.value)}</p>
      </div>
      <p className="text-xs text-[var(--muted)]">{hint}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="btn-primary h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(m.value || 0) * 100}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {m.ci ? `95% CI ${pct(m.ci[0])} to ${pct(m.ci[1])}` : "Not enough cases"} · {m.k}/{m.n}
      </p>
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api("/api/reports")
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const m = data?.matrix;
  const max = m ? Math.max(m.tp, m.fp, m.fn, m.tn) : 0;

  return (
    <div>
      <PageHeader
        title="Model"
        accent="reports"
        subtitle="How the model compares with clinician labels on reviewed cases."
      />

      {error && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div>
      )}

      {!data && !error && (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {data && data.total === 0 && (
        <EmptyState
          icon={BarChart3}
          title="No reviewed cases yet"
          text="Reports appear once clinicians have labeled some cases in the review queue."
          action={
            <Link to="/review" className="btn-primary mt-2 rounded-xl px-5 py-2.5">
              Go to the review queue
            </Link>
          }
        />
      )}

      {data && data.total > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Reviewed cases", value: data.total, icon: CheckCircle2 },
              { label: "Waiting for review", value: data.pending, icon: ClipboardCheck },
              { label: "Reviewers", value: data.reviewers, icon: Users },
            ].map(({ label, value, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass p-4"
              >
                <Icon size={20} className="text-white/80" />
                <p className="mt-3 text-3xl font-semibold">
                  <AnimatedNumber value={value} />
                </p>
                <p className="text-sm text-[var(--muted)]">{label}</p>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="glass p-4"
            >
              <BarChart3 size={20} className="text-white/80" />
              <p className="mt-3 text-3xl font-semibold">{pct(data.agreement.value)}</p>
              <p className="text-sm text-[var(--muted)]">Model-clinician agreement</p>
            </motion.div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="glass p-5">
              <p className="mb-4 font-semibold">Confusion matrix</p>
              <div className="grid grid-cols-[auto_1fr_1fr] gap-3 text-sm">
                <div />
                <p className="text-center text-[var(--muted)]">Model: Pneumonia</p>
                <p className="text-center text-[var(--muted)]">Model: Normal</p>

                <p className="self-center text-[var(--muted)]">Clinician:<br />Pneumonia</p>
                <Cell label="True positive" value={m.tp} good max={max} />
                <Cell label="False negative" value={m.fn} good={false} max={max} />

                <p className="self-center text-[var(--muted)]">Clinician:<br />Normal</p>
                <Cell label="False positive" value={m.fp} good={false} max={max} />
                <Cell label="True negative" value={m.tn} good max={max} />
              </div>
            </div>

            <div className="space-y-3">
              <Metric label="Sensitivity" hint="Pneumonia cases the model caught" m={data.sensitivity} />
              <Metric label="Specificity" hint="Normal cases the model cleared" m={data.specificity} />
              <div className="grid grid-cols-2 gap-3">
                <Metric label="PPV" hint="Flagged cases that were pneumonia" m={data.ppv} />
                <Metric label="NPV" hint="Cleared cases that were normal" m={data.npv} />
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            <Info size={18} className="mt-0.5 shrink-0" />
            <p>
              These figures describe only the {data.total} reviewed cases. They are not a validation
              of the model: users choose which cases to share, labels come from {data.reviewers}{" "}
              reviewer{data.reviewers === 1 ? "" : "s"}, and small samples give wide intervals. The
              held-out test-set results in the README remain the performance estimate.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

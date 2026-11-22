import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Brain, CheckCircle2, XCircle } from "lucide-react";
import { BASE } from "../lib/api.js";
import { PageHeader } from "../components/ui.jsx";

const rows = [
  { name: "Baseline CNN", sens: 56.2, spec: 68.8 },
  { name: "ResNet50 (frozen)", sens: 96.9, spec: 70.9 },
  { name: "ResNet50 (fine-tuned)", sens: 96.2, spec: 82.9, selected: true },
  { name: "Ensemble", sens: 98.2, spec: 66.2 },
];

const intended = [
  "A second opinion on pediatric chest X-rays, read by a qualified clinician.",
  "Research and teaching on explainable AI for pneumonia screening.",
];

const notIntended = [
  "Diagnosing or ruling out pneumonia on its own.",
  "Adult chest X-rays, or other body parts and conditions.",
  "Any decision about a real patient without clinician review.",
];

const limits = [
  "Trained and evaluated on one public pediatric dataset. Performance on other hospitals, scanners, and populations is unknown.",
  "No external validation has been done.",
  "The Grad-CAM heatmap shows what influenced the model. It does not localize disease.",
  "Image quality, positioning, and compression can change the result.",
  "The model reports a probability, and a probability near the threshold means high uncertainty.",
];

function Bar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 text-[var(--muted)]">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
      <span className="w-12 text-right font-medium">{value.toFixed(1)}%</span>
    </div>
  );
}

function ListCard({ title, icon: Icon, color, items }) {
  return (
    <div className="glass p-5">
      <p className="mb-3 flex items-center gap-2 font-semibold">
        <Icon size={18} className={color} /> {title}
      </p>
      <ul className="space-y-2 text-sm text-[var(--muted)]">
        {items.map((t) => (
          <li key={t} className="flex gap-2">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${color.replace("text-", "bg-")}`} />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ModelCard() {
  const [threshold, setThreshold] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch(`${BASE}/api/health`)
      .then((r) => r.json())
      .then((d) => alive && setThreshold(d.ml && d.ml.threshold !== undefined ? d.ml.threshold : null))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Model" accent="card" subtitle="What the model is, what it can do, and where it falls short." />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass flex flex-wrap items-center gap-5 p-5">
        <div className="btn-primary grid h-14 w-14 place-items-center rounded-2xl">
          <Brain size={26} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold">ResNet50, fine-tuned</p>
          <p className="text-sm text-[var(--muted)]">Pediatric chest X-ray classifier with Grad-CAM explanations</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--muted)]">Decision threshold (live)</p>
          <p className="text-2xl font-semibold">{threshold ?? "n/a"}</p>
        </div>
      </motion.div>

      <div className="glass mt-5 p-5">
        <p className="font-semibold">Performance on the held-out test set</p>
        <p className="mb-4 text-xs text-[var(--muted)]">624 images. Sensitivity is the share of pneumonia cases caught; specificity is the share of normal cases cleared.</p>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl p-3 ${r.selected ? "bg-sky-400/10 ring-1 ring-sky-400/40" : "bg-white/5"}`}
            >
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                {r.name}
                {r.selected && <span className="rounded-full bg-sky-400/20 px-2 py-0.5 text-[10px] font-semibold text-sky-200">SELECTED</span>}
              </p>
              <div className="space-y-1.5">
                <Bar label="Sens." value={r.sens} color="linear-gradient(90deg,#38bdf8,#818cf8)" />
                <Bar label="Spec." value={r.spec} color="linear-gradient(90deg,#34d399,#38bdf8)" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <ListCard title="Intended use" icon={CheckCircle2} color="text-emerald-300" items={intended} />
        <ListCard title="Not intended for" icon={XCircle} color="text-rose-300" items={notIntended} />
      </div>

      <div className="mt-5">
        <ListCard title="Limitations" icon={AlertTriangle} color="text-amber-300" items={limits} />
      </div>

      <p className="mt-5 text-xs text-[var(--muted)]">Research prototype. Not a certified medical device. Not for unreviewed clinical use.</p>
    </div>
  );
}

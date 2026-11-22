import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";

export function AnimatedNumber({ value, decimals = 0, suffix = "" }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setShown(v),
    });
    return () => controls.stop();
  }, [value]);
  return (
    <span>
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function Background() {
  return (
    <>
      <div className="blob" style={{ width: 420, height: 420, background: "#38bdf8", top: -120, left: -80 }} />
      <div className="blob" style={{ width: 380, height: 380, background: "#818cf8", top: "30%", right: -100, animationDelay: "-5s" }} />
      <div className="blob" style={{ width: 340, height: 340, background: "#34d399", bottom: -140, left: "25%", animationDelay: "-9s", opacity: 0.18 }} />
    </>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function Field({ icon: Icon, right, ...props }) {
  return (
    <div className="relative">
      <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
      <input className="field" {...props} />
      {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  );
}

export function LabelBadge({ label }) {
  const bad = label === "PNEUMONIA";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        bad ? "bg-rose-400/15 text-rose-300" : "bg-emerald-400/15 text-emerald-300"
      }`}
    >
      {bad ? "Pneumonia" : "Normal"}
    </span>
  );
}

export function PageHeader({ title, accent, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {title} <span className="text-gradient">{accent}</span>
        </h1>
        {subtitle && <p className="mt-1 text-[var(--muted)]">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass flex flex-col items-center gap-3 p-12 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity }}
        className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10"
      >
        <Icon size={30} className="text-sky-300" />
      </motion.div>
      <p className="text-lg font-semibold">{title}</p>
      <p className="max-w-sm text-sm text-[var(--muted)]">{text}</p>
      {action}
    </motion.div>
  );
}

export function Ring({ value, color = "var(--ok)", label = "", size = 128 }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="-rotate-90" style={{ width: size, height: size }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value) }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-2xl font-semibold">{(value * 100).toFixed(1)}%</p>
          {label && (
            <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{label}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function fmtDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

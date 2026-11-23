import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Brain,
  ChevronDown,
  ClipboardCheck,
  EyeOff,
  Flame,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../lib/auth.jsx";

const words = ["A", "clinical", "second", "reader", "for", "pediatric", "chest", "X-rays"];

function XrayIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.8 }}
      className="relative mx-auto w-full max-w-sm"
    >
      <div className="absolute -inset-6 rounded-[2.5rem] bg-sky-400/20 blur-3xl" />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="glass relative overflow-hidden p-4"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-slate-950">
          <svg viewBox="0 0 300 375" className="h-full w-full" aria-hidden="true">
            <defs>
              <linearGradient id="lungFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.16" />
              </linearGradient>
              <radialGradient id="heatA">
                <stop offset="0%" stopColor="#fb7185" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="scanG" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>

            <rect width="300" height="375" fill="#050a14" />
            <rect x="143" y="30" width="14" height="320" rx="7" fill="#cbd5e1" opacity="0.2" />

            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i} fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" opacity="0.2">
                <path d={`M150 ${70 + i * 38} C 95 ${62 + i * 38}, 50 ${86 + i * 38}, 32 ${116 + i * 38}`} />
                <path d={`M150 ${70 + i * 38} C 205 ${62 + i * 38}, 250 ${86 + i * 38}, 268 ${116 + i * 38}`} />
              </g>
            ))}

            <path
              d="M136 66 C 72 78, 44 160, 54 262 C 60 304, 122 314, 136 282 Z"
              fill="url(#lungFill)"
              stroke="#e2e8f0"
              strokeOpacity="0.25"
            />
            <path
              d="M164 66 C 228 78, 256 160, 246 262 C 240 304, 178 314, 164 282 Z"
              fill="url(#lungFill)"
              stroke="#e2e8f0"
              strokeOpacity="0.25"
            />

            <circle cx="96" cy="206" r="44" fill="url(#heatA)">
              <animate attributeName="opacity" values="0.25;0.95;0.25" dur="3.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="206" cy="168" r="34" fill="url(#heatA)">
              <animate attributeName="opacity" values="0.9;0.2;0.9" dur="4.1s" repeatCount="indefinite" />
            </circle>

            <rect x="0" y="0" width="300" height="3" fill="url(#scanG)">
              <animate attributeName="y" values="0;372;0" dur="5s" repeatCount="indefinite" />
            </rect>
          </svg>
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs">
            <Flame size={12} className="text-rose-300" /> Grad-CAM
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-[var(--muted)]">Illustration, not a real scan</p>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="glass absolute -left-4 top-16 hidden items-center gap-2 px-3 py-2 text-xs sm:flex"
      >
        <ShieldCheck size={14} className="text-emerald-300" /> Private by design
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="glass absolute -right-4 bottom-20 hidden items-center gap-2 px-3 py-2 text-xs sm:flex"
      >
        <Brain size={14} className="text-sky-300" /> ResNet50
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const { user } = useAuth();
  const [pos, setPos] = useState({ x: 50, y: 30 });

  return (
    <section
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
      className="relative px-6 pb-16 pt-14 md:pt-20"
      style={{
        background: `radial-gradient(520px circle at ${pos.x}% ${pos.y}%, rgba(56,189,248,0.12), transparent 60%)`,
      }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mb-6 inline-flex items-center gap-2 px-4 py-1.5 text-xs"
          >
            <Sparkles size={13} className="text-sky-300" /> Research prototype · TechAscend Track A
          </motion.div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            {words.map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.5 }}
                className={`mr-3 inline-block ${w === "second" || w === "reader" ? "text-gradient" : ""}`}
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 max-w-lg text-lg text-[var(--muted)]"
          >
            Upload an X-ray, get a pneumonia assessment with a heatmap that explains it, and keep your
            own private history. Clinicians can review cases blind to the model, so the labels you
            collect are not influenced by it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            {user ? (
              <Link to="/dashboard">
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="btn-primary inline-block rounded-xl px-7 py-3">
                  Open dashboard
                </motion.span>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="btn-primary inline-block rounded-xl px-7 py-3">
                    Get started
                  </motion.span>
                </Link>
                <Link to="/login">
                  <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="glass inline-block px-7 py-3 font-medium">
                    Sign in
                  </motion.span>
                </Link>
              </>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-5 text-xs text-[var(--muted)]"
          >
            Not a certified medical device. Not for unreviewed clinical use.
          </motion.p>
        </div>

        <XrayIllustration />
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-12 flex justify-center text-[var(--muted)]"
      >
        <ChevronDown />
      </motion.div>
    </section>
  );
}

const tags = [
  [Brain, "ResNet50 fine-tuned"],
  [Flame, "Grad-CAM explanations"],
  [ClipboardCheck, "Blinded clinician review"],
  [Lock, "Private history"],
  [BarChart3, "Confusion-matrix reports"],
  [ShieldCheck, "Row-level security"],
  [EyeOff, "No patient identity stored"],
];

export function Marquee() {
  const row = [...tags, ...tags];
  const mask = "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)";
  return (
    <div
      className="relative overflow-hidden border-y border-white/10 bg-white/[0.03] py-4"
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      <div className="marquee">
        {row.map(([Icon, label], i) => (
          <div
            key={i}
            className="mx-2 flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
          >
            <Icon size={15} className="text-sky-300" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

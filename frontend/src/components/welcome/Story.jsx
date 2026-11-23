import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, CheckCircle2, ClipboardCheck, Flame, Lock, ScanSearch, Upload } from "lucide-react";
import { Reveal, SectionHeader } from "./parts.jsx";

const steps = [
  {
    icon: Upload,
    title: "Upload",
    text: "Drop in a pediatric chest X-ray, or try one of the built-in sample images.",
  },
  {
    icon: ScanSearch,
    title: "Analyze",
    text: "A fine-tuned ResNet50 returns a label and probability, with a Grad-CAM heatmap of what influenced it.",
  },
  {
    icon: ClipboardCheck,
    title: "Review",
    text: "Keep it in your private history, or share it so clinicians can label it without seeing the model's answer.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="How it works"
          title="From X-ray to"
          accent="explained result"
          text="Three steps, with a human clinician always in the loop."
        />
        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3 }}
            style={{
              transformOrigin: "0% 50%",
              background: "linear-gradient(90deg, rgba(56,189,248,0.6), rgba(129,140,248,0.6), rgba(52,211,153,0.6))",
            }}
            className="absolute left-[17%] right-[17%] top-[52px] hidden h-0.5 md:block"
          />
          {steps.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.12}>
              <motion.div whileHover={{ y: -6 }} className="glass glow-card relative h-full p-6 text-center">
                <div className="btn-primary relative mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl">
                  <Icon size={24} />
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-bold text-slate-900">
                    {i + 1}
                  </span>
                </div>
                <p className="text-lg font-semibold">{title}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    key: "explain",
    label: "Explainable",
    icon: Flame,
    title: "See what influenced the model",
    text: "Every analysis comes with a Grad-CAM heatmap. The heatmap shows what influenced the model. It does not localize disease.",
    points: ["Heatmap overlay with adjustable opacity", "Zoom up to 3x for close inspection", "One-page printable case report"],
  },
  {
    key: "private",
    label: "Private",
    icon: Lock,
    title: "Your history stays yours",
    text: "Saved analyses live in your own private folder, visible only to you.",
    points: [
      "Metadata is removed from every saved image",
      "File names and patient identity are never stored",
      "Download or delete your data at any time",
    ],
  },
  {
    key: "review",
    label: "Reviewed",
    icon: ClipboardCheck,
    title: "Labels from clinicians, not from the model",
    text: "Clinicians label shared cases without seeing the model's prediction, so the training labels are not anchored on it.",
    points: [
      "Prediction revealed only after the label is submitted",
      "Cases listed oldest first, so probability cannot leak",
      "Reviews recorded in an audit log, without notes",
    ],
  },
  {
    key: "insight",
    label: "Insights",
    icon: BarChart3,
    title: "Know how the model really performs",
    text: "Reports compare the model with clinician labels on reviewed cases.",
    points: [
      "Confusion matrix on reviewed cases",
      "Sensitivity, specificity, PPV and NPV with 95% intervals",
      "A clear warning that small samples are not a validation",
    ],
  },
];

export function Features() {
  const [active, setActive] = useState("explain");
  const f = features.find((x) => x.key === active);
  const Icon = f.icon;

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Features"
          title="Built for"
          accent="trust"
          text="Explainable results, private by design, and labels that come from clinicians."
        />
        <Reveal className="mt-10">
          <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1.5">
            {features.map((x) => (
              <button
                key={x.key}
                onClick={() => setActive(x.key)}
                className="relative rounded-xl px-4 py-2 text-sm font-medium"
              >
                {active === x.key && (
                  <motion.span
                    layoutId="feature-pill"
                    className="btn-primary absolute inset-0 rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative ${active === x.key ? "text-slate-900" : "text-[var(--muted)]"}`}>
                  {x.label}
                </span>
              </button>
            ))}
          </div>

          <div className="glass mx-auto mt-6 max-w-4xl overflow-hidden p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={f.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="grid items-center gap-8 md:grid-cols-[auto_1fr]"
              >
                <motion.div
                  animate={{ rotate: [0, 4, -4, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="btn-primary mx-auto grid h-28 w-28 place-items-center rounded-3xl"
                >
                  <Icon size={48} />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-[var(--muted)]">{f.text}</p>
                  <ul className="mt-5 space-y-2.5">
                    {f.points.map((p, i) => (
                      <motion.li
                        key={p}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="flex items-start gap-3 text-sm"
                      >
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" />
                        {p}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-sky-400" : "bg-white/15"} ${
        disabled ? "opacity-40" : ""
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${checked ? "right-1" : "left-1"}`}
      />
    </button>
  );
}

export function PrivacyDemo() {
  const [save, setSave] = useState(true);
  const [share, setShare] = useState(false);
  const sharing = save && share;

  const outcome = !save
    ? { key: "a", title: "Analyzed only", text: "The result is shown to you and nothing is stored." }
    : sharing
    ? {
        key: "c",
        title: "Stored privately, shared for review",
        text: "Clinicians can see the image, without the model's prediction, to label it. Only labeled, shared images can enter a training export.",
      }
    : {
        key: "b",
        title: "Stored privately",
        text: "Only you can see this image and its heatmap. It is never used for training.",
      };

  const nodes = [
    { label: "Analysis", sub: "Always runs", on: true, icon: ScanSearch },
    { label: "Your private history", sub: "Only you can see it", on: save, icon: Lock },
    { label: "Clinician review", sub: "Blind to the model", on: sharing, icon: ClipboardCheck },
  ];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Your data, your choice"
          title="Try the"
          accent="privacy switches"
          text="Saving and sharing are two separate choices, made for each analysis."
        />
        <Reveal className="mt-10">
          <div className="glass mx-auto grid max-w-4xl gap-8 p-6 md:grid-cols-2 md:p-10">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Save to my history</p>
                  <p className="text-sm text-[var(--muted)]">Keep the image and heatmap privately.</p>
                </div>
                <Toggle
                  checked={save}
                  label="Save to my history"
                  onChange={(v) => {
                    setSave(v);
                    if (!v) setShare(false);
                  }}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Also allow model improvement</p>
                  <p className="text-sm text-[var(--muted)]">Off by default. Needs saving first.</p>
                </div>
                <Toggle checked={share} disabled={!save} label="Allow model improvement" onChange={setShare} />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={outcome.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="font-semibold">{outcome.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{outcome.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-stretch justify-center">
              {nodes.map((n, i) => {
                const Icon = n.icon;
                return (
                  <div key={n.label}>
                    {i > 0 && (
                      <div className="ml-6 h-8 w-0.5 overflow-hidden rounded bg-white/10">
                        <motion.div
                          animate={{ height: n.on ? "100%" : "0%" }}
                          transition={{ duration: 0.4 }}
                          className="w-full bg-sky-400"
                        />
                      </div>
                    )}
                    <motion.div
                      animate={{ opacity: n.on ? 1 : 0.4, scale: n.on ? 1 : 0.97 }}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${n.on ? "btn-primary" : "bg-white/10"}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-medium">{n.label}</p>
                        <p className="text-xs text-[var(--muted)]">{n.sub}</p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, ClipboardCheck, ScanSearch, ShieldCheck } from "lucide-react";
import { contact } from "../../config/contact.js";
import { useAuth } from "../../lib/auth.jsx";
import { CountUp, Reveal, SectionHeader } from "./parts.jsx";

const stats = [
  { to: 624, label: "test images evaluated" },
  { to: 96.2, decimals: 1, suffix: "%", label: "sensitivity, selected model" },
  { to: 82.9, decimals: 1, suffix: "%", label: "specificity, selected model" },
  { to: 4, label: "model configurations compared" },
];

export function Stats() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="The numbers"
          title="Measured on a"
          accent="held-out test set"
          text="Results for the selected ResNet50 model, with the decision threshold tuned on validation data only."
        />
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <motion.div whileHover={{ y: -6 }} className="glass glow-card p-6 text-center">
                <p className="text-gradient text-4xl font-bold md:text-5xl">
                  <CountUp to={s.to} decimals={s.decimals} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">{s.label}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-[var(--muted)]">
          One public pediatric dataset. These are research results, not a clinical validation.
        </p>
      </div>
    </section>
  );
}

const roles = [
  {
    icon: ScanSearch,
    name: "User",
    text: "Analyze X-rays, keep a private history, print reports, and control your own data.",
  },
  {
    icon: ClipboardCheck,
    name: "Clinician",
    text: "Everything a user can do, plus the blinded review queue and model reports.",
  },
  {
    icon: ShieldCheck,
    name: "Admin",
    text: "Everything a clinician can do, plus user management and the audit log.",
  },
];

export function Roles() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Roles"
          title="The right access for"
          accent="the right person"
          text="Roles are set by an administrator and cannot be edited by users."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {roles.map(({ icon: Icon, name, text }, i) => (
            <Reveal key={name} delay={i * 0.12}>
              <motion.div whileHover={{ y: -8, rotateX: 2 }} className="glass glow-card h-full p-6">
                <div className="btn-primary mb-4 grid h-12 w-12 place-items-center rounded-2xl">
                  <Icon size={22} />
                </div>
                <p className="text-lg font-semibold">{name}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Is this a medical device?",
    a: "No. It is a research prototype and is not certified. It is not for unreviewed clinical use, and a qualified clinician must review every image.",
  },
  {
    q: "What does the model do?",
    a: "A fine-tuned ResNet50 classifies a pediatric chest X-ray as normal or pneumonia and reports a probability. The decision threshold is 0.50.",
  },
  {
    q: "What is Grad-CAM?",
    a: "It highlights the image regions that influenced the model's answer. It shows what the model looked at. It does not localize disease.",
  },
  {
    q: "Can I try it without my own X-rays?",
    a: "Yes. After you sign in, the Analyze page has a gallery of sample images from a public dataset. Samples are never shared for model improvement.",
  },
  {
    q: "What happens to my images?",
    a: "Only if you choose to save one, it is stored privately in your account with its metadata removed. File names and patient identity are never stored. You can download or delete everything at any time.",
  },
  {
    q: "Who built it?",
    a: `${contact.name}, as a TechAscend Track A capstone project.`,
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium"
      >
        {q}
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 text-[var(--muted)]">
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-[var(--muted)]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <SectionHeader eyebrow="FAQ" title="Questions," accent="answered" />
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.05}>
              <FaqItem {...f} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  const { user } = useAuth();
  return (
    <section className="px-6 pb-8 pt-20">
      <Reveal className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl p-[1px]">
          <motion.div
            className="absolute inset-[-100%]"
            style={{ background: "conic-gradient(from 0deg, #38bdf8, #818cf8, #34d399, #38bdf8)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <div className="relative rounded-3xl bg-[#070b14] px-6 py-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Ready to try your <span className="text-gradient">second reader</span>?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[var(--muted)]">
              Create a free account, analyze a sample X-ray in seconds, and see the explanation for yourself.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {user ? (
                <Link to="/analyze">
                  <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="btn-primary inline-block rounded-xl px-8 py-3">
                    Analyze an X-ray
                  </motion.span>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="btn-primary inline-block rounded-xl px-8 py-3">
                      Create an account
                    </motion.span>
                  </Link>
                  <Link to="/login">
                    <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="glass inline-block px-8 py-3 font-medium">
                      Sign in
                    </motion.span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

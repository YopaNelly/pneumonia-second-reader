import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, ExternalLink, HeartPulse, Mail } from "lucide-react";
import { contact } from "../config/contact.js";
import { useAuth } from "../lib/auth.jsx";

const GITHUB =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z";
const LINKEDIN =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";
const X_LOGO =
  "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z";

function Svg({ d, viewBox }) {
  return (
    <svg viewBox={viewBox} width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Letters({ children }) {
  return <span className="text-xs font-bold">{children}</span>;
}

const social = [
  { key: "github", label: "GitHub", icon: <Svg viewBox="0 0 16 16" d={GITHUB} /> },
  { key: "linkedin", label: "LinkedIn", icon: <Svg viewBox="0 0 24 24" d={LINKEDIN} /> },
  { key: "x", label: "X", icon: <Svg viewBox="0 0 24 24" d={X_LOGO} /> },
  { key: "huggingface", label: "Hugging Face", icon: <Letters>HF</Letters> },
  { key: "kaggle", label: "Kaggle", icon: <Letters>K</Letters> },
  { key: "medium", label: "Medium", icon: <Letters>M</Letters> },
];

const isUrl = (v) => typeof v === "string" && /^https:\/\//i.test(v.trim());
const isEmail = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const linkClass = "inline-flex items-center gap-1.5 transition hover:text-white";

function Ext({ href, children }) {
  return (
    <li>
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {children}
        <ExternalLink size={12} />
      </a>
    </li>
  );
}

function Section({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 md:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left font-semibold md:pointer-events-none md:py-0 md:pb-3"
      >
        {title}
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-[var(--muted)] md:hidden">
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <motion.div
        key={String(open)}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${open ? "block pb-4" : "hidden"} md:block md:pb-0`}
      >
        <ul className="space-y-2.5 text-sm text-[var(--muted)]">{children}</ul>
      </motion.div>
    </div>
  );
}

export default function Footer() {
  const { user } = useAuth();
  const links = social.filter((s) => isUrl(contact.links[s.key]));
  const email = isEmail(contact.email) ? contact.email.trim() : "";
  const buttonClass =
    "grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-sky-400/50 hover:bg-sky-400/10 hover:text-white";

  return (
    <footer className="relative z-10 mt-12 border-t border-white/10 bg-black/20 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-8">
          <div className="pb-2">
            <div className="flex items-center gap-3">
              <div className="btn-primary grid h-11 w-11 place-items-center rounded-xl">
                <HeartPulse size={20} />
              </div>
              <div>
                <p className="font-semibold leading-tight">Second Reader</p>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-sky-300">
                  Pneumonia · Pediatric CXR
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-[var(--muted)]">
              A clinical second reader for pediatric chest X-rays with Grad-CAM explanations. Built
              by {contact.name}, {contact.role}.
            </p>
            {(email || links.length > 0) && (
              <div className="mt-5 flex flex-wrap gap-3">
                {email && (
                  <motion.a whileHover={{ y: -3 }} href={`mailto:${email}`} aria-label="Email" className={buttonClass}>
                    <Mail size={18} />
                  </motion.a>
                )}
                {links.map((s) => (
                  <motion.a
                    key={s.key}
                    whileHover={{ y: -3 }}
                    href={contact.links[s.key].trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={buttonClass}
                  >
                    {s.icon}
                  </motion.a>
                ))}
              </div>
            )}
          </div>

          <Section title="Project">
            {user && (
              <>
                <li>
                  <Link to="/model-card" className={linkClass}>Model card</Link>
                </li>
                <li>
                  <Link to="/privacy" className={linkClass}>Privacy and data</Link>
                </li>
              </>
            )}
            {isUrl(contact.repo) && <Ext href={contact.repo}>Source code</Ext>}
          </Section>

          <Section title="Resources">
            <Ext href="https://data.mendeley.com/datasets/rscbjbr9sj/2">Dataset (Kermany et al., CC BY 4.0)</Ext>
            <Ext href="https://www.tech-ascend.com">TechAscend</Ext>
          </Section>

          <Section title="Contact">
            {email && (
              <li>
                <a href={`mailto:${email}`} className={linkClass}>
                  <Mail size={13} /> {email}
                </a>
              </li>
            )}
            {links.map((s) => (
              <Ext key={s.key} href={contact.links[s.key].trim()}>
                {s.label}
              </Ext>
            ))}
            {!email && links.length === 0 && <li>Contact details coming soon.</li>}
          </Section>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[var(--muted)]">
          <p>
            © {new Date().getFullYear()} {contact.name}. Research prototype, not a certified medical device.
          </p>
          {user && (
            <div className="flex gap-4">
              <Link to="/privacy" className="transition hover:text-white">Privacy and data</Link>
              <Link to="/model-card" className="transition hover:text-white">Model card</Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

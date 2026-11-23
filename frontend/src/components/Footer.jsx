import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUp, Brain, Database, HeartPulse, Mail, ShieldCheck } from "lucide-react";
import { contact } from "../config/contact.js";
import { useAuth } from "../lib/auth.jsx";

const GITHUB =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z";
const LINKEDIN =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";
const X_LOGO =
  "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z";

function Svg({ children, viewBox = "0 0 24 24", ...props }) {
  return (
    <svg viewBox={viewBox} width="20" height="20" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

const icons = {
  github: (
    <Svg viewBox="0 0 16 16" fill="currentColor">
      <path d={GITHUB} />
    </Svg>
  ),
  linkedin: (
    <Svg fill="currentColor">
      <path d={LINKEDIN} />
    </Svg>
  ),
  x: (
    <Svg fill="currentColor">
      <path d={X_LOGO} />
    </Svg>
  ),
  huggingface: (
    <span className="text-xl leading-none" role="img" aria-label="Hugging Face">
      🤗
    </span>
  ),
  kaggle: (
    <Svg fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4v16" />
      <path d="M17.5 5.5L9 13" />
      <path d="M11.5 11l6.5 8.5" />
    </Svg>
  ),
  medium: (
    <Svg fill="currentColor">
      <circle cx="7" cy="12" r="5.5" />
      <ellipse cx="16.5" cy="12" rx="2.8" ry="5.2" />
      <ellipse cx="21.8" cy="12" rx="1.1" ry="4.6" />
    </Svg>
  ),
  mail: <Mail size={20} />,
  model: <Brain size={20} />,
  privacy: <ShieldCheck size={20} />,
  dataset: <Database size={20} />,
  techascend: <span className="text-sm font-extrabold tracking-tight">TA</span>,
};

const social = [
  { key: "github", label: "GitHub", color: "#e2e8f0" },
  { key: "linkedin", label: "LinkedIn", color: "#38a3f5" },
  { key: "x", label: "X", color: "#ffffff" },
  { key: "huggingface", label: "Hugging Face", color: "#fbbf24" },
  { key: "kaggle", label: "Kaggle", color: "#20beff" },
  { key: "medium", label: "Medium", color: "#e2e8f0" },
];

const isUrl = (v) => typeof v === "string" && /^https:\/\//i.test(v.trim());
const isEmail = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function IconLink({ href, to, label, color, external = true, children }) {
  const style = {
    color: "#cbd5e1",
    borderColor: "rgba(255,255,255,0.1)",
    boxShadow: "0 0 0 0 rgba(0,0,0,0)",
  };
  const hover = { y: -5, scale: 1.08, color, borderColor: color, boxShadow: `0 12px 30px -10px ${color}` };
  const cls = "group relative grid h-12 w-12 place-items-center rounded-2xl border bg-white/5";
  const tip = (
    <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs text-white opacity-0 ring-1 ring-white/10 transition group-hover:opacity-100 group-focus-visible:opacity-100">
      {label}
    </span>
  );

  if (to) {
    return (
      <motion.div whileHover={hover} style={style} className={cls}>
        <Link to={to} aria-label={label} title={label} className="absolute inset-0 grid place-items-center">
          {children}
        </Link>
        {tip}
      </motion.div>
    );
  }
  return (
    <motion.a
      whileHover={hover}
      style={style}
      className={cls}
      href={href}
      aria-label={label}
      title={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      {tip}
    </motion.a>
  );
}

function Group({ title, children }) {
  return (
    <div className="text-center">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)]">{title}</p>
      <div className="flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

export default function Footer() {
  const { user } = useAuth();
  const email = isEmail(contact.email) ? contact.email.trim() : "";
  const links = social.filter((s) => isUrl(contact.links[s.key]));
  const hasConnect = Boolean(email) || links.length > 0;

  return (
    <footer className="relative z-10 mt-16 overflow-hidden border-t border-white/10 bg-black/30 backdrop-blur">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        style={{
          transformOrigin: "50% 50%",
          background: "linear-gradient(90deg, transparent, #38bdf8, #818cf8, #34d399, transparent)",
        }}
        className="absolute inset-x-0 top-0 h-px"
      />
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-[40rem] max-w-full -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 py-12">
        <div className="text-center">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.08 }}
            className="btn-primary relative mx-auto grid h-14 w-14 place-items-center rounded-2xl"
          >
            <motion.span
              className="absolute inset-0 rounded-2xl ring-2 ring-sky-300/50"
              animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
            <HeartPulse size={26} />
          </motion.div>
          <p className="mt-4 text-xl font-semibold">Second Reader</p>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-sky-300">
            Pneumonia · Pediatric CXR
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
            Built by {contact.name}, {contact.role}.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-x-14 gap-y-10">
          {hasConnect && (
            <Group title="Connect">
              {email && (
                <IconLink href={`mailto:${email}`} label={email} color="#38bdf8" external={false}>
                  {icons.mail}
                </IconLink>
              )}
              {links.map((s) => (
                <IconLink key={s.key} href={contact.links[s.key].trim()} label={s.label} color={s.color}>
                  {icons[s.key]}
                </IconLink>
              ))}
            </Group>
          )}

          <Group title="Project">
            {isUrl(contact.repo) && (
              <IconLink href={contact.repo} label="Source code" color="#e2e8f0">
                {icons.github}
              </IconLink>
            )}
            {user && (
              <>
                <IconLink to="/model-card" label="Model card" color="#38bdf8">
                  {icons.model}
                </IconLink>
                <IconLink to="/privacy" label="Privacy and data" color="#34d399">
                  {icons.privacy}
                </IconLink>
              </>
            )}
          </Group>

          <Group title="Resources">
            <IconLink href="https://data.mendeley.com/datasets/rscbjbr9sj/2" label="Dataset (Kermany et al., CC BY 4.0)" color="#34d399">
              {icons.dataset}
            </IconLink>
            <IconLink href="https://www.tech-ascend.com" label="TechAscend" color="#818cf8">
              {icons.techascend}
            </IconLink>
          </Group>
        </div>

        <div className="mt-10 flex justify-center">
          <motion.button
            type="button"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-sky-400/50 hover:text-white"
          >
            <ArrowUp size={18} />
          </motion.button>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-[var(--muted)]">
          <p>
            © {new Date().getFullYear()} {contact.name}
          </p>
          <p className="mt-1">Research prototype. Not a certified medical device. Not for unreviewed clinical use.</p>
        </div>
      </div>
    </footer>
  );
}

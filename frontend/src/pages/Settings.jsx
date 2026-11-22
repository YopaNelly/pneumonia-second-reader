import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Activity, ChevronRight, Clock, Save, Sparkles } from "lucide-react";
import { PageHeader } from "../components/ui.jsx";
import AboutLinks from "../components/AboutLinks.jsx";
import { useSettings } from "../lib/settings.jsx";
import { useToast } from "../lib/toast.jsx";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-sky-400" : "bg-white/15"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${checked ? "right-1" : "left-1"}`}
      />
    </button>
  );
}

function Row({ icon: Icon, title, text, children }) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10">
          <Icon size={18} className="text-sky-300" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-[var(--muted)]">{text}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { settings, update } = useSettings();
  const toast = useToast();

  function change(patch, message) {
    update(patch);
    toast(message, "success");
  }

  return (
    <div>
      <PageHeader title="" accent="Settings" subtitle="These preferences are stored in this browser." />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass divide-y divide-white/10 overflow-hidden"
      >
        <Row icon={Clock} title="Auto sign-out" text="Sign out automatically after a period of inactivity.">
          <select
            value={settings.autoLogout}
            onChange={(e) => change({ autoLogout: Number(e.target.value) }, "Auto sign-out updated")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-sky-400"
          >
            <option value={0} className="bg-slate-900">Never</option>
            <option value={15} className="bg-slate-900">15 minutes</option>
            <option value={30} className="bg-slate-900">30 minutes</option>
            <option value={60} className="bg-slate-900">60 minutes</option>
          </select>
        </Row>

        <Row icon={Save} title="Save analyses by default" text="Start each analysis with “Save to my history” ticked.">
          <Toggle checked={settings.saveByDefault} onChange={(v) => change({ saveByDefault: v }, "Preference saved")} />
        </Row>

        <Row icon={Sparkles} title="Reduce animations" text="Turns off movement effects, for comfort or older computers.">
          <Toggle checked={settings.reduceMotion} onChange={(v) => change({ reduceMotion: v }, "Preference saved")} />
        </Row>
      </motion.div>

      <AboutLinks />

      <Link to="/system">
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="glass glow-card mt-5 flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
              <Activity size={18} className="text-emerald-300" />
            </div>
            <div>
              <p className="font-medium">System health</p>
              <p className="text-sm text-[var(--muted)]">Check that the API and the model are running.</p>
            </div>
          </div>
          <ChevronRight className="text-[var(--muted)]" />
        </motion.div>
      </Link>
    </div>
  );
}

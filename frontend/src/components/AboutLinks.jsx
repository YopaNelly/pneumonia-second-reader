import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, ChevronRight, ShieldCheck } from "lucide-react";

const links = [
  { to: "/model-card", icon: Brain, title: "Model card", text: "Performance, intended use, and limitations.", color: "text-sky-300" },
  { to: "/privacy", icon: ShieldCheck, title: "Privacy and data", text: "What is stored, and how to download or delete it.", color: "text-emerald-300" },
];

export default function AboutLinks() {
  return (
    <div className="mt-5 space-y-5">
      {links.map(({ to, icon: Icon, title, text, color }) => (
        <Link key={to} to={to}>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="glass glow-card mb-5 flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-[var(--muted)]">{text}</p>
              </div>
            </div>
            <ChevronRight className="text-[var(--muted)]" />
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

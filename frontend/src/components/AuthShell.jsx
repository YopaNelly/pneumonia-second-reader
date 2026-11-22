import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import { Background } from "./ui.jsx";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="bg-aurora relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <Background />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="glass relative z-10 w-full max-w-md p-8 shadow-2xl"
      >
        <Link to="/welcome" className="btn-primary mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl">
          <HeartPulse size={26} />
        </Link>
        <h1 className="text-center text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-center text-sm text-[var(--muted)]">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <div className="mt-6 text-center text-sm text-[var(--muted)]">{footer}</div>
      </motion.div>
    </div>
  );
}

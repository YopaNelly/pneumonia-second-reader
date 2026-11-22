import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Background } from "../components/ui.jsx";

export default function AccessDenied() {
  return (
    <div className="bg-aurora relative grid min-h-screen place-items-center overflow-hidden px-6 text-center">
      <Background />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass relative z-10 max-w-md p-10">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-rose-400/15"
        >
          <ShieldAlert size={30} className="text-rose-300" />
        </motion.div>
        <p className="text-2xl font-semibold">Access denied</p>
        <p className="mt-2 text-sm text-[var(--muted)]">You do not have permission to view this page.</p>
        <Link to="/dashboard" className="btn-primary mt-6 inline-block rounded-xl px-7 py-3">
          Back to the dashboard
        </Link>
      </motion.div>
    </div>
  );
}

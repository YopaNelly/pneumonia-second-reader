import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Background } from "../components/ui.jsx";

export default function SessionExpired() {
  return (
    <div className="bg-aurora relative grid min-h-screen place-items-center overflow-hidden px-6 text-center">
      <Background />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass relative z-10 max-w-md p-10">
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-amber-400/15"
        >
          <Clock size={30} className="text-amber-300" />
        </motion.div>
        <p className="text-2xl font-semibold">Session expired</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          For your security you were signed out. Please sign in again to continue.
        </p>
        <Link to="/login" className="btn-primary mt-6 inline-block rounded-xl px-7 py-3">
          Sign in
        </Link>
      </motion.div>
    </div>
  );
}

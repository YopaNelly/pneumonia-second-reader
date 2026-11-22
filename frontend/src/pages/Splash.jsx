import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import { useAuth } from "../lib/auth.jsx";
import { Background } from "../components/ui.jsx";

export default function Splash() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimeUp(true), 2400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (timeUp && ready) navigate(user ? "/dashboard" : "/welcome", { replace: true });
  }, [timeUp, ready, user, navigate]);

  return (
    <div className="bg-aurora relative grid min-h-screen place-items-center overflow-hidden px-6">
      <Background />
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 14 }}
          className="btn-primary relative mx-auto mb-6 grid h-24 w-24 place-items-center rounded-3xl"
        >
          <motion.span
            className="absolute inset-0 rounded-3xl ring-2 ring-sky-300/60"
            animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
          <HeartPulse size={44} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-semibold"
        >
          Pneumonia <span className="text-gradient">Second Reader</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-2 text-[var(--muted)]"
        >
          Detect. Explain. Support the clinician.
        </motion.p>

        <div className="mx-auto mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="btn-primary h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}

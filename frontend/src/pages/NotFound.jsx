import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Background } from "../components/ui.jsx";

export default function NotFound() {
  return (
    <div className="bg-aurora relative grid min-h-screen place-items-center overflow-hidden px-6 text-center">
      <Background />
      <div className="relative z-10">
        <motion.div
          animate={{ rotate: [0, 12, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-white/10"
        >
          <Compass size={38} className="text-sky-300" />
        </motion.div>
        <p className="text-gradient text-7xl font-bold">404</p>
        <p className="mt-2 text-lg">This page does not exist.</p>
        <Link to="/dashboard" className="btn-primary mt-6 inline-block rounded-xl px-6 py-3">
          Back to the dashboard
        </Link>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, HeartPulse, History as HistoryIcon, ShieldCheck } from "lucide-react";
import { Background } from "../components/ui.jsx";
import Footer from "../components/Footer.jsx";

const features = [
  { icon: Brain, title: "Second-reader AI", text: "ResNet50 fine-tuned for pediatric chest X-rays." },
  { icon: ShieldCheck, title: "Explainable", text: "Grad-CAM heatmaps show what influenced the model." },
  { icon: HistoryIcon, title: "Your private history", text: "Revisit every saved analysis, any time." },
];

export default function Welcome() {
  return (
    <div className="bg-aurora relative min-h-screen overflow-hidden px-6 py-14">
      <Background />
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 14 }}
          className="btn-primary mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl"
        >
          <HeartPulse size={38} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl font-semibold tracking-tight md:text-5xl"
        >
          A clinical <span className="text-gradient">second reader</span> for pediatric chest X-rays
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mx-auto mt-4 max-w-xl text-[var(--muted)]"
        >
          Upload an X-ray, get a pneumonia assessment with an explanation, and keep your own
          private history of every analysis.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Link to="/signup">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="btn-primary inline-block rounded-xl px-7 py-3">
              Get started
            </motion.span>
          </Link>
          <Link to="/login">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="glass inline-block px-7 py-3 font-medium">
              Sign in
            </motion.span>
          </Link>
        </motion.div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 + i * 0.12 }}
              whileHover={{ y: -6 }}
              className="glass glow-card p-6 text-left"
            >
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-white/10">
                <Icon size={22} className="text-sky-300" />
              </div>
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{text}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-xs text-[var(--muted)]">
          Research prototype. Not a certified medical device. Not for unreviewed clinical use.
        </p>
      </div>

      <div className="relative z-10 -mx-6 -mb-14 mt-14">
        <Footer />
      </div>
    </div>
  );
}

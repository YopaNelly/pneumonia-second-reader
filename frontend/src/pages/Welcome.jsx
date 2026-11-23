import { motion, useScroll, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import { Background } from "../components/ui.jsx";
import Footer from "../components/Footer.jsx";
import { Hero, Marquee } from "../components/welcome/Hero.jsx";
import { Features, HowItWorks, PrivacyDemo } from "../components/welcome/Story.jsx";
import { Faq, FinalCta, Roles, Stats } from "../components/welcome/Trust.jsx";
import { useAuth } from "../lib/auth.jsx";

function TopBar() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/welcome" className="flex items-center gap-3">
          <div className="btn-primary grid h-9 w-9 place-items-center rounded-xl">
            <HeartPulse size={18} />
          </div>
          <span className="font-semibold">Second Reader</span>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/dashboard" className="btn-primary rounded-xl px-5 py-2 text-sm">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-4 py-2 text-sm text-slate-300 transition hover:text-white">
                Sign in
              </Link>
              <Link to="/signup" className="btn-primary rounded-xl px-5 py-2 text-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function Welcome() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <div className="bg-aurora relative min-h-screen overflow-x-hidden">
      <Background />
      <motion.div
        style={{ scaleX, transformOrigin: "0% 50%" }}
        className="btn-primary fixed inset-x-0 top-0 z-50 h-1"
      />
      <div className="relative z-10">
        <TopBar />
        <Hero />
        <Marquee />
        <HowItWorks />
        <Features />
        <PrivacyDemo />
        <Stats />
        <Roles />
        <Faq />
        <FinalCta />
        <Footer />
      </div>
    </div>
  );
}

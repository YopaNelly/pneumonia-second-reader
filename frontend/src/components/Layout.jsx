import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Brain,
  ClipboardCheck,
  HeartPulse,
  History as HistoryIcon,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  ScanSearch,
  ScrollText,
  Settings as SettingsIcon,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { supabase } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useSettings } from "../lib/settings.jsx";
import { useToast } from "../lib/toast.jsx";
import { Background } from "./ui.jsx";
import Footer from "./Footer.jsx";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, primary: true },
  { to: "/analyze", label: "Analyze", icon: ScanSearch, primary: true },
  { to: "/history", label: "History", icon: HistoryIcon, primary: true },
  { to: "/review", label: "Review", icon: ClipboardCheck, roles: ["clinician", "admin"] },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["clinician", "admin"] },
  { to: "/users", label: "Users", icon: Users, roles: ["admin"] },
  { to: "/audit", label: "Audit log", icon: ScrollText, roles: ["admin"] },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
  { to: "/system", label: "System", icon: Activity },
];

const extras = [
  { to: "/model-card", label: "Model card", icon: Brain },
  { to: "/privacy", label: "Privacy and data", icon: ShieldCheck },
];

function NavItem({ to, label, icon: Icon, compact }) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <div
          className={`relative flex items-center rounded-xl transition ${
            compact ? "flex-col gap-1 px-4 py-2 text-[11px]" : "gap-3 px-4 py-3"
          } ${isActive ? "text-white" : "text-[var(--muted)] hover:text-white"}`}
        >
          {isActive && (
            <motion.span
              layoutId={compact ? "pill-mobile" : "pill-desktop"}
              className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-white/10"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <Icon size={compact ? 20 : 18} className="relative" />
          <span className="relative font-medium">{label}</span>
        </div>
      )}
    </NavLink>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  const { user, role } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirmOut, setConfirmOut] = useState(false);
  const [more, setMore] = useState(false);
  const name = user?.user_metadata?.full_name || user?.email || "";
  const nav = items.filter((i) => !i.roles || i.roles.includes(role));
  const sheet = [...nav.filter((i) => !i.primary), ...extras];
  const moreActive = sheet.some((i) => pathname.startsWith(i.to));

  useEffect(() => {
    setMore(false);
  }, [pathname]);

  useEffect(() => {
    if (!settings.autoLogout) return;
    const ms = settings.autoLogout * 60 * 1000;
    let timer;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.assign("/session-expired");
      }, ms);
    };
    const events = ["mousemove", "keydown", "click", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [settings.autoLogout]);

  async function logout() {
    await supabase.auth.signOut();
    setConfirmOut(false);
    toast("Signed out", "success");
    navigate("/welcome");
  }

  return (
    <div className="bg-aurora min-h-screen">
      <Background />

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-2 border-r border-white/10 bg-black/20 p-5 backdrop-blur md:flex">
        <div className="mb-6 flex items-center gap-3">
          <div className="btn-primary grid h-10 w-10 place-items-center rounded-xl">
            <HeartPulse size={20} />
          </div>
          <div>
            <p className="font-semibold leading-tight">Second Reader</p>
            <p className="text-xs text-[var(--muted)]">Pneumonia · Pediatric CXR</p>
          </div>
        </div>

        {nav.map((i) => (
          <NavItem key={i.to} {...i} />
        ))}

        <div className="mt-auto space-y-3">
          <div className="glass flex items-center gap-3 p-3">
            <div className="btn-primary grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm">{name}</p>
              {role && <p className="text-xs capitalize text-[var(--muted)]">{role}</p>}
            </div>
          </div>
          <button
            onClick={() => setConfirmOut(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-2 text-sm text-[var(--muted)] transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} /> Sign out
          </button>
          <p className="text-xs text-[var(--muted)]">Research prototype. Not a medical device.</p>
        </div>
      </aside>

      <main className="relative z-10 md:pl-64">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-10 md:pt-8"
        >
          <Outlet />
        </motion.div>
        <div className="pb-24 md:pb-0">
          <Footer />
        </div>
      </main>

      <nav className="glass fixed inset-x-3 bottom-3 z-30 flex justify-around p-1 md:hidden">
        {items
          .filter((i) => i.primary)
          .map((i) => (
            <NavItem key={i.to} {...i} compact />
          ))}
        <button
          onClick={() => setMore(true)}
          className={`relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-[11px] transition ${
            moreActive ? "text-white" : "text-[var(--muted)]"
          }`}
        >
          {moreActive && (
            <motion.span
              layoutId="pill-mobile"
              className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-white/10"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <MoreHorizontal size={20} className="relative" />
          <span className="relative font-medium">More</span>
        </button>
      </nav>

      <AnimatePresence>
        {more && (
          <div className="fixed inset-0 z-40 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMore(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="glass absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto p-5 pb-8"
              style={{ borderRadius: "1.5rem 1.5rem 0 0", background: "rgba(10,16,30,0.97)" }}
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />

              <div className="mb-4 flex items-center gap-3">
                <div className="btn-primary grid h-10 w-10 shrink-0 place-items-center rounded-full">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{name}</p>
                  {role && <p className="text-xs capitalize text-[var(--muted)]">{role}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {sheet.map(({ to, label, icon: Icon }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl border p-3 text-sm transition ${
                          isActive
                            ? "border-sky-400/50 bg-sky-400/10 text-white"
                            : "border-white/10 bg-white/5 text-slate-300"
                        }`
                      }
                    >
                      <Icon size={18} className="shrink-0 text-sky-300" />
                      <span className="font-medium">{label}</span>
                    </NavLink>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => {
                  setMore(false);
                  setConfirmOut(true);
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/5 py-3 text-sm text-[var(--muted)]"
              >
                <LogOut size={16} /> Sign out
              </button>
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Research prototype. Not a medical device.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={() => setConfirmOut(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-sm p-6 text-center"
            >
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-sky-400/15">
                <LogOut className="text-sky-300" />
              </div>
              <p className="text-lg font-semibold">Sign out?</p>
              <p className="mt-1 text-sm text-[var(--muted)]">You will need to sign in again to see your history.</p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setConfirmOut(false)} className="flex-1 rounded-xl bg-white/10 py-2.5 text-sm">
                  Cancel
                </button>
                <button onClick={logout} className="btn-primary flex-1 rounded-xl py-2.5 text-sm">
                  Sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

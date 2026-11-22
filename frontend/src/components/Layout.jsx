import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HeartPulse, History as HistoryIcon, LayoutDashboard, LogOut, ScanSearch } from "lucide-react";
import { supabase } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
import { Background } from "./ui.jsx";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyze", label: "Analyze", icon: ScanSearch },
  { to: "/history", label: "History", icon: HistoryIcon },
];

function NavItem({ to, label, icon: Icon, compact }) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <div
          className={`relative flex items-center rounded-xl transition ${
            compact ? "flex-col gap-1 px-4 py-2 text-xs" : "gap-3 px-4 py-3"
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const name = user?.user_metadata?.full_name || user?.email || "";

  async function logout() {
    await supabase.auth.signOut();
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

        {items.map((i) => (
          <NavItem key={i.to} {...i} />
        ))}

        <div className="mt-auto space-y-3">
          <div className="glass flex items-center gap-3 p-3">
            <div className="btn-primary grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <p className="truncate text-sm">{name}</p>
          </div>
          <button
            onClick={logout}
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
          className="mx-auto max-w-5xl px-4 pb-28 pt-8 md:pb-10"
        >
          <Outlet />
        </motion.div>
      </main>

      <nav className="glass fixed inset-x-3 bottom-3 z-20 flex justify-around p-1 md:hidden">
        {items.map((i) => (
          <NavItem key={i.to} {...i} compact />
        ))}
      </nav>
    </div>
  );
}

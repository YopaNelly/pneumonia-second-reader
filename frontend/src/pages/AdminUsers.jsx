import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import { useToast } from "../lib/toast.jsx";
import { PageHeader, Skeleton, fmtDate } from "../components/ui.jsx";

const ROLES = [
  { key: "user", label: "User" },
  { key: "clinician", label: "Clinician" },
  { key: "admin", label: "Admin" },
];

const badge = {
  user: "bg-white/10 text-slate-300",
  clinician: "bg-sky-400/15 text-sky-300",
  admin: "bg-amber-400/15 text-amber-300",
};

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let alive = true;
    api("/api/admin/users")
      .then((d) => alive && setUsers(d.users))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const counts = useMemo(() => {
    const c = { user: 0, clinician: 0, admin: 0 };
    (users || []).forEach((u) => {
      c[u.role] = (c[u.role] || 0) + 1;
    });
    return c;
  }, [users]);

  const shown = (users || []).filter((u) => {
    const q = query.trim().toLowerCase();
    return !q || u.email.toLowerCase().includes(q) || (u.name || "").toLowerCase().includes(q);
  });

  async function changeRole(u, role) {
    if (role === u.role) return;
    if (role === "admin" && !window.confirm(`Give ${u.email} full admin access?`)) return;
    const previous = u.role;
    setBusy(u.id);
    setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, role } : x)));
    try {
      await api(`/api/admin/users/${u.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      toast(`${u.email} is now ${role}`, "success");
    } catch (e) {
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, role: previous } : x)));
      toast(e.message, "error");
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <PageHeader title="User" accent="management" subtitle="Change roles. People must reload the app to see a new role." />

      {error && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div>
      )}

      {!users && !error && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      )}

      {users && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {ROLES.map((r) => (
              <div key={r.key} className="glass p-4 text-center">
                <p className="text-2xl font-semibold">{counts[r.key]}</p>
                <p className="text-sm text-[var(--muted)]">{r.label}s</p>
              </div>
            ))}
          </div>

          <div className="relative mt-5">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input className="field" placeholder="Search by name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <div className="mt-4 space-y-3">
            {shown.length === 0 && <p className="text-[var(--muted)]">No users match your search.</p>}
            {shown.map((u, i) => {
              const self = u.id === me?.id;
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 10) * 0.04 }}
                  className="glass flex flex-wrap items-center gap-4 p-4"
                >
                  <div className="btn-primary grid h-11 w-11 shrink-0 place-items-center rounded-full">
                    {(u.name || u.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-[11rem] flex-1">
                    <p className="flex items-center gap-2 truncate font-medium">
                      {u.name || u.email}
                      {self && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">YOU</span>}
                    </p>
                    <p className="truncate text-sm text-[var(--muted)]">{u.name ? u.email : ""}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {u.last_sign_in_at ? `Last sign-in ${fmtDate(u.last_sign_in_at)}` : "Never signed in"}
                    </p>
                  </div>
                  <span className={`hidden rounded-full px-3 py-1 text-xs font-semibold capitalize sm:inline-block ${badge[u.role]}`}>{u.role}</span>
                  <select
                    value={u.role}
                    disabled={self || busy === u.id}
                    onChange={(e) => changeRole(u, e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-sky-400 disabled:opacity-40 sm:w-auto"
                  >
                    {ROLES.map((r) => (
                      <option key={r.key} value={r.key} className="bg-slate-900">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

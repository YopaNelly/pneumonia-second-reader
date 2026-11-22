import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { api, supabase } from "./api.js";

const AuthContext = createContext({ session: null, user: null, ready: false, role: null });

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setRole(null);
      return;
    }
    let alive = true;
    api("/api/me")
      .then((d) => alive && setRole(d.role))
      .catch(() => alive && setRole("user"));
    return () => {
      alive = false;
    };
  }, [userId]);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, ready, role }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function ProtectedRoute() {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-[var(--muted)]">Loading...</div>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function RoleRoute({ roles }) {
  const { role } = useAuth();
  if (!role) return <div className="py-20 text-center text-[var(--muted)]">Loading...</div>;
  if (!roles.includes(role)) return <Navigate to="/access-denied" replace />;
  return <Outlet />;
}

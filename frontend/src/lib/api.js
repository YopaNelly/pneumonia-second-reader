import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const configured = Boolean(url && key);
export const supabase = createClient(url || "http://localhost:9", key || "missing-key");

export const BASE = import.meta.env.VITE_API_URL || "";

export async function api(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error("Cannot reach the API. Is the backend running?");
  }

  const body = await res.json().catch(() => ({}));
  if (res.status === 401) {
    await supabase.auth.signOut();
    window.location.assign("/session-expired");
    throw new Error(body.error || "Session expired. Please sign in again.");
  }
  if (!res.ok) throw new Error(body.error || "Request failed");
  return body;
}

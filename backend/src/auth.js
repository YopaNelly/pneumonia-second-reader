const { supabase } = require("./db");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Please sign in" });
  if (!supabase) return res.status(503).json({ error: "Auth is not configured" });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data || !data.user) {
    return res.status(401).json({ error: "Session expired. Please sign in again." });
  }
  req.user = data.user;
  next();
}

module.exports = { requireAuth };

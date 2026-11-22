const { supabase } = require("./db");

function roleOf(user) {
  const role = user.app_metadata && user.app_metadata.role;
  return ["clinician", "admin"].includes(role) ? role : "user";
}

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
  req.role = roleOf(data.user);
  next();
}

function requireRole(...roles) {
  return [
    requireAuth,
    (req, res, next) =>
      roles.includes(req.role)
        ? next()
        : res.status(403).json({ error: "You do not have permission for this action" }),
  ];
}

module.exports = { requireAuth, requireRole };

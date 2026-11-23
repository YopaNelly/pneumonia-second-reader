const express = require("express");
const { supabase } = require("../db");
const { requireRole } = require("../auth");
const { audit } = require("../audit");

const router = express.Router();
router.use(requireRole("admin"));

const ROLES = ["user", "clinician", "admin"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function roleOf(user) {
  const role = user.app_metadata && user.app_metadata.role;
  return ROLES.includes(role) ? role : "user";
}

router.get("/users", async (req, res, next) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) throw error;
    const users = data.users
      .map((u) => ({
        id: u.id,
        email: u.email,
        name: (u.user_metadata && u.user_metadata.full_name) || null,
        role: roleOf(u),
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at || null,
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ users });
  } catch (e) {
    next(e);
  }
});

router.patch("/users/:id/role", async (req, res, next) => {
  try {
    const role = req.body && req.body.role;
    if (!ROLES.includes(role)) return res.status(400).json({ error: "Invalid role" });
    if (!UUID.test(req.params.id)) return res.status(404).json({ error: "User not found" });
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "You cannot change your own role" });
    }

    const { data: found, error: findErr } = await supabase.auth.admin.getUserById(req.params.id);
    if (findErr || !found || !found.user) return res.status(404).json({ error: "User not found" });

    const before = roleOf(found.user);
    const { error } = await supabase.auth.admin.updateUserById(req.params.id, {
      app_metadata: { ...(found.user.app_metadata || {}), role },
    });
    if (error) throw error;

    await audit(req.user, "role.change", req.params.id, {
      email: found.user.email,
      from: before,
      to: role,
    });
    res.json({ id: req.params.id, role });
  } catch (e) {
    next(e);
  }
});

router.get("/audit", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    res.json({ items: data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;

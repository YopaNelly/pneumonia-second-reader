const { supabase } = require("./db");

// Never throws: a failed log entry must not break the action it records.
async function audit(user, action, target, detail) {
  try {
    const { error } = await supabase.from("audit_log").insert({
      actor_id: user ? user.id : null,
      actor_email: user ? user.email : null,
      action,
      target: target || null,
      detail: detail || null,
    });
    if (error) console.error("Audit failed:", error.message);
  } catch (e) {
    console.error("Audit failed:", e.message);
  }
}

module.exports = { audit };

const express = require("express");
const { supabase } = require("../db");

const router = express.Router();
const BUCKET = "xrays";

async function removeAllForUser(userId) {
  let removed = 0;
  for (let round = 0; round < 100; round++) {
    const { data, error } = await supabase
      .from("predictions")
      .select("id, image_path, gradcam_path")
      .eq("user_id", userId)
      .limit(100);
    if (error) throw error;
    if (!data.length) break;

    const files = data.flatMap((r) => [r.image_path, r.gradcam_path]).filter(Boolean);
    if (files.length) {
      const { error: rmErr } = await supabase.storage.from(BUCKET).remove(files);
      if (rmErr) throw rmErr;
    }
    const { error: delErr } = await supabase
      .from("predictions")
      .delete()
      .in("id", data.map((r) => r.id));
    if (delErr) throw delErr;
    removed += data.length;
  }
  return removed;
}

router.get("/export", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("id, created_at, predicted_label, probability, threshold, model_version, confirmed_label, consent")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) throw error;
    res.json({
      exported_at: new Date().toISOString(),
      account: {
        email: req.user.email,
        name: (req.user.user_metadata && req.user.user_metadata.full_name) || null,
        role: req.role,
      },
      analyses: data,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/withdraw-consent", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .update({ consent: false })
      .eq("user_id", req.user.id)
      .eq("consent", true)
      .select("id");
    if (error) throw error;
    res.json({ withdrawn: data.length });
  } catch (e) {
    next(e);
  }
});

router.delete("/data", async (req, res, next) => {
  try {
    res.json({ deleted: await removeAllForUser(req.user.id) });
  } catch (e) {
    next(e);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const deleted = await removeAllForUser(req.user.id);
    const { error } = await supabase.auth.admin.deleteUser(req.user.id);
    if (error) throw error;
    res.json({ deleted, account: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;

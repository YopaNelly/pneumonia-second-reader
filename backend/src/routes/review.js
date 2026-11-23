const express = require("express");
const { supabase } = require("../db");
const { requireRole } = require("../auth");
const { signUrls } = require("../urls");
const { audit } = require("../audit");

const router = express.Router();
router.use(requireRole("clinician", "admin"));

const LABELS = ["NORMAL", "PNEUMONIA"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function canReview(record, user) {
  return record.consent === true || record.user_id === user.id;
}

async function loadRecord(id, user) {
  if (!UUID.test(id)) return null;
  const { data, error } = await supabase.from("predictions").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data || !canReview(data, user)) return null;
  return data;
}

// Oldest first, and no model output: reviews are blinded.
router.get("/queue", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("id, created_at, image_path")
      .eq("consent", true)
      .is("confirmed_label", null)
      .order("created_at", { ascending: true })
      .limit(50);
    if (error) throw error;
    const urls = await signUrls(data.map((r) => r.image_path));
    res.json({
      items: data.map((r) => ({
        id: r.id,
        created_at: r.created_at,
        image_url: urls[r.image_path] || null,
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const rec = await loadRecord(req.params.id, req.user);
    if (!rec) return res.status(404).json({ error: "Case not found" });
    const urls = await signUrls([rec.image_path, rec.gradcam_path]);
    res.json({
      id: rec.id,
      created_at: rec.created_at,
      image_url: urls[rec.image_path] || null,
      gradcam_url: urls[rec.gradcam_path] || null,
      already_reviewed: Boolean(rec.confirmed_label),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/:id", async (req, res, next) => {
  try {
    const label = req.body && req.body.label;
    if (!LABELS.includes(label)) {
      return res.status(400).json({ error: "Choose NORMAL or PNEUMONIA" });
    }
    const notes = String((req.body && req.body.notes) || "").trim().slice(0, 500);

    const rec = await loadRecord(req.params.id, req.user);
    if (!rec) return res.status(404).json({ error: "Case not found" });

    const reviewer =
      (req.user.user_metadata && req.user.user_metadata.full_name) || req.user.email;

    const { error } = await supabase
      .from("predictions")
      .update({
        confirmed_label: label,
        reviewed_by: reviewer,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
      })
      .eq("id", rec.id);
    if (error) throw error;

    await audit(req.user, "review.submit", rec.id, { label, agreed: rec.predicted_label === label });

    res.json({
      confirmed_label: label,
      predicted_label: rec.predicted_label,
      probability: rec.probability,
      agreed: rec.predicted_label === label,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;

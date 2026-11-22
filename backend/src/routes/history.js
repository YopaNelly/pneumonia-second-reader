const express = require("express");
const { supabase } = require("../db");

const router = express.Router();
const BUCKET = "xrays";

async function withUrls(rows) {
  const paths = rows.flatMap((r) => [r.image_path, r.gradcam_path].filter(Boolean));
  const map = {};
  if (paths.length) {
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
    for (const d of data || []) {
      if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
    }
  }
  return rows.map((r) => ({
    id: r.id,
    created_at: r.created_at,
    predicted_label: r.predicted_label,
    probability: r.probability,
    threshold: r.threshold,
    model_version: r.model_version,
    confirmed_label: r.confirmed_label,
    consent: r.consent,
    image_url: map[r.image_path] || null,
    gradcam_url: map[r.gradcam_path] || null,
  }));
}

router.get("/stats", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("predicted_label, confirmed_label, probability, created_at")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw error;

    const total = data.length;
    const pneumonia = data.filter((r) => r.predicted_label === "PNEUMONIA").length;
    const confirmed = data.filter((r) => r.confirmed_label);
    const agree = confirmed.filter((r) => r.confirmed_label === r.predicted_label).length;

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: data.filter((r) => r.created_at.slice(0, 10) === key).length });
    }

    res.json({
      total,
      pneumonia,
      normal: total - pneumonia,
      confirmed: confirmed.length,
      pending: total - confirmed.length,
      agreement: confirmed.length ? agree / confirmed.length : null,
      last7days: days,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    res.json({ items: await withUrls(data) });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Record not found" });
    const [item] = await withUrls([data]);
    res.json(item);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("id, image_path, gradcam_path")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Record not found" });

    const files = [data.image_path, data.gradcam_path].filter(Boolean);
    if (files.length) await supabase.storage.from(BUCKET).remove(files);
    const { error: delErr } = await supabase.from("predictions").delete().eq("id", data.id);
    if (delErr) throw delErr;
    res.json({ deleted: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;

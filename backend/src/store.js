const crypto = require("crypto");
const sharp = require("sharp");
const { supabase } = require("./db");

const BUCKET = "xrays";
const MODEL_VERSION = process.env.MODEL_VERSION || "unversioned";

async function saveRecord({ buffer, result }) {
  if (!supabase) throw new Error("Supabase is not configured");

  // Re-encode to PNG: drops all metadata (EXIF etc.) and keeps pixels lossless.
  const clean = await sharp(buffer).png().toBuffer();
  const sha = crypto.createHash("sha256").update(clean).digest("hex");

  const { data: existing, error: lookupErr } = await supabase
    .from("predictions")
    .select("id")
    .eq("image_sha256", sha)
    .maybeSingle();
  if (lookupErr) throw lookupErr;
  if (existing) return { id: existing.id, duplicate: true };

  const path = `unreviewed/${sha}.png`;
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, clean, { contentType: "image/png", upsert: false });
  if (uploadErr) throw uploadErr;

  const { data, error: insertErr } = await supabase
    .from("predictions")
    .insert({
      image_path: path,
      image_sha256: sha,
      predicted_label: result.label,
      probability: result.probability,
      threshold: result.threshold,
      model_version: MODEL_VERSION,
      consent: true,
    })
    .select("id")
    .single();

  if (insertErr) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw insertErr;
  }
  return { id: data.id, duplicate: false };
}

module.exports = { saveRecord };

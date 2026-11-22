const crypto = require("crypto");
const sharp = require("sharp");
const { supabase } = require("./db");

const BUCKET = "xrays";
const MODEL_VERSION = process.env.MODEL_VERSION || "unversioned";

async function saveRecord({ buffer, result, userId, trainingConsent }) {
  if (!supabase) throw new Error("Supabase is not configured");

  // Re-encode to PNG: drops all metadata (EXIF etc.) and keeps pixels lossless.
  const clean = await sharp(buffer).png().toBuffer();
  const sha = crypto.createHash("sha256").update(clean).digest("hex");

  const { data: existing, error: lookupErr } = await supabase
    .from("predictions")
    .select("id, consent")
    .eq("user_id", userId)
    .eq("image_sha256", sha)
    .maybeSingle();
  if (lookupErr) throw lookupErr;
  if (existing) {
    if (trainingConsent && !existing.consent) {
      await supabase.from("predictions").update({ consent: true }).eq("id", existing.id);
    }
    return { id: existing.id, duplicate: true };
  }

  const imagePath = `${userId}/${sha}.png`;
  const camPath = `${userId}/${sha}_cam.png`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(imagePath, clean, { contentType: "image/png", upsert: true });
  if (upErr) throw upErr;

  let gradcamPath = null;
  if (result.gradcam_base64) {
    const cam = Buffer.from(result.gradcam_base64, "base64");
    const { error: camErr } = await supabase.storage
      .from(BUCKET)
      .upload(camPath, cam, { contentType: "image/png", upsert: true });
    if (!camErr) gradcamPath = camPath;
  }

  const { data, error: insertErr } = await supabase
    .from("predictions")
    .insert({
      user_id: userId,
      image_path: imagePath,
      gradcam_path: gradcamPath,
      image_sha256: sha,
      predicted_label: result.label,
      probability: result.probability,
      threshold: result.threshold,
      model_version: MODEL_VERSION,
      consent: Boolean(trainingConsent),
    })
    .select("id")
    .single();

  if (insertErr) {
    await supabase.storage.from(BUCKET).remove([imagePath, camPath]);
    throw insertErr;
  }
  return { id: data.id, duplicate: false };
}

module.exports = { saveRecord };

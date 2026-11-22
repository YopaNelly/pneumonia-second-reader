const { supabase } = require("./db");

const BUCKET = "xrays";

async function signUrls(paths) {
  const unique = [...new Set(paths.filter(Boolean))];
  const map = {};
  if (!unique.length) return map;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(unique, 3600);
  for (const d of data || []) {
    if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
  }
  return map;
}

module.exports = { signUrls };

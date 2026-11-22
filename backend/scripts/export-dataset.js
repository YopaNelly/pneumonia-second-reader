require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs/promises");
const path = require("path");
const { supabase } = require("../src/db");

const OUT = path.resolve(process.argv[2] || "dataset-export");
const BUCKET = "xrays";

const COLUMNS = [
  "file",
  "confirmed_label",
  "predicted_label",
  "probability",
  "threshold",
  "model_version",
  "reviewed_by",
  "reviewed_at",
  "image_sha256",
];

function csvCell(value) {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  if (!supabase) throw new Error("Supabase is not configured. Check backend/.env");

  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .not("confirmed_label", "is", null)
    .eq("consent", true)
    .order("created_at");
  if (error) throw error;

  if (!data.length) {
    console.log("No confirmed records to export.");
    return;
  }

  const lines = [COLUMNS.join(",")];
  const counts = {};

  for (const r of data) {
    const rel = path.join(r.confirmed_label, `${r.image_sha256}.png`);
    const dest = path.join(OUT, rel);
    await fs.mkdir(path.dirname(dest), { recursive: true });

    const { data: blob, error: dlErr } = await supabase.storage
      .from(BUCKET)
      .download(r.image_path);
    if (dlErr) {
      console.error(`Skipping ${r.id}: ${dlErr.message}`);
      continue;
    }
    await fs.writeFile(dest, Buffer.from(await blob.arrayBuffer()));

    counts[r.confirmed_label] = (counts[r.confirmed_label] || 0) + 1;
    lines.push(
      [
        rel.split(path.sep).join("/"),
        r.confirmed_label,
        r.predicted_label,
        r.probability,
        r.threshold,
        r.model_version,
        r.reviewed_by,
        r.reviewed_at,
        r.image_sha256,
      ]
        .map(csvCell)
        .join(",")
    );
  }

  await fs.writeFile(path.join(OUT, "manifest.csv"), lines.join("\n") + "\n");
  console.log(`Exported to ${OUT}`);
  console.log(counts);
}

main().catch((e) => {
  console.error("Export failed:", e.message);
  process.exit(1);
});

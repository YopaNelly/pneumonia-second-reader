const express = require("express");
const { supabase } = require("../db");
const { requireRole } = require("../auth");

const router = express.Router();
router.use(requireRole("clinician", "admin"));

// Wilson score interval for a proportion (95%).
function wilson(k, n, z = 1.96) {
  const p = k / n;
  const denom = 1 + (z * z) / n;
  const centre = (p + (z * z) / (2 * n)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
  return [Math.max(0, centre - margin), Math.min(1, centre + margin)];
}

function rate(k, n) {
  return n ? { value: k / n, ci: wilson(k, n), k, n } : { value: null, ci: null, k, n };
}

router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("predicted_label, confirmed_label, reviewed_by")
      .not("confirmed_label", "is", null)
      .or(`consent.eq.true,user_id.eq.${req.user.id}`)
      .limit(5000);
    if (error) throw error;

    let tp = 0;
    let fp = 0;
    let fn = 0;
    let tn = 0;
    for (const r of data) {
      const truth = r.confirmed_label === "PNEUMONIA";
      const pred = r.predicted_label === "PNEUMONIA";
      if (truth && pred) tp++;
      else if (!truth && pred) fp++;
      else if (truth && !pred) fn++;
      else tn++;
    }
    const total = data.length;

    const { count } = await supabase
      .from("predictions")
      .select("id", { count: "exact", head: true })
      .eq("consent", true)
      .is("confirmed_label", null);

    res.json({
      total,
      pending: count || 0,
      reviewers: new Set(data.map((r) => r.reviewed_by).filter(Boolean)).size,
      matrix: { tp, fp, fn, tn },
      agreement: rate(tp + tn, total),
      sensitivity: rate(tp, tp + fn),
      specificity: rate(tn, tn + fp),
      ppv: rate(tp, tp + fp),
      npv: rate(tn, tn + fn),
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Flame, Loader2, XCircle } from "lucide-react";
import { api } from "../lib/api.js";
import { useToast } from "../lib/toast.jsx";
import { LabelBadge, Skeleton } from "../components/ui.jsx";

export default function ReviewCase() {
  const { id } = useParams();
  const toast = useToast();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [choice, setChoice] = useState(null);
  const [notes, setNotes] = useState("");
  const [heat, setHeat] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    let alive = true;
    api(`/api/review/${id}`)
      .then((d) => alive && setItem(d))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  async function submit() {
    if (!choice) return;
    setSaving(true);
    try {
      const res = await api(`/api/review/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: choice, notes }),
      });
      setDone(res);
      toast("Review saved", "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const back = (
    <Link to="/review" className="mb-4 inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200">
      <ArrowLeft size={16} /> Back to queue
    </Link>
  );

  if (error) {
    return (
      <div>
        {back}
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="aspect-square" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  const options = [
    { key: "PNEUMONIA", label: "Pneumonia", on: "border-rose-400 bg-rose-400/15 text-rose-200" },
    { key: "NORMAL", label: "Normal", on: "border-emerald-400 bg-emerald-400/15 text-emerald-200" },
  ];

  return (
    <div>
      {back}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="glass p-3">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-black">
            <div className="absolute inset-0 transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
              {item.image_url && <img src={item.image_url} alt="X-ray" className="absolute inset-0 h-full w-full object-contain" />}
              {heat && item.gradcam_url && (
                <img src={item.gradcam_url} alt="Grad-CAM" className="absolute inset-0 h-full w-full object-contain" />
              )}
            </div>
          </div>
          <div className="mt-4 space-y-3 px-1 pb-1 text-sm">
            <label className="block">
              <span className="text-[var(--muted)]">Zoom: {zoom.toFixed(1)}x</span>
              <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-sky-400" />
            </label>
            {item.gradcam_url && (
              <button
                onClick={() => setHeat((v) => !v)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2 text-sm transition hover:bg-white/15"
              >
                <Flame size={15} /> {heat ? "Hide model heatmap" : "Show model heatmap (optional)"}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {!done ? (
            <>
              <div className="glass p-5">
                <p className="font-semibold">Your assessment</p>
                {item.already_reviewed && (
                  <p className="mt-1 text-xs text-amber-300">This case already has a label. Submitting replaces it.</p>
                )}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {options.map((o) => (
                    <motion.button
                      key={o.key}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setChoice(o.key)}
                      className={`rounded-2xl border-2 py-5 text-lg font-semibold transition ${
                        choice === o.key ? o.on : "border-white/10 bg-white/5 text-[var(--muted)]"
                      }`}
                    >
                      {o.label}
                    </motion.button>
                  ))}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Notes (optional, no patient identity)"
                  className="field mt-4 !px-4"
                />
                <p className="mt-1 text-right text-xs text-[var(--muted)]">{notes.length}/500</p>
              </div>

              <motion.button
                whileHover={{ scale: choice ? 1.02 : 1 }}
                whileTap={{ scale: choice ? 0.98 : 1 }}
                onClick={submit}
                disabled={!choice || saving}
                className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : "Submit review"}
              </motion.button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-6 text-center"
              style={{
                backgroundImage: `linear-gradient(135deg, ${
                  done.agreed ? "rgba(52,211,153,0.18)" : "rgba(251,191,36,0.18)"
                }, transparent 70%)`,
              }}
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className="mx-auto mb-3 w-fit">
                {done.agreed ? <CheckCircle2 size={48} className="text-emerald-300" /> : <XCircle size={48} className="text-amber-300" />}
              </motion.div>
              <p className="text-xl font-semibold">{done.agreed ? "You agree with the model" : "You differ from the model"}</p>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div>
                  <p className="mb-1 text-[var(--muted)]">Your label</p>
                  <LabelBadge label={done.confirmed_label} />
                </div>
                <div>
                  <p className="mb-1 text-[var(--muted)]">Model</p>
                  <LabelBadge label={done.predicted_label} />
                  <p className="mt-1 text-xs text-[var(--muted)]">{(done.probability * 100).toFixed(1)}% pneumonia</p>
                </div>
              </div>
              <Link to="/review" className="btn-primary mt-6 inline-block rounded-xl px-7 py-3">
                Next case
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

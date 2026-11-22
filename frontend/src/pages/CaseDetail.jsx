import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Loader2, Trash2 } from "lucide-react";
import { api } from "../lib/api.js";
import { useToast } from "../lib/toast.jsx";
import { LabelBadge, Ring, Skeleton, fmtDate } from "../components/ui.jsx";

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [mix, setMix] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    api(`/api/history/${id}`)
      .then((d) => alive && setItem(d))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  async function remove() {
    setDeleting(true);
    try {
      await api(`/api/history/${id}`, { method: "DELETE" });
      toast("Analysis deleted", "success");
      navigate("/history", { replace: true });
    } catch (e) {
      toast(e.message, "error");
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (error) {
    return (
      <div>
        <Link to="/history" className="mb-4 flex items-center gap-2 text-sm text-sky-300">
          <ArrowLeft size={16} /> Back to history
        </Link>
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

  const isPneumonia = item.predicted_label === "PNEUMONIA";

  return (
    <div>
      <Link to="/history" className="mb-4 inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200">
        <ArrowLeft size={16} /> Back to history
      </Link>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="glass p-3">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-black">
            <div className="absolute inset-0 transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
              {item.image_url && <img src={item.image_url} alt="X-ray" className="absolute inset-0 h-full w-full object-contain" />}
              {item.gradcam_url && (
                <img
                  src={item.gradcam_url}
                  alt="Grad-CAM"
                  className="absolute inset-0 h-full w-full object-contain"
                  style={{ opacity: mix / 100 }}
                />
              )}
            </div>
          </div>

          <div className="mt-4 space-y-3 px-1 pb-1 text-sm">
            {item.gradcam_url && (
              <label className="block">
                <span className="text-[var(--muted)]">Heatmap overlay: {mix}%</span>
                <input type="range" min="0" max="100" value={mix} onChange={(e) => setMix(Number(e.target.value))} className="w-full accent-sky-400" />
              </label>
            )}
            <label className="block">
              <span className="text-[var(--muted)]">Zoom: {zoom.toFixed(1)}x</span>
              <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-sky-400" />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-5"
            style={{
              backgroundImage: `linear-gradient(135deg, ${
                isPneumonia ? "rgba(251,113,133,0.18)" : "rgba(52,211,153,0.18)"
              }, transparent 70%)`,
            }}
          >
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Model output</p>
            <p className={`mt-1 text-2xl font-semibold ${isPneumonia ? "text-rose-300" : "text-emerald-300"}`}>
              {isPneumonia ? "Pneumonia suspected" : "No pneumonia suspected"}
            </p>
            <div className="mt-4 flex items-center gap-5">
              <Ring value={item.probability} color={isPneumonia ? "var(--danger)" : "var(--ok)"} label="pneumonia" />
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-[var(--muted)]">Analyzed</dt>
                  <dd className="font-medium">{fmtDate(item.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--muted)]">Threshold</dt>
                  <dd className="font-medium">{item.threshold}</dd>
                </div>
                <div>
                  <dt className="text-[var(--muted)]">Model</dt>
                  <dd className="font-medium">{item.model_version}</dd>
                </div>
              </dl>
            </div>
          </motion.div>

          <div className="glass space-y-3 p-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Clinician review</span>
              {item.confirmed_label ? <LabelBadge label={item.confirmed_label} /> : <span className="text-amber-300">Awaiting review</span>}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Used for model improvement</span>
              <span className={item.consent ? "text-emerald-300" : "text-[var(--muted)]"}>{item.consent ? "Allowed" : "Not allowed"}</span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              A second opinion to support, not replace, clinical judgment. The heatmap shows what
              influenced the model and does not localize disease.
            </p>
          </div>

          <Link
            to={`/history/${id}/report`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm transition hover:bg-white/15"
            >
              <FileText size={16} /> Open printable report
            </Link>

          <button
            onClick={() => setConfirming(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 py-2.5 text-sm text-rose-200 transition hover:bg-rose-400/20"
          >
            <Trash2 size={16} /> Delete this analysis
          </button>
        </div>
      </div>

      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={() => !deleting && setConfirming(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-sm p-6 text-center"
            >
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-rose-400/15">
                <Trash2 className="text-rose-300" />
              </div>
              <p className="text-lg font-semibold">Delete this analysis?</p>
              <p className="mt-1 text-sm text-[var(--muted)]">The image and heatmap are removed permanently.</p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setConfirming(false)} disabled={deleting} className="flex-1 rounded-xl bg-white/10 py-2.5 text-sm">
                  Cancel
                </button>
                <button onClick={remove} disabled={deleting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold">
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

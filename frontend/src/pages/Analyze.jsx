import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AlertTriangle, Flame, ImageUp, Loader2, RotateCcw } from "lucide-react";
import { api } from "../lib/api.js";
import { useToast } from "../lib/toast.jsx";
import { useSettings } from "../lib/settings.jsx";
import { PageHeader, Ring } from "../components/ui.jsx";

export default function Analyze() {
  const toast = useToast();
  const { settings } = useSettings();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [save, setSave] = useState(settings.saveByDefault);
  const [consent, setConsent] = useState(false);
  const [showHeat, setShowHeat] = useState(true);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFile(f) {
    setResult(null);
    setError("");
    setConsent(false);
    if (!f) return;
    if (!["image/jpeg", "image/png"].includes(f.type)) {
      setError("Please choose a JPEG or PNG image.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Image is larger than 10 MB.");
      return;
    }
    setFile(f);
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError("");
    setConsent(false);
  }

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const form = new FormData();
    form.append("file", file);
    form.append("save", save ? "true" : "false");
    form.append("consent", save && consent ? "true" : "false");
    try {
      const data = await api("/api/predict", { method: "POST", body: form });
      setResult(data);
      setShowHeat(true);
      toast(data.stored ? "Analysis complete and saved" : "Analysis complete", "success");
    } catch (e) {
      setError(e.message);
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const isPneumonia = result?.label === "PNEUMONIA";
  const imageSrc = result && showHeat ? `data:image/png;base64,${result.gradcam_base64}` : preview;

  return (
    <div>
      <PageHeader
        title="Analyze"
        accent="chest X-ray"
        subtitle="Upload a pediatric chest X-ray for a second-reader opinion with a Grad-CAM explanation."
      />

      <div className="flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p>
          <strong>Research prototype.</strong> Not a certified medical device. Not for unreviewed
          clinical use. A qualified clinician must review every image.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100"
        >
          {error}
        </motion.div>
      )}

      {!preview ? (
        <motion.label
          whileHover={{ scale: 1.01 }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files[0]);
          }}
          className={`glass mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 border-dashed p-14 text-center transition ${
            dragging ? "border-sky-400 bg-sky-400/10" : ""
          }`}
        >
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ImageUp size={40} className="text-sky-300" />
          </motion.div>
          <p className="text-lg font-medium">Drop a chest X-ray here, or click to choose</p>
          <p className="text-sm text-[var(--muted)]">JPEG or PNG, up to 10 MB</p>
          <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        </motion.label>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="glass p-3">
            <div className="relative overflow-hidden rounded-xl bg-black">
              <img src={imageSrc} alt="Chest X-ray" className="w-full" />
              {loading && (
                <>
                  <div className="absolute inset-0 bg-sky-400/10" />
                  <div className="scan-line" />
                </>
              )}
            </div>
            {result && (
              <button
                onClick={() => setShowHeat((v) => !v)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2 text-sm font-medium transition hover:bg-white/15"
              >
                <Flame size={16} />
                {showHeat ? "Show original image" : "Show Grad-CAM heatmap"}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {!result && (
              <>
                <label className="glass flex items-start gap-3 p-4 text-sm text-slate-300">
                  <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="mt-1 h-4 w-4 accent-sky-400" />
                  <span>
                    <strong className="text-white">Save to my history.</strong> The image and its
                    heatmap are kept privately in your account, without any patient identity. You
                    can delete them at any time.
                  </span>
                </label>

                <label className={`glass flex items-start gap-3 p-4 text-sm text-slate-300 transition ${save ? "" : "opacity-40"}`}>
                  <input
                    type="checkbox"
                    checked={consent}
                    disabled={!save}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-sky-400"
                  />
                  <span>
                    <strong className="text-white">Also allow model improvement.</strong> I am
                    authorized to share this image. It may be used, after clinician review, to
                    retrain the model. Off by default.
                  </span>
                </label>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={analyze}
                  disabled={loading}
                  className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Analyzing...
                    </>
                  ) : (
                    "Analyze image"
                  )}
                </motion.button>
              </>
            )}

            {result && (
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
                  <Ring value={result.probability} color={isPneumonia ? "var(--danger)" : "var(--ok)"} label="pneumonia" />
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-[var(--muted)]">Confidence</dt>
                      <dd className="font-medium">{(result.confidence * 100).toFixed(1)}%</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">Decision threshold</dt>
                      <dd className="font-medium">{result.threshold}</dd>
                    </div>
                  </dl>
                </div>

                <p className="mt-4 text-xs text-[var(--muted)]">
                  {result.stored
                    ? result.duplicate
                      ? "This image was already in your history."
                      : "Saved to your history."
                    : "Not saved."}
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  This output is a second opinion to support, not replace, clinical judgment. The
                  heatmap shows what influenced the model and does not localize disease.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {result.stored && (
                    <Link to={`/history/${result.record_id}`} className="text-sm text-sky-300 hover:text-sky-200">
                      Open in history
                    </Link>
                  )}
                  <button onClick={reset} className="flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200">
                    <RotateCcw size={14} /> Analyze another image
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

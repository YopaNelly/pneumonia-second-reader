import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [consent, setConsent] = useState(false);

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

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const form = new FormData();
    form.append("file", file);
    form.append("consent", consent ? "true" : "false");
    try {
      const res = await fetch(`${API_URL}/api/predict`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Prediction failed");
      setResult(data);
    } catch (e) {
      setError(
        e.message === "Failed to fetch"
          ? "Cannot reach the API. Is the backend running?"
          : e.message
      );
    } finally {
      setLoading(false);
    }
  }

  const isPneumonia = result?.label === "PNEUMONIA";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-xl font-semibold">Pneumonia Second Reader</h1>
          <p className="text-sm text-slate-500">
            Pediatric chest X-ray analysis with Grad-CAM explanations
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <div
          role="note"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <strong>Research prototype.</strong> Not a certified medical device. Not for
          unreviewed clinical use. A qualified clinician must review every image.
        </div>

        <section
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
          className={`rounded-xl border-2 border-dashed bg-white p-8 text-center transition ${
            dragging ? "border-blue-500 bg-blue-50" : "border-slate-300"
          }`}
        >
          <p className="mb-3 text-slate-600">Drag a chest X-ray here, or choose a file</p>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => handleFile(e.target.files[0])}
            className="mx-auto block text-sm"
          />
          <p className="mt-2 text-xs text-slate-400">JPEG or PNG, up to 10 MB</p>
        </section>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {preview && (
          <section className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <figure className="rounded-xl bg-white p-3 shadow-sm">
                <img src={preview} alt="Uploaded X-ray" className="w-full rounded-lg" />
                <figcaption className="mt-2 text-center text-sm text-slate-500">
                  Uploaded image
                </figcaption>
              </figure>

              {result && (
                <figure className="rounded-xl bg-white p-3 shadow-sm">
                  <img
                    src={`data:image/png;base64,${result.gradcam_base64}`}
                    alt="Grad-CAM heatmap overlay"
                    className="w-full rounded-lg"
                  />
                  <figcaption className="mt-2 text-center text-sm text-slate-500">
                    Grad-CAM: regions that influenced the model
                  </figcaption>
                </figure>
              )}
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              <span>
                I am authorized to share this image and allow it to be stored, without any
                patient identity, to improve the model. If unchecked, the image is analyzed
                and not saved.
              </span>
            </label>

            <button
              onClick={analyze}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Analyze image"}
            </button>
          </section>
        )}

        {result && (
          <section
            className={`rounded-xl border p-5 ${
              isPneumonia ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"
            }`}
          >
            <p className="text-sm uppercase tracking-wide text-slate-500">Model output</p>
            <p
              className={`text-2xl font-semibold ${
                isPneumonia ? "text-red-700" : "text-green-700"
              }`}
            >
              {isPneumonia ? "Pneumonia suspected" : "No pneumonia suspected"}
            </p>
            <dl className="mt-3 grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Pneumonia probability</dt>
                <dd className="font-medium">{(result.probability * 100).toFixed(1)}%</dd>
              </div>
              <div>
                <dt className="text-slate-500">Confidence</dt>
                <dd className="font-medium">{(result.confidence * 100).toFixed(1)}%</dd>
              </div>
              <div>
                <dt className="text-slate-500">Decision threshold</dt>
                <dd className="font-medium">{result.threshold}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-500">
              {result.stored
                ? "Image stored for model improvement (pending clinician review)."
                : "Image not stored."}
            </p>
            <p className="mt-4 text-xs text-slate-500">
              This output is a second opinion to support, not replace, clinical judgment.
              The heatmap shows what influenced the model and does not localize disease.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

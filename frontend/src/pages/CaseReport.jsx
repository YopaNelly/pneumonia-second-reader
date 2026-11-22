import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { api } from "../lib/api.js";
import { Skeleton, fmtDate } from "../components/ui.jsx";

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-200 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function CaseReport() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api(`/api/history/${id}`)
      .then((d) => alive && setItem(d))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  if (error) {
    return (
      <div>
        <Link to="/history" className="mb-4 inline-flex items-center gap-2 text-sm text-sky-300">
          <ArrowLeft size={16} /> Back to history
        </Link>
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div>
      </div>
    );
  }

  if (!item) return <Skeleton className="mx-auto h-96 max-w-3xl" />;

  const isPneumonia = item.predicted_label === "PNEUMONIA";

  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link to={`/history/${id}`} className="inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200">
          <ArrowLeft size={16} /> Back to analysis
        </Link>
        <button
          onClick={() => window.print()}
          className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
        >
          <Printer size={16} /> Print or save as PDF
        </button>
      </div>

      <article className="report-paper mx-auto max-w-3xl rounded-2xl bg-white p-8 text-slate-900 shadow-2xl">
        <header className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div>
            <h1 className="text-2xl font-bold">Pneumonia Second Reader</h1>
            <p className="text-sm text-slate-500">Analysis report · pediatric chest X-ray</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">Report {item.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-slate-500">Generated {fmtDate(new Date().toISOString())}</p>
          </div>
        </header>

        <section
          className="mt-5 rounded-xl border-2 p-4"
          style={{ borderColor: isPneumonia ? "#e11d48" : "#059669" }}
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">Model output</p>
          <p className="text-2xl font-bold" style={{ color: isPneumonia ? "#be123c" : "#047857" }}>
            {isPneumonia ? "Pneumonia suspected" : "No pneumonia suspected"}
          </p>
          <p className="text-sm text-slate-600">
            Pneumonia probability {(item.probability * 100).toFixed(1)}% · decision threshold {item.threshold}
          </p>
        </section>

        <section className="mt-5">
          <Row label="Analyzed" value={fmtDate(item.created_at)} />
          <Row label="Model version" value={item.model_version} />
          <Row
            label="Clinician review"
            value={item.confirmed_label ? `Confirmed: ${item.confirmed_label === "PNEUMONIA" ? "Pneumonia" : "Normal"}` : "Not yet reviewed"}
          />
          <Row label="Patient identity" value="Not recorded" />
        </section>

        <section className="mt-5 grid grid-cols-2 gap-4">
          <figure>
            {item.image_url && <img src={item.image_url} alt="X-ray" className="w-full rounded-lg bg-black" />}
            <figcaption className="mt-1 text-center text-xs text-slate-500">Chest X-ray</figcaption>
          </figure>
          <figure>
            {item.gradcam_url ? (
              <img src={item.gradcam_url} alt="Grad-CAM" className="w-full rounded-lg bg-black" />
            ) : (
              <div className="grid aspect-square place-items-center rounded-lg bg-slate-100 text-xs text-slate-400">
                No heatmap stored
              </div>
            )}
            <figcaption className="mt-1 text-center text-xs text-slate-500">Grad-CAM heatmap</figcaption>
          </figure>
        </section>

        <footer className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
          This is a research prototype and not a certified medical device. The output is a second
          opinion to support, not replace, clinical judgment, and must be reviewed by a qualified
          clinician. The heatmap shows what influenced the model and does not localize disease.
        </footer>
      </article>
    </div>
  );
}

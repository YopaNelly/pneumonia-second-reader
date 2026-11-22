const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

async function predict(buffer, filename, mimetype) {
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mimetype }), filename);

  const res = await fetch(`${ML_URL}/predict`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = new Error(`ML service returned ${res.status}`);
    err.status = 502;
    throw err;
  }
  return res.json();
}

async function health() {
  const res = await fetch(`${ML_URL}/health`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`ML service returned ${res.status}`);
  return res.json();
}

module.exports = { predict, health };

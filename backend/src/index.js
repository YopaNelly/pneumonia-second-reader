require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { health } = require("./mlClient");
const predictRoute = require("./routes/predict");

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    const ml = await health();
    res.json({ api: "ok", ml });
  } catch {
    res.status(503).json({ api: "ok", ml: "unreachable" });
  }
});

app.use("/api/predict", predictRoute);

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "Image is larger than 10 MB" });
  if (err.cause && err.cause.code === "ECONNREFUSED") return res.status(503).json({ error: "ML service is unreachable" });
  const status = err.status || 500;
  if (status >= 500) console.error(err.message);
  res.status(status).json({ error: status >= 500 ? "Prediction failed" : err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

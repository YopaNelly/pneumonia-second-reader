require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { health } = require("./mlClient");
const { requireAuth } = require("./auth");
const predictRoute = require("./routes/predict");
const historyRoute = require("./routes/history");
const reviewRoute = require("./routes/review");
const reportsRoute = require("./routes/reports");
const accountRoute = require("./routes/account");
const adminRoute = require("./routes/admin");

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

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, role: req.role });
});

app.use("/api/predict", predictRoute);
app.use("/api/history", requireAuth, historyRoute);
app.use("/api/review", reviewRoute);
app.use("/api/reports", reportsRoute);
app.use("/api/account", requireAuth, accountRoute);
app.use("/api/admin", adminRoute);

// Serve the built React app (run `npm run build` in frontend/ first)
const dist = path.join(__dirname, "..", "..", "frontend", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(dist, "index.html"));
    }
    next();
  });
}

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "Image is larger than 10 MB" });
  if (err.cause && err.cause.code === "ECONNREFUSED") return res.status(503).json({ error: "ML service is unreachable" });
  const status = err.status || 500;
  if (status >= 500) console.error(err.message);
  res.status(status).json({ error: status >= 500 ? "Request failed" : err.message });
});

const port = process.env.PORT || 4001;
app.listen(port, "0.0.0.0", () => console.log(`API listening on port ${port}`));

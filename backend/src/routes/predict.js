const express = require("express");
const multer = require("multer");
const { predict } = require("../mlClient");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png"].includes(file.mimetype)) return cb(null, true);
    const err = new Error("Only JPEG or PNG images are allowed");
    err.status = 400;
    cb(err);
  },
});

router.post("/", upload.single("file"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded. Send it in the 'file' field." });
  }
  try {
    const result = await predict(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

/* ---------------- ENSURE UPLOAD DIR EXISTS ---------------- */
const UPLOAD_DIR = "uploads";

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* ---------------- DISK STORAGE ---------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    const safeName = baseName.toLowerCase().replace(/[^a-z0-9]/g, "-");

    cb(null, `${safeName}-${Date.now()}${ext}`);
  },
});

///* ---------------- MEMORY STORAGE ---------------- */
// const storage = multer.memoryStorage();

/* ---------------- MULTER CONFIG ---------------- */
export const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB (safe for videos)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }

    cb(null, true);
  },
});

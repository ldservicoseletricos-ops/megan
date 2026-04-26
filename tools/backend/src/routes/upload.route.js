import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const router = Router();

// ✅ PADRONIZAÇÃO
const uploadsDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const MAX_FILES = 10;
const MAX_FILE_SIZE = 15 * 1024 * 1024;

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "-");
    const unique = `${Date.now()}-${crypto.randomUUID()}`;
    cb(null, `${unique}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

function buildFileUrl(req, filename) {
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
}

router.post("/", (req, res, next) => {
  upload.array("files", MAX_FILES)(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        ok: false,
        error: error.message,
      });
    }

    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({
        ok: false,
        error: "Nenhum arquivo enviado.",
      });
    }

    const items = files.map((file) => ({
      id: crypto.randomUUID(),
      filename: file.filename,
      url: buildFileUrl(req, file.filename),
      size: file.size,
      type: file.mimetype,
    }));

    return res.json({
      ok: true,
      items,
    });
  });
});

export default router;
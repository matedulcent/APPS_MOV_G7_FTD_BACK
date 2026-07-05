import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("El archivo debe ser una imagen"));
    }
    cb(null, true);
  },
});

// POST /api/upload — sube una imagen (form-data, campo "imagen") y devuelve
// la ruta relativa donde queda servida (/uploads/<archivo>). Se guarda
// relativa (no la URL absoluta con IP) para que siga funcionando aunque
// cambie la IP local de la PC entre sesiones: el front antepone su
// BASE_URL actual al mostrarla.
router.post("/upload", (req, res) => {
  upload.single("imagen")(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || "No se pudo subir la imagen" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Falta el archivo de imagen" });
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

export default router;
export { uploadsDir };

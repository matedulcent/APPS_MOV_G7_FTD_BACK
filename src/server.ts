/**
 * server.ts
 * ----------
 * - CORS para Expo Web / emulador
 * - JSON parser
 * - Health
 * - Routers con compatibilidad hacia atrás
 *
 * Compatibilidad:
 *   - usuarios, sucursales, envases, sabores:
 *       * Rutas nuevas con prefijo claro:   /api/usuarios, /api/sucursales, /api/envases, /api/sabores
 *       * Rutas legacy (lo viejo):          /api/*   (p.ej. /api/login, /api/registro, etc.)
 *   - ordenes:
 *       * SOLO en /api/ordenes   (para el PATCH /api/ordenes/:id/terminar del botón)
 */
import express from "express";
import cors from "cors";


import usuariosRouter   from "./routes/usuarios";
import sucursalesRouter, { getSucursalById } from "./routes/sucursales";
import ordenesRouter    from "./routes/ordenes";
import envasesRouter, { deleteEnvaseHandler } from "./routes/envases";
import saboresRouter, { deleteSaborHandler } from "./routes/sabores";
import uploadRouter, { uploadsDir } from "./routes/upload";

const app = express();

app.use(cors({ origin: true }));
app.options(/.*/, cors({ origin: true }));
app.use(express.json());

// Imágenes subidas (p.ej. foto de la sucursal) servidas como archivos estáticos
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, tag: "compat-apis", ts: new Date().toISOString() });
});

/** ---- Nuevos prefijos claros ---- */
app.use("/api/usuarios",   usuariosRouter);
app.use("/api/sucursales", sucursalesRouter);
app.get("/api/sucursales/:id", getSucursalById); // ruta explícita: ver comentario en routes/sucursales.ts
app.use("/api/envases",    envasesRouter);
app.delete("/api/envases/:id", deleteEnvaseHandler); // ruta explícita: ver comentario en routes/envases.ts
app.use("/api/sabores",    saboresRouter);
app.delete("/api/sabores/:id", deleteSaborHandler); // ruta explícita: ver comentario en routes/sabores.ts
app.use("/api",            uploadRouter);

/** ---- Compatibilidad legacy (/api) para lo viejo ----
 * OJO: NO montamos ordenes acá para no romper /api/ordenes.
 * Esto conserva endpoints como /api/login, /api/registro, etc.
 */
app.use("/api", usuariosRouter);
app.use("/api", sucursalesRouter);
app.use("/api", envasesRouter);
app.use("/api", saboresRouter);

/** ---- Órdenes (solo aquí) ----
 * Mantener EXCLUSIVO en /api/ordenes para que funcione:
 *   - GET /api/ordenes
 *   - GET /api/ordenes/:id
 *   - PATCH /api/ordenes/:id/terminar
 */
app.use("/api/ordenes", ordenesRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

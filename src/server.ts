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
import sucursalesRouter from "./routes/sucursales";
import ordenesRouter    from "./routes/ordenes";
import envasesRouter    from "./routes/envases";
import saboresRouter    from "./routes/sabores";

const app = express();

app.use(cors({ origin: true }));
app.options(/.*/, cors({ origin: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, tag: "compat-apis", ts: new Date().toISOString() });
});

/** ---- Nuevos prefijos claros ---- */
app.use("/api/usuarios",   usuariosRouter);
app.use("/api/sucursales", sucursalesRouter);
app.use("/api/envases",    envasesRouter);
app.use("/api/sabores",    saboresRouter);

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

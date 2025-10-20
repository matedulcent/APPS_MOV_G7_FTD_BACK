/**
 * server.ts
 * ----------
 * - CORS correcto para Expo Web (8081) y emulador.
 * - Preflight con regex (Express 5 no acepta "*").
 * - JSON parser.
 * - Health.
 * - Routers bajo /api.
 */
import express from "express";
import cors from "cors";

import usuariosRouter from "./routes/usuarios";
import sucursalesRouter from "./routes/sucursales";
import ordenesRouter from "./routes/ordenes";
import envasesRouter from "./routes/envases";
import saboresRouter from "./routes/sabores";

const app = express();

/** CORS (desarrollo)
 * Si querés restringir, cambiá origin: ["http://localhost:8081"]
 */
app.use(cors({ origin: true }));

// ⚠️ Express 5: NO usar "*" en .options; usar regex para preflight global.
app.options(/.*/, cors({ origin: true }));

/** JSON */
app.use(express.json());

/** Health */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, tag: "nuevo-sin-cantidad", ts: new Date().toISOString() });
});

/** Routers montados bajo /api */
app.use("/api", usuariosRouter);
app.use("/api", sucursalesRouter);
app.use("/api", ordenesRouter);
app.use("/api", envasesRouter);
app.use("/api", saboresRouter);

/** Inicio */
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

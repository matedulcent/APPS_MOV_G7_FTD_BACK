/**
 * server.ts
 * ----------
 * - CORS abierto para desarrollo
 * - Routers con compatibilidad (usuarios/sucursales/envases/sabores)
 * - Órdenes montado en rutas limpias y también en /api2 para debug
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

/** Prefijos claros */
app.use("/api/usuarios",   usuariosRouter);
app.use("/api/sucursales", sucursalesRouter);
app.use("/api/envases",    envasesRouter);
app.use("/api/sabores",    saboresRouter);

/**
 * Compatibilidad legacy: montamos los mismos routers *solo* para sus endpoints
 * viejos (/api/login, /api/registro, etc.). NO incluimos ordenes acá para que
 * no haya colisión con /api/ordenes.
 */
app.use("/api", usuariosRouter);
app.use("/api", sucursalesRouter);
app.use("/api", envasesRouter);
app.use("/api", saboresRouter);

/** Órdenes: rutas limpias y alias para test */
app.use("/api/ordenes", ordenesRouter);  // principal
app.use("/api2/ordenes", ordenesRouter); // alias (por si algo legacy choca)

/** Arranque */
const PORT = 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Back en http://localhost:${PORT}`);
});

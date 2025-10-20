/**
 * server.ts
 * ---------
 * Punto de entrada del servidor Express:
 *  - CORS para desarrollo (Expo Web).
 *  - Parseo JSON.
 *  - Health con 'tag' para reconocer este servidor.
 *  - Montaje de routers bajo /api.
 */
import express from "express";
import cors from "cors";
import usuariosRouter from "./routes/usuarios";
import sucursalesRouter from "./routes/sucursales";
import ordenesRouter from "./routes/ordenes";

const app = express();

/** CORS (desarrollo) */
app.use(cors());

// Express 5: responder preflight sin usar rutas comodín con '*'
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

/** JSON */
app.use(express.json());

/** Health con tag para reconocer este server */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, tag: "nuevo-sin-cantidad", ts: new Date().toISOString() });
});

/** Rutas */
app.use("/api", usuariosRouter);
app.use("/api", sucursalesRouter);
app.use("/api", ordenesRouter);

/** Inicio */
const PORT = 3001;
//const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

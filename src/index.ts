import express from "express";
import usuariosRouter from "./routes/usuarios";
import sucursalesRouter from "./routes/sucursales";
import ordenesRouter from "./routes/ordenes";

const app = express();
app.use(express.json());

app.use("/api/usuarios", usuariosRouter);
app.use("/api/sucursales", sucursalesRouter);
app.use("/api/ordenes", ordenesRouter);

app.get("/", (req, res) => res.send({ ok: true, msg: "API Express + Prisma + SQLite" }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

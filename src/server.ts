// src/server.ts
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const app = express();
const prisma = new PrismaClient();
app.use(
  cors({
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      console.warn("❌ CORS bloqueado:", origin);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* --------------------------------------------
   ✅ Habilitar CORS para Expo Web y celular
--------------------------------------------- */
const allowedOrigins = [
  "http://localhost:8081", // Expo Web
  "http://localhost:3000", // opcional frontend local
  "http://127.0.0.1:8081",
  // agregá tu IP local si usás Expo Go en celular, ej:
  // "http://192.168.0.15:3000",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      console.warn("❌ CORS bloqueado:", origin);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Responder preflight de forma genérica (200/204)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // No Content
  }
  next();
});


/* --------------------------------------------
   ✅ Middleware JSON
--------------------------------------------- */
app.use(express.json());

/* --------------------------------------------
   ✅ Endpoint para crear una orden (pedido)
--------------------------------------------- */
app.post("/api/ordenes", async (req, res) => {
  try {
    const { usuarioId, sucursalId, items } = req.body as {
      usuarioId?: string;
      sucursalId?: string;
      items?: Array<{ envaseId: string; saborId: string }>;
    };

    console.log("➡️ POST /api/ordenes body:", req.body);

    // Validaciones básicas
    if (!usuarioId || !sucursalId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Payload inválido" });
    }

    // Generar ID único de orden
    const ordenId = "P_" + crypto.randomUUID().slice(0, 8);

    // Crear la orden
    const orden = await prisma.orden.create({
      data: {
        id: ordenId,
        fecha: new Date(),
        estadoTerminado: false,
        usuarioId,
        sucursalId,
      },
    });

    // Crear los contenidos
    await prisma.contenidoPedido.createMany({
      data: items.map((i) => ({
        ordenId: orden.id,
        envaseId: i.envaseId,
        saborId: i.saborId,
      })),
    });

    console.log("✅ Orden creada:", orden.id, "items:", items.length);
    res.status(201).json({ ok: true, ordenId: orden.id });
  } catch (error: any) {
    console.error("❌ Error creando orden:", error);
    res.status(500).json({
      error: "Error al crear la orden",
      detail: error?.meta ?? error?.message ?? String(error),
    });
  }
});

/* --------------------------------------------
   ✅ Endpoint: traer todos los usuarios
--------------------------------------------- */
app.get("/api/usuarios", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

/* --------------------------------------------
   ✅ Endpoint: traer todas las órdenes con sus contenidos
--------------------------------------------- */
app.get("/api/ordenes", async (req, res) => {
  try {
    const ordenes = await prisma.orden.findMany({
      include: {
        usuario: true,
        sucursal: true,
        contenidos: {
          include: {
            envase: true,
            sabor: true,
          },
        },
      },
    });
    res.json(ordenes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener órdenes" });
  }
});

/* --------------------------------------------
   ✅ Health check (para probar conexión)
--------------------------------------------- */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, cwd: process.cwd(), db: process.env.DATABASE_URL });
});

/* --------------------------------------------
   ✅ Iniciar servidor
--------------------------------------------- */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

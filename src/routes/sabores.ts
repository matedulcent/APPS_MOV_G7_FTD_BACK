import { Router } from "express";
import prisma from "../prismaClient";
import crypto from "crypto";

const router = Router();

/* ─────────── Handlers compartidos ─────────── */

async function handleGetSabores(_req: any, res: any) {
  try {
    const sabores = await prisma.sabor.findMany({
      orderBy: { tipoSabor: "asc" },
    });
    return res.json(sabores);
  } catch (e) {
    console.error("[GET sabores] Error:", e);
    return res.status(500).json({ error: "Error de servidor" });
  }
}

async function handlePostSabores(req: any, res: any) {
  try {
    const nombreRaw = req.body?.tipoSabor;
    if (typeof nombreRaw !== "string" || !nombreRaw.trim()) {
      return res.status(400).json({ error: "tipoSabor requerido" });
    }
    const tipoSabor = nombreRaw.trim();

    // Buscar coincidencia exacta ignorando mayúsculas/minúsculas
    const candidato = await prisma.sabor.findFirst({
      where: { tipoSabor: { equals: tipoSabor } },
    });
    if (
      candidato &&
      typeof candidato.tipoSabor === "string" &&
      candidato.tipoSabor.toLowerCase() === tipoSabor.toLowerCase()
    ) {
      // idempotente: ya existe
      return res.status(200).json(candidato);
    }

    // Generar ID (tu model Sabor necesita id String @id sin default)
    const id = "S_" + crypto.randomUUID().replace(/-/g, "").slice(0, 8);

    const creado = await prisma.sabor.create({
      data: {
        id,
        tipoSabor,
      },
    });

    return res.status(201).json(creado);
  } catch (e: any) {
    // Prisma unique constraint
    if (e?.code === "P2002") {
      try {
        const existente = await prisma.sabor.findFirst({
          where: { tipoSabor: { equals: req.body?.tipoSabor } },
        });
        if (existente) return res.status(200).json(existente);
      } catch {}
      return res.status(409).json({ error: "El sabor ya existe" });
    }
    console.error("[POST sabores] Error:", e);
    return res.status(500).json({ error: "Error de servidor" });
  }
}

/* ─────────── Rutas NUEVAS (montadas bajo /api/sabores) ─────────── */
// GET /api/sabores  |  POST /api/sabores
router.get("/", handleGetSabores);
router.post("/", handlePostSabores);

/* ─────────── Rutas LEGACY (montadas bajo /api) ─────────── */
// GET /api/sabores  |  POST /api/sabores  (compat)
router.get("/sabores", handleGetSabores);
router.post("/sabores", handlePostSabores);

export default router;

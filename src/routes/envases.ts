import { Router } from "express";
import prisma from "../prismaClient";
import { generarIdEnvase } from "./utils";

const router = Router();

/* ─────────── Handlers compartidos ─────────── */

async function handleGetEnvases(_req: any, res: any) {
  try {
    const envases = await prisma.envase.findMany({
      orderBy: { tipoEnvase: "asc" },
    });
    return res.json(envases);
  } catch (e) {
    console.error("[GET envases] Error:", e);
    return res.status(500).json({ error: "Error de servidor" });
  }
}

async function handlePostEnvases(req: any, res: any) {
  try {
    const tipoEnvaseRaw = req.body?.tipoEnvase;
    const maxRaw = req.body?.maxCantSabores;

    if (typeof tipoEnvaseRaw !== "string" || !tipoEnvaseRaw.trim()) {
      return res.status(400).json({ error: "tipoEnvase requerido" });
    }
    const tipoEnvase = tipoEnvaseRaw.trim();

    const maxCant = Number(maxRaw);
    if (!Number.isFinite(maxCant) || maxCant <= 0) {
      return res.status(400).json({ error: "maxCantSabores debe ser un número > 0" });
    }

    // Duplicado (comparación case-insensitive manual)
    const candidato = await prisma.envase.findFirst({
      where: { tipoEnvase: { equals: tipoEnvase } },
    });
    if (
      candidato &&
      typeof candidato.tipoEnvase === "string" &&
      candidato.tipoEnvase.toLowerCase() === tipoEnvase.toLowerCase()
    ) {
      return res.status(200).json(candidato);
    }

    // ID con prefijo 'p' + 5 dígitos (centralizado)
    const id = generarIdEnvase();

    const creado = await prisma.envase.create({
      data: {
        id,
        tipoEnvase,
        maxCantSabores: maxCant,
      },
    });

    return res.status(201).json(creado);
  } catch (e: any) {
    if (e?.code === "P2002") {
      try {
        const existente = await prisma.envase.findFirst({
          where: { tipoEnvase: { equals: req.body?.tipoEnvase } },
        });
        if (existente) return res.status(200).json(existente);
      } catch {}
      return res.status(409).json({ error: "El envase ya existe" });
    }
    console.error("[POST envases] Error:", e);
    return res.status(500).json({ error: "Error de servidor" });
  }
}

/* ─────────── Rutas NUEVAS (montadas bajo /api/envases) ─────────── */
router.get("/", handleGetEnvases);
router.post("/", handlePostEnvases);

/* ─────────── Rutas LEGACY (montadas bajo /api) ─────────── */
router.get("/envases", handleGetEnvases);
router.post("/envases", handlePostEnvases);

export default router;

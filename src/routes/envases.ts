import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

// GET /api/envases
router.get("/envases", async (_req, res) => {
  try {
    const envases = await prisma.envase.findMany({ orderBy: { tipoEnvase: "asc" } });
    res.json(envases);
  } catch (e) {
    console.error("[GET /envases]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// POST /api/envases — crear un envase nuevo en el catálogo global
router.post("/envases", async (req, res) => {
  try {
    const { tipoEnvase, maxCantSabores } = req.body as {
      tipoEnvase?: string;
      maxCantSabores?: number;
    };

    if (!tipoEnvase || typeof tipoEnvase !== "string" || !tipoEnvase.trim()) {
      return res.status(400).json({ error: "tipoEnvase es requerido" });
    }
    const max = Number(maxCantSabores);
    if (!Number.isFinite(max) || max <= 0) {
      return res.status(400).json({ error: "maxCantSabores debe ser un número mayor a 0" });
    }

    const nuevo = await prisma.envase.create({
      data: {
        id: crypto.randomUUID(),
        tipoEnvase: tipoEnvase.trim(),
        maxCantSabores: max,
      },
    });
    res.status(201).json(nuevo);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un envase con ese tipo" });
    }
    console.error("[POST /envases]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// ✅ marcar una orden como terminada
router.patch("/ordenes/:id/terminar", async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.orden.update({
      where: { id },
      data: { estadoTerminado: true },
      select: { id: true, estadoTerminado: true },
    });
    res.json({ ok: true, ...updated });
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Orden no encontrada" });
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;


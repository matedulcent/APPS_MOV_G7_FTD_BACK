import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

// GET /api/sabores
router.get("/sabores", async (_req, res) => {
  try {
    const sabores = await prisma.sabor.findMany({ orderBy: { tipoSabor: "asc" } });
    res.json(sabores);
  } catch (e) {
    console.error("[GET /sabores]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// POST /api/sabores — crear un sabor nuevo en el catálogo global
router.post("/sabores", async (req, res) => {
  try {
    const { tipoSabor } = req.body as { tipoSabor?: string };

    if (!tipoSabor || typeof tipoSabor !== "string" || !tipoSabor.trim()) {
      return res.status(400).json({ error: "tipoSabor es requerido" });
    }

    const nuevo = await prisma.sabor.create({
      data: {
        id: crypto.randomUUID(),
        tipoSabor: tipoSabor.trim(),
      },
    });
    res.status(201).json(nuevo);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un sabor con ese nombre" });
    }
    console.error("[POST /sabores]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

export default router;

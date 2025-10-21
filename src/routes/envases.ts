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


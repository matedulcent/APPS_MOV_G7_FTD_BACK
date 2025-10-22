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

export default router;

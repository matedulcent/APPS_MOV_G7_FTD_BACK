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

export default router;

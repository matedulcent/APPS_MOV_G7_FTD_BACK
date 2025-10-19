import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /envases - devuelve todos los envases con icon incluido
router.get("/", async (req, res) => {
    try {
        const envases = await prisma.envase.findMany({
            select: {
                id: true,
                tipoEnvase: true,
                maxCantSabores: true,
                icon: true
            }
        });
        res.json(envases);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener los envases" });
    }
});

export default router;

import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /envases - devuelve todos los envases
router.get("/", async (req, res) => {
    try {
        const envases = await prisma.envase.findMany({
            select: {
                id: true,
                tipoEnvase: true,
                maxCantSabores: true,
                // Puedes asignar íconos según el tipo aquí
            },
        });

        // Mapear íconos según el tipoEnvase (opcional)
        const envasesConIcono = envases.map(e => ({
            ...e,
            icon:
                e.tipoEnvase.toLowerCase() === "cucuruchos"
                    ? "icecream"
                    : e.tipoEnvase.toLowerCase() === "kilos"
                        ? "whatshot"
                        : e.tipoEnvase.toLowerCase() === "vasos"
                            ? "local-drink"
                            : undefined,
        }));

        res.json(envasesConIcono);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener los envases" });
    }
});

export default router;
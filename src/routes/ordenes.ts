import { Router } from "express";
import prisma from "../prismaClient";
const router = Router();

/**
 * GET /api/ordenes
 * Lista órdenes con sus contenidos
 */
router.get("/", async (req, res) => {
    const ordenes = await prisma.orden.findMany({
        include: { usuario: true, sucursal: true, contenidos: { include: { envase: true, sabor: true } } }
    });
    res.json(ordenes);
});

/**
 * POST /api/ordenes
 * Crea orden + contenidos (payload ejemplo abajo)
 */
router.post("/", async (req, res) => {
    const { id, fecha, estadoTerminado, usuarioId, sucursalId, contenidos } = req.body;
    try {
        const orden = await prisma.orden.create({
            data: {
                id,
                fecha: fecha ? new Date(fecha) : undefined,
                estadoTerminado: !!estadoTerminado,
                usuario: { connect: { id: usuarioId } },
                sucursal: { connect: { id: sucursalId } },
                contenidos: {
                    create: (contenidos || []).map((c: any) => ({
                        envase: { connect: { id: c.envaseId } },
                        sabor: { connect: { id: c.saborId } }
                    }))
                }
            },
            include: { contenidos: { include: { envase: true, sabor: true } } }
        });
        res.status(201).json(orden);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

export default router;

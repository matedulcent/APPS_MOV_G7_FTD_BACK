import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

/** GET /api/sucursales/:id/oferta
 * Devuelve envases + sabores ofrecidos por esa sucursal
 */
router.get("/sucursales/:id/oferta", async (req, res) => {
  try {
    const { id } = req.params;
    const sucursal = await prisma.sucursal.findUnique({
      where: { id },
      include: {
        envasesOfrecidos: true,
        saboresOfrecidos: true,
      },
    });
    if (!sucursal) return res.status(404).json({ error: "Sucursal no encontrada" });

    res.json({
      envases: sucursal.envasesOfrecidos,
      sabores: sucursal.saboresOfrecidos,
    });
  } catch (e) {
    console.error("[GET /sucursales/:id/oferta]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

/** PUT /api/sucursales/:id/oferta
 * Reemplaza la oferta completa de la sucursal
 * body: { envaseIds: string[], saborIds: string[] }
 */
router.put("/sucursales/:id/oferta", async (req, res) => {
  try {
    const { id } = req.params;
    const { envaseIds = [], saborIds = [] } = req.body ?? {};

    const updated = await prisma.sucursal.update({
      where: { id },
      data: {
        envasesOfrecidos: { set: (envaseIds as string[]).map((eid) => ({ id: eid })) },
        saboresOfrecidos: { set: (saborIds as string[]).map((sid) => ({ id: sid })) },
      },
      include: {
        envasesOfrecidos: true,
        saboresOfrecidos: true,
      },
    });

    res.json({
      envases: updated.envasesOfrecidos,
      sabores: updated.saboresOfrecidos,
    });
  } catch (e: any) {
    console.error("[PUT /sucursales/:id/oferta]", e);
    if (e.code === "P2025") return res.status(404).json({ error: "Sucursal no encontrada" });
    res.status(500).json({ error: "Error de servidor" });
  }
});

export default router;

/**
 * routes/sucursales.ts
 * --------------------
 * Listado de sucursales.
 */
import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

router.get("/sucursales", async (_req, res) => {
  try {
    const sucursales = await prisma.sucursal.findMany();
    res.json(sucursales);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Error al obtener sucursales" });
  }
});

export default router;

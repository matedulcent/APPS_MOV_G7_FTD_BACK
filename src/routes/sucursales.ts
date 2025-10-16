import { Router } from "express";
import prisma from "../prismaClient";
const router = Router();

router.get("/", async (req, res) => {
    const sucursales = await prisma.sucursal.findMany({ include: { ordenes: true } });
    res.json(sucursales);
});

router.post("/", async (req, res) => {
    const { id, nombre, mail, contrasena, urlImagen, domicilio } = req.body;
    try {
        const s = await prisma.sucursal.create({
            data: { id, nombre, mail, contrasena, urlImagen, domicilio }
        });
        res.status(201).json(s);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

export default router;

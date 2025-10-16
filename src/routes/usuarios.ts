import { Router } from "express";
import prisma from "../prismaClient";
const router = Router();

// Listar usuarios
router.get("/", async (req, res) => {
    const usuarios = await prisma.usuario.findMany({
        include: { ordenes: true }
    });
    res.json(usuarios);
});

// Crear usuario
router.post("/", async (req, res) => {
    const { id, nombre, mail, contrasena } = req.body;
    try {
        const u = await prisma.usuario.create({
            data: { id, nombre, mail, contrasena }
        });
        res.status(201).json(u);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

export default router;

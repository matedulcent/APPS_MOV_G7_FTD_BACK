// src/index.ts o app.ts
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Endpoint de prueba: traer todos los usuarios
app.get("/usuarios", async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany();
        res.json(usuarios);
    } catch (e) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

// Endpoint de prueba: traer todas las órdenes con detalles
app.get("/ordenes", async (req, res) => {
    const ordenes = await prisma.orden.findMany({
        include: {
            usuario: true,
            sucursal: true,
            contenidos: {
                include: {
                    envase: true,
                    sabor: true,
                },
            },
        },
    });
    res.json(ordenes);
});

const PORT = 3000;
//app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

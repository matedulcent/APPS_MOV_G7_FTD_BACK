// src/server.ts
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Endpoint: traer todos los usuarios
app.get("/usuarios", async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

// Endpoint: traer todas las órdenes con sus contenidos
app.get("/ordenes", async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ error: "Error al obtener órdenes" });
    }
});

// Puerto
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

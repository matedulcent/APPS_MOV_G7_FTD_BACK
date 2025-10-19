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
// Endpoint: traer todos los envases
app.get("/envases", async (req, res) => {
    try {
        const envases = await prisma.envase.findMany();

        // Mapear íconos según el tipo de envase
        const envasesConIcono = envases.map(e => ({
            id: e.id,
            tipoEnvase: e.tipoEnvase,
            maxCantSabores: e.maxCantSabores,
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener envases" });
    }
});

// Puerto
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

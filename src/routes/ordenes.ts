/**
 * routes/ordenes.ts
 * -----------------
 * Rutas de Órdenes:
 *  - POST /api/ordenes     : Crea una orden SIN 'cantidad'. Deduplica sabor por envase y valida maxCantSabores.
 *  - GET  /api/ordenes     : Lista últimas N órdenes (?take=10).
 *  - GET  /api/ordenes/:id : Devuelve una orden con usuario, sucursal y contenidos (envase+sabor).
 */
import { Router } from "express";
import crypto from "crypto";
import prisma from "../prismaClient";

const router = Router();

/** Crear orden (sin cantidad; un gusto no puede repetirse dentro del mismo envase) */
router.post("/ordenes", async (req, res) => {
  // Etiqueta para depurar qué handler respondió
  res.setHeader("X-Handler", "ordenes-sin-cantidad");

  try {
    const { usuarioId, sucursalId, items } = req.body as {
      usuarioId?: string;
      sucursalId?: string;
      items?: Array<{ envaseId: string; saborId: string }>;
    };

    // Validación básica del payload
    if (!usuarioId || !sucursalId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Payload inválido (sin-cantidad)" });
    }
    for (const it of items) {
      if (!it?.envaseId || !it?.saborId) {
        return res.status(400).json({ error: "Cada item requiere envaseId y saborId (sin-cantidad)" });
      }
    }

    // 1) Eliminar duplicados (no permitir el mismo sabor dentro del mismo envase)
    const dedup = new Map<string, { envaseId: string; saborId: string }>(); // key = envaseId|saborId
    for (const it of items) {
      const key = `${it.envaseId}|${it.saborId}`;
      if (!dedup.has(key)) dedup.set(key, it);
    }
    const dedupItems = Array.from(dedup.values());

    // 2) Validar tope de sabores por envase (según Envase.maxCantSabores)
    const porEnvase = new Map<string, number>();
    dedupItems.forEach((it) => porEnvase.set(it.envaseId, (porEnvase.get(it.envaseId) ?? 0) + 1));

    const envaseIds = Array.from(porEnvase.keys());
    const envases = await prisma.envase.findMany({
      where: { id: { in: envaseIds } },
      select: { id: true, maxCantSabores: true },
    });
    const maxMap = new Map(envases.map((e) => [e.id, e.maxCantSabores]));
    for (const [envaseId, cant] of porEnvase.entries()) {
      const max = maxMap.get(envaseId);
      if (typeof max === "number" && cant > max) {
        return res.status(400).json({
          error: `El envase ${envaseId} admite ${max} sabores y se enviaron ${cant}`,
        });
      }
    }

    // 3) Crear la orden
    const ordenId = "P_" + crypto.randomUUID().slice(0, 8);
    const orden = await prisma.orden.create({
      data: { id: ordenId, fecha: new Date(), estadoTerminado: false, usuarioId, sucursalId },
    });

    // 4) Insertar contenidos (sin cantidad)
    await prisma.contenidoPedido.createMany({
      data: dedupItems.map((i) => ({
        ordenId: orden.id,
        envaseId: i.envaseId,
        saborId: i.saborId,
      })),
    });

    return res.status(201).json({ ok: true, ordenId: orden.id });
  } catch (error: any) {
    console.error("❌ Error creando orden:", error);
    return res.status(500).json({
      error: "Error creando la orden",
      detail: String(error?.meta ?? error?.message ?? error),
    });
  }
});

/** Listar últimas N órdenes (default 10) */
router.get("/ordenes", async (req, res) => {
  const take = Number(req.query.take ?? 10);
  const data = await prisma.orden.findMany({
    orderBy: { fecha: "desc" },
    take,
  });
  res.json(data);
});

/** Obtener una orden por id con relaciones */
router.get("/ordenes/:id", async (req, res) => {
  const { id } = req.params;
  const data = await prisma.orden.findUnique({
    where: { id },
    include: {
      usuario: true,
      sucursal: true,
      contenidos: { include: { envase: true, sabor: true } },
    },
  });
  if (!data) return res.status(404).json({ error: "Orden no encontrada" });
  res.json(data);
});

export default router;

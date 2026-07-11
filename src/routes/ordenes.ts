import { Router } from "express";
import prisma from "../prismaClient";
import type { Prisma } from "@prisma/client";

const router = Router();

/** Próximo ID legible tipo "P104", continuando la numeración de los pedidos existentes. */
async function nextOrdenId(tx: Prisma.TransactionClient): Promise<string> {
  const rows = await tx.orden.findMany({
    where: { id: { startsWith: "P" } },
    select: { id: true },
  });
  let max = 99;
  for (const { id } of rows) {
    const m = /^P(\d+)$/.exec(id);
    if (m) {
      const n = Number(m[1]);
      if (n > max) max = n;
    }
  }
  return `P${max + 1}`;
}

/** POST /api/ordenes */
router.post("/", async (req, res) => {
  try {
    const { usuarioId, sucursalId, items } = req.body || {};

    if (!usuarioId || !sucursalId) {
      return res.status(400).json({ error: "usuarioId y sucursalId son requeridos" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items debe ser un array no vacío" });
    }

    // Normalizamos items a FKs crudos.
    // 'grupo' identifica a qué envase físico del pedido pertenece cada sabor
    // (dos kilos con gustos distintos en el mismo pedido no deben mezclarse).
    // Si el cliente no lo manda (payload viejo), cada item queda en su propio
    // grupo: es el comportamiento previo, no lo empeora.
    const contenidosData: { envaseId: string; saborId: string; grupo: number }[] = items.map((it: any, idx: number) => {
      const envaseId = it?.envaseId ?? it?.envase?.id;
      const saborId  = it?.saborId  ?? it?.sabor?.id;
      const grupo = Number.isInteger(it?.grupo) ? it.grupo : idx;
      if (!envaseId || !saborId) throw new Error(`Item #${idx + 1}: envaseId y saborId requeridos`);
      return { envaseId, saborId, grupo };
    });

    const nueva = await prisma.$transaction(async (tx) => {
      // Generamos ID legible dentro de la transacción (tu modelo no tiene default)
      const newId = await nextOrdenId(tx);

      // 1) Crear la orden con FK crudos (UncheckedCreateInput)
      const ordenData: Prisma.OrdenUncheckedCreateInput = {
        id: newId,
        usuarioId,
        sucursalId,
        estadoTerminado: false,
        fecha: new Date(),
      };
      await tx.orden.create({
        data: ordenData,
        select: { id: true },
      });

      // 2) Agregar contenidos vía el CAMPO DE RELACIÓN 'contenidos'
      //    (nested create) — evita usar tx.contenido y compila siempre.
      await tx.orden.update({
        where: { id: newId },
        data: {
          contenidos: {
            // createMany anidado puede no estar disponible en todas las versiones;
            // con 'create' (array) funciona en todas.
            create: contenidosData.map((c) => ({
              // Prisma setea ordenId automáticamente por la relación
              envaseId: c.envaseId,
              saborId: c.saborId,
              grupo: c.grupo,
            })),
          },
        },
        select: { id: true },
      });

      // 3) Devolver la orden completa
      return tx.orden.findUnique({
        where: { id: newId },
        include: {
          contenidos: { include: { envase: true, sabor: true } },
        },
      });
    });

    res.status(201).json(nueva);
  } catch (e: any) {
    console.error("[POST /api/ordenes] Error:", e);
    res.status(500).json({ error: e?.message ?? "No se pudo crear la orden" });
  }
});

/** PATCH /api/ordenes/:id/terminar */
router.patch("/:id/terminar", async (req, res) => {
  try {
    const { id } = req.params;
    const existente = await prisma.orden.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ error: "Orden no encontrada" });

    if (existente.estadoTerminado) {
      return res.json({ ok: true, id, estadoTerminado: true });
    }

    const actualizada = await prisma.orden.update({
      where: { id },
      data: { estadoTerminado: true },
      select: { id: true, estadoTerminado: true },
    });

    res.json({ ok: true, ...actualizada });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "No se pudo terminar la orden" });
  }
});

/** GET /api/ordenes/sucursal/:id
 * Órdenes de una sucursal puntual, con contenidos incluidos (usado por el panel
 * de vendedor). Devolver el detalle completo acá evita que el front tenga que
 * pedir cada orden por separado (era un fetch extra por pedido, en cada refresh).
 */
router.get("/sucursal/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const take = Number(req.query.take ?? 50);
    const ordenes = await prisma.orden.findMany({
      where: { sucursalId: id },
      take,
      orderBy: [{ fecha: "desc" }, { id: "desc" }],
      include: { contenidos: { include: { envase: true, sabor: true } } },
    });
    res.json(ordenes);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Error listando órdenes de la sucursal" });
  }
});

/** GET /api/ordenes
 * Acepta ?sucursalId= y/o ?usuarioId= para filtrar (usado como fallback por el
 * panel de vendedor, y por el historial del cliente para no traer los pedidos
 * de todo el mundo).
 */
router.get("/", async (req, res) => {
  try {
    const take = Number(req.query.take ?? 50);
    const { sucursalId, usuarioId } = req.query as { sucursalId?: string; usuarioId?: string };
    const where: Prisma.OrdenWhereInput = {};
    if (sucursalId) where.sucursalId = sucursalId;
    if (usuarioId) where.usuarioId = usuarioId;
    const ordenes = await prisma.orden.findMany({
      where,
      take,
      orderBy: [{ fecha: "desc" }, { id: "desc" }],
      select: { id: true, fecha: true, estadoTerminado: true, sucursalId: true, usuarioId: true },
    });
    res.json(ordenes);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Error listando órdenes" });
  }
});

/** GET /api/ordenes/:id */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const orden = await prisma.orden.findUnique({
      where: { id },
      include: { contenidos: { include: { envase: true, sabor: true } } },
    });
    if (!orden) return res.status(404).json({ error: "Orden no encontrada" });
    res.json(orden);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Error leyendo orden" });
  }
});

export default router;

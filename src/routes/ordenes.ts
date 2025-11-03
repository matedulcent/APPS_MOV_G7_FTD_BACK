// routes/ordenes.ts
import { Router } from "express";
import prisma from "../prismaClient";
import type { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";

const router = Router();

/** POST /api/ordenes */
router.post("/", async (req, res) => {
  try {
    const { usuarioId, sucursalId, items } = req.body || {};
    console.log("[POST /api/ordenes] body:", { usuarioId, sucursalId, itemsLen: Array.isArray(items) ? items.length : items });

    if (!usuarioId || !sucursalId) {
      return res.status(400).json({ error: "usuarioId y sucursalId son requeridos" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items debe ser un array no vacío" });
    }

    const contenidosData: { envaseId: string; saborId: string }[] = items.map((it: any, idx: number) => {
      const envaseId = it?.envaseId ?? it?.envase?.id;
      const saborId  = it?.saborId  ?? it?.sabor?.id;
      if (!envaseId || !saborId) throw new Error(`Item #${idx + 1}: envaseId y saborId requeridos`);
      return { envaseId, saborId };
    });

    const newId = `P_${randomBytes(4).toString("hex")}`;

    const nueva = await prisma.$transaction(async (tx) => {
      const ordenData: Prisma.OrdenUncheckedCreateInput = {
        id: newId,
        usuarioId,
        sucursalId,
        estadoTerminado: false,
        fecha: new Date(),
      };
      await tx.orden.create({ data: ordenData, select: { id: true } });
      await tx.orden.update({
        where: { id: newId },
        data: {
          contenidos: {
            create: contenidosData.map((c) => ({ envaseId: c.envaseId, saborId: c.saborId })),
          },
        },
        select: { id: true },
      });
      return tx.orden.findUnique({
        where: { id: newId },
        include: { contenidos: { include: { envase: true, sabor: true } } },
      });
    });

    console.log("[POST /api/ordenes] creada OK:", newId, "sucursalId:", sucursalId);
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
    console.log("[PATCH /api/ordenes/:id/terminar] id:", id);
    const existente = await prisma.orden.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ error: "Orden no encontrada" });

    if (existente.estadoTerminado) {
      console.log("[PATCH terminar] ya estaba terminada:", id);
      return res.json({ ok: true, id, estadoTerminado: true });
    }

    const actualizada = await prisma.orden.update({
      where: { id },
      data: { estadoTerminado: true },
      select: { id: true, estadoTerminado: true },
    });

    console.log("[PATCH terminar] OK:", actualizada);
    res.json({ ok: true, ...actualizada });
  } catch (e: any) {
    console.error("[PATCH terminar] ERROR:", e);
    res.status(500).json({ error: e?.message ?? "No se pudo terminar la orden" });
  }
});

/** GET /api/ordenes (con filtro opcional por ?sucursalId=) */
router.get("/", async (req, res) => {
  try {
    const take = Number(req.query.take ?? 50);
    const sucursalId = (req.query.sucursalId ?? "").toString().trim();
    const where = sucursalId ? { sucursalId } : undefined;

    const ordenes = await prisma.orden.findMany({
      where,
      take,
      orderBy: [{ fecha: "desc" }, { id: "desc" }],
      select: { id: true, fecha: true, estadoTerminado: true, sucursalId: true, usuarioId: true },
    });

    console.log("[GET /api/ordenes] filtro sucursalId:", sucursalId || "(sin filtro)", "=>", ordenes.length, "resultados");
    res.json(ordenes);
  } catch (e: any) {
    console.error("[GET /api/ordenes] ERROR:", e);
    res.status(500).json({ error: e?.message ?? "Error listando órdenes" });
  }
});

/** GET /api/ordenes/sucursal/:sucursalId (ruta explícita) */
router.get("/sucursal/:sucursalId", async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const take = Number(req.query.take ?? 50);

    const ordenes = await prisma.orden.findMany({
      where: { sucursalId },
      take,
      orderBy: [{ fecha: "desc" }, { id: "desc" }],
      select: { id: true, fecha: true, estadoTerminado: true, sucursalId: true, usuarioId: true },
    });

    console.log("[GET /api/ordenes/sucursal/:sucursalId]", sucursalId, "=>", ordenes.length);
    res.json(ordenes);
  } catch (e: any) {
    console.error("[GET /api/ordenes/sucursal/:sucursalId] ERROR:", e);
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
    console.log("[GET /api/ordenes/:id] id:", id, "existe:", !!orden);
    if (!orden) return res.status(404).json({ error: "Orden no encontrada" });
    res.json(orden);
  } catch (e: any) {
    console.error("[GET /api/ordenes/:id] ERROR:", e);
    res.status(500).json({ error: e?.message ?? "Error leyendo orden" });
  }
});

export default router;

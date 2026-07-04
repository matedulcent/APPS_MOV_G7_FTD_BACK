import { Router, Request, Response } from "express";
import prisma from "../prismaClient";

const router = Router();

const CATEGORIA_FALLBACK = "Especiales";

// GET /api/envases
router.get("/envases", async (_req, res) => {
  try {
    const envases = await prisma.envase.findMany({ orderBy: { tipoEnvase: "asc" } });
    res.json(envases);
  } catch (e) {
    console.error("[GET /envases]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// POST /api/envases — crear un envase nuevo en el catálogo global
router.post("/envases", async (req, res) => {
  try {
    const { tipoEnvase, maxCantSabores, categoria } = req.body as {
      tipoEnvase?: string;
      maxCantSabores?: number;
      categoria?: string;
    };

    if (!tipoEnvase || typeof tipoEnvase !== "string" || !tipoEnvase.trim()) {
      return res.status(400).json({ error: "tipoEnvase es requerido" });
    }
    const max = Number(maxCantSabores);
    if (!Number.isFinite(max) || max <= 0) {
      return res.status(400).json({ error: "maxCantSabores debe ser un número mayor a 0" });
    }

    const nuevo = await prisma.envase.create({
      data: {
        id: crypto.randomUUID(),
        tipoEnvase: tipoEnvase.trim(),
        maxCantSabores: max,
        categoria: (categoria && categoria.trim()) || CATEGORIA_FALLBACK,
      },
    });
    res.status(201).json(nuevo);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un envase con ese tipo" });
    }
    console.error("[POST /envases]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// GET /api/envases/categorias — lista de secciones gestionables
router.get("/envases/categorias", async (_req, res) => {
  try {
    const categorias = await prisma.categoriaEnvase.findMany({ orderBy: { nombre: "asc" } });
    res.json(categorias);
  } catch (e) {
    console.error("[GET /envases/categorias]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// POST /api/envases/categorias — crear una sección nueva (vacía)
router.post("/envases/categorias", async (req, res) => {
  try {
    const { nombre } = req.body as { nombre?: string };
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "nombre es requerido" });
    }
    const nueva = await prisma.categoriaEnvase.create({ data: { nombre: nombre.trim() } });
    res.status(201).json(nueva);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "Ya existe una sección con ese nombre" });
    }
    console.error("[POST /envases/categorias]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// DELETE /api/envases/categorias/:nombre — borra la sección; los envases que
// la tenían pasan a la sección "Especiales" (no se borra ningún envase).
router.delete("/envases/categorias/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params;
    if (nombre === CATEGORIA_FALLBACK) {
      return res.status(400).json({ error: `No se puede borrar la sección "${CATEGORIA_FALLBACK}"` });
    }

    await prisma.envase.updateMany({
      where: { categoria: nombre },
      data: { categoria: CATEGORIA_FALLBACK },
    });
    await prisma.categoriaEnvase.delete({ where: { nombre } });
    res.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Sección no encontrada" });
    console.error("[DELETE /envases/categorias/:nombre]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// ✅ marcar una orden como terminada
router.patch("/ordenes/:id/terminar", async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.orden.update({
      where: { id },
      data: { estadoTerminado: true },
      select: { id: true, estadoTerminado: true },
    });
    res.json({ ok: true, ...updated });
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Orden no encontrada" });
    res.status(500).json({ error: "Error interno" });
  }
});

/** DELETE /api/envases/:id
 * Borra un envase individual del catálogo. Se registra en server.ts con la
 * ruta completa (no como router.delete("/:id", ...) acá adentro) por el
 * mismo motivo que getSucursalById en routes/sucursales.ts: este router
 * también está montado en el prefijo genérico "/api".
 */
export async function deleteEnvaseHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const enUso = await prisma.contenidoPedido.count({ where: { envaseId: id } });
    if (enUso > 0) {
      return res.status(409).json({ error: "Este envase ya fue usado en pedidos, no se puede borrar" });
    }
    await prisma.envase.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Envase no encontrado" });
    console.error("[DELETE /api/envases/:id]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
}

export default router;


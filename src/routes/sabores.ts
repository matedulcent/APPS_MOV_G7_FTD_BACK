import { Router, Request, Response } from "express";
import prisma from "../prismaClient";

const router = Router();

const CATEGORIA_FALLBACK = "Especiales";

// GET /api/sabores
router.get("/sabores", async (_req, res) => {
  try {
    const sabores = await prisma.sabor.findMany({ orderBy: { tipoSabor: "asc" } });
    res.json(sabores);
  } catch (e) {
    console.error("[GET /sabores]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// POST /api/sabores — crear un sabor nuevo en el catálogo global
router.post("/sabores", async (req, res) => {
  try {
    const { tipoSabor, categoria } = req.body as { tipoSabor?: string; categoria?: string };

    if (!tipoSabor || typeof tipoSabor !== "string" || !tipoSabor.trim()) {
      return res.status(400).json({ error: "tipoSabor es requerido" });
    }

    const nuevo = await prisma.sabor.create({
      data: {
        id: crypto.randomUUID(),
        tipoSabor: tipoSabor.trim(),
        categoria: (categoria && categoria.trim()) || CATEGORIA_FALLBACK,
      },
    });
    res.status(201).json(nuevo);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un sabor con ese nombre" });
    }
    console.error("[POST /sabores]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// GET /api/sabores/categorias — lista de secciones gestionables
router.get("/sabores/categorias", async (_req, res) => {
  try {
    const categorias = await prisma.categoriaSabor.findMany({ orderBy: { nombre: "asc" } });
    res.json(categorias);
  } catch (e) {
    console.error("[GET /sabores/categorias]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// POST /api/sabores/categorias — crear una sección nueva (vacía)
router.post("/sabores/categorias", async (req, res) => {
  try {
    const { nombre } = req.body as { nombre?: string };
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "nombre es requerido" });
    }
    const nueva = await prisma.categoriaSabor.create({ data: { nombre: nombre.trim() } });
    res.status(201).json(nueva);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "Ya existe una sección con ese nombre" });
    }
    console.error("[POST /sabores/categorias]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// DELETE /api/sabores/categorias/:nombre — borra la sección; los sabores que
// la tenían pasan a la sección "Especiales" (no se borra ningún sabor).
router.delete("/sabores/categorias/:nombre", async (req, res) => {
  try {
    const { nombre } = req.params;
    if (nombre === CATEGORIA_FALLBACK) {
      return res.status(400).json({ error: `No se puede borrar la sección "${CATEGORIA_FALLBACK}"` });
    }

    await prisma.sabor.updateMany({
      where: { categoria: nombre },
      data: { categoria: CATEGORIA_FALLBACK },
    });
    await prisma.categoriaSabor.delete({ where: { nombre } });
    res.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Sección no encontrada" });
    console.error("[DELETE /sabores/categorias/:nombre]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

/** DELETE /api/sabores/:id
 * Borra un sabor individual del catálogo. Se registra en server.ts con la
 * ruta completa (no como router.delete("/:id", ...) acá adentro) por el
 * mismo motivo que getSucursalById en routes/sucursales.ts: este router
 * también está montado en el prefijo genérico "/api".
 */
export async function deleteSaborHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const enUso = await prisma.contenidoPedido.count({ where: { saborId: id } });
    if (enUso > 0) {
      return res.status(409).json({ error: "Este sabor ya fue usado en pedidos, no se puede borrar" });
    }
    await prisma.sabor.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Sabor no encontrado" });
    console.error("[DELETE /api/sabores/:id]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
}

export default router;

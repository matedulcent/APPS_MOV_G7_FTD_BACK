import { Router } from "express";
import prisma from "../prismaClient";
import crypto from "crypto";

const router = Router();

/** GET /api/sucursales/:id/oferta
 * Devuelve envases + sabores ofrecidos por esa sucursal
 */

// ─── helpers de validación ─────────────────────────────────────────────────────
const isEmail = (s?: string) =>
  typeof s === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

const isHttpUrl = (s?: string) => {
  if (!s || typeof s !== "string") return false;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

// ─── LOGIN VENDEDOR ────────────────────────────────────────────────────────────
// POST /api/sucursales/login
// Body: { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const mail = (email || "").toString().trim().toLowerCase();
    const pass = (password || "").toString();

    if (!mail || !pass) {
      return res.status(400).json({ error: "Email y password requeridos" });
    }

    // Buscar sucursal por mail
    const suc = await prisma.sucursal.findFirst({
      where: { mail },
      select: { id: true, nombre: true, mail: true, contrasena: true },
    });

    if (!suc || (suc.contrasena || "") !== pass) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Respuesta que espera el front
    return res.json({
      id: suc.id,                  // userId para Redux
      nombre: suc.nombre || "",
      email: suc.mail || mail,
      role: "vendedor",
      sucursalId: suc.id,          // necesario para navegar a Pedidos_Sucursal
    });
  } catch (e: any) {
    console.error("[POST /api/sucursales/login] ERROR:", e);
    res.status(500).json({ error: e?.message ?? "Error en login vendedor" });
  }
});


// ─── REGISTRO DE SUCURSAL ─────────────────────────────────────────────────────
// POST /api/sucursales/registro
// Body desde el front:
//   { nombre?, email, password, domicilio?, urlImagen? }
router.post("/registro", async (req, res) => {
  try {
    const {
      nombre,
      email,
      password,
      domicilio,
      urlImagen,
    } = req.body as {
      nombre?: string;
      email?: string;
      password?: string;
      domicilio?: string;
      urlImagen?: string;
    };

    // Requeridos
    if (!email || !password) {
      return res.status(400).send("Faltan campos: email y password son requeridos");
    }
    if (!isEmail(email)) {
      return res.status(400).send("Email inválido");
    }
    if (password.length < 6) {
      return res.status(400).send("La contraseña debe tener al menos 6 caracteres");
    }

    // Opcionales con reglas mínimas
    if (nombre && nombre.trim().length < 2) {
      return res.status(400).send("El nombre debe tener al menos 2 caracteres");
    }
    if (urlImagen && !isHttpUrl(urlImagen)) {
      return res.status(400).send("La URL de imagen debe empezar con http(s)://");
    }
    if (domicilio && domicilio.trim().length < 3) {
      return res.status(400).send("El domicilio debe tener al menos 3 caracteres");
    }

    // mail único
    const existente = await prisma.sucursal.findUnique({
      where: { mail: email },
      select: { id: true },
    });
    if (existente) {
      return res.status(409).send("El email ya está registrado");
    }

    function generarIdUsuario() {
      const random = Math.floor(10000 + Math.random() * 90000);
      return `S${random}`;
    }
    const id = generarIdUsuario();

    // TODO (recomendado): hashear password con bcrypt
    const creada = await prisma.sucursal.create({
      data: {
        id,
        nombre: nombre ?? null,
        mail: email,
        contrasena: password,
        domicilio: domicilio ?? null,
        urlImagen: urlImagen ?? null,
      },
      select: {
        id: true,
        nombre: true,
        mail: true,
        domicilio: true,
        urlImagen: true,
      },
    });

    return res.status(201).json(creada);
  } catch (e: any) {
    console.error("Error al registrar sucursal:", e);
    if (e?.code === "P2002") {
      // Unique constraint (mail)
      return res.status(409).send("El email ya está registrado");
    }
    return res.status(500).send("Error interno");
  }
});

// ─── LISTAR TODAS LAS SUCURSALES ──────────────────────────────────────────────
// GET /api/sucursales
router.get("/", async (_req, res) => {
  try {
    const sucursales = await prisma.sucursal.findMany({
      select: {
        id: true,
        nombre: true,
        domicilio: true,
        urlImagen: true,
      },
    });
    res.json(sucursales);
  } catch (e) {
    console.error("[GET /api/sucursales]", e);
    res.status(500).json({ error: "Error al obtener sucursales" });
  }
});

// ─── OBTENER UNA SUCURSAL (para el título de la heladería) ────────────────────
// GET /api/sucursales/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const suc = await prisma.sucursal.findUnique({
      where: { id },
      select: { id: true, nombre: true, domicilio: true, urlImagen: true },
    });
    if (!suc) return res.status(404).json({ error: "Sucursal no encontrada" });
    res.json(suc);
  } catch (e) {
    console.error("[GET /api/sucursales/:id]", e);
    res.status(500).json({ error: "Error al obtener sucursal" });
  }
});

router.get("/:id/oferta", async (req, res) => {
  try {
    const { id } = req.params;
    const sucursal = await prisma.sucursal.findUnique({
      where: { id },
      include: {
        envasesOfrecidos: true,
        saboresOfrecidos: true,
      },
    });
    if (!sucursal) return res.status(404).json({ error: "Sucursal no encontrada" });

    res.json({
      envases: sucursal.envasesOfrecidos,
      sabores: sucursal.saboresOfrecidos,
    });
  } catch (e) {
    console.error("[GET /sucursales/:id/oferta]", e);
    res.status(500).json({ error: "Error de servidor" });
  }
});

/** PUT /api/sucursales/:id/oferta
 * Reemplaza la oferta completa de la sucursal
 * body: { envaseIds: string[], saborIds: string[] }
 */
router.put("/:id/oferta", async (req, res) => {
  try {
    const { id } = req.params;
    const { envaseIds = [], saborIds = [] } = req.body ?? {};

    const updated = await prisma.sucursal.update({
      where: { id },
      data: {
        envasesOfrecidos: { set: (envaseIds as string[]).map((eid) => ({ id: eid })) },
        saboresOfrecidos: { set: (saborIds as string[]).map((sid) => ({ id: sid })) },
      },
      include: {
        envasesOfrecidos: true,
        saboresOfrecidos: true,
      },
    });

    res.json({
      envases: updated.envasesOfrecidos,
      sabores: updated.saboresOfrecidos,
    });
  } catch (e: any) {
    console.error("[PUT /sucursales/:id/oferta]", e);
    if (e.code === "P2025") return res.status(404).json({ error: "Sucursal no encontrada" });
    res.status(500).json({ error: "Error de servidor" });
  }
});

export default router;

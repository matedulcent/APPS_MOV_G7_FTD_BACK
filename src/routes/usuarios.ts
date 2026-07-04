/**
 * routes/usuarios.ts
 * ------------------
 * Listado y login de usuarios/sucursales.
 * Montado en server.ts con: app.use("/api", usuariosRouter)
 */
import { Router } from "express";
import prisma from "../prismaClient";
// import bcrypt from "bcrypt"; // (si más adelante querés hashear)

const router = Router();

/** GET /api/usuarios */

// === REGISTRO DE USUARIO (NUEVO) ===
// POST /api/usuarios/registro
// Body esperado desde el front: { nombre, email, password }
// Mapea a tu modelo: { id: string, nombre?: string, mail?: string, contrasena?: string }
router.post("/registro", async (req, res) => {
  try {
    const { nombre, email, password } = req.body as {
      nombre?: string;
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).send("Faltan campos: email y password son requeridos");
    }

    // mail es único en tu schema
    const ya = await prisma.usuario.findUnique({
      where: { mail: email },
      select: { id: true },
    });
    if (ya) {
      return res.status(409).send("El email ya está registrado");
    }

    const id = crypto.randomUUID(); // tu id es String
    // TODO: si querés, acá podés hashear con bcrypt

    const nuevo = await prisma.usuario.create({
      data: {
        id,
        nombre: nombre ?? null,
        mail: email,
        contrasena: password,
      },
      select: { id: true, nombre: true, mail: true }, // no retornamos contrasena
    });

    return res.status(201).json(nuevo);
  } catch (e: any) {
    console.error("Error al registrar usuario:", e);
    if (e?.code === "P2002") {
      return res.status(409).send("El email ya está registrado");
    }
    return res.status(500).send("Error interno");
  }
});


router.get("/usuarios", async (_req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (err: any) {
    console.error("[GET /usuarios] error:", err);
    res.status(500).json({ ok: false, error: err?.message ?? "Error al obtener usuarios" });
  }
});

/** Handler de login compartido (usuario o sucursal) */
export async function loginHandler(req: any, res: any) {
  try {
    const { email, password, role } = (req.body ?? {}) as {
      email?: string;
      password?: string;
      role?: "cliente" | "vendedor";
    };

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Faltan email y/o contraseña" });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const passInput = String(password);

    console.log("📩 [LOGIN] datos recibidos:", { emailNorm, role });

    // 1) Buscar en Usuario
    const usuario = await prisma.usuario.findFirst({
      where: { mail: { in: [emailNorm, email] } },
      select: { id: true, nombre: true, mail: true, contrasena: true },
    });
    console.log("🧍 [LOGIN] match Usuario:", usuario);

    // 2) Si no hay usuario, buscar en Sucursal (vendedor)
    const sucursal = usuario
      ? null
      : await prisma.sucursal.findFirst({
          where: { mail: { in: [emailNorm, email] } },
          select: { id: true, nombre: true, mail: true, contrasena: true },
        });
    console.log("🏪 [LOGIN] match Sucursal:", sucursal);

    if (!usuario && !sucursal) {
      console.log("❌ [LOGIN] no existe mail en Usuario ni en Sucursal");
      return res.status(401).json({ ok: false, error: "Email o contraseña incorrectos" });
    }

    // 3) Comparación simple (sin hash, como pediste)
    const okPw =
      (usuario && usuario.contrasena === passInput) ||
      (sucursal && sucursal.contrasena === passInput);

    console.log("🔑 [LOGIN] contraseña coincide:", okPw);

    if (!okPw) {
      return res.status(401).json({ ok: false, error: "Email o contraseña incorrectos" });
    }

    // 4) Armar respuesta coherente
    const resp = usuario
      ? {
          ok: true,
          role: "cliente" as const,
          userId: String(usuario.id),
          nombre: usuario.nombre ?? null,
          email: usuario.mail,
        }
      : {
          ok: true,
          role: "vendedor" as const,
          sucursalId: String(sucursal!.id),
          nombre: sucursal!.nombre ?? null,
          email: sucursal!.mail,
        };

    console.log("✅ [LOGIN] respuesta:", resp);
    return res.json(resp);
  } catch (e) {
    console.error("[LOGIN] error:", e);
    return res.status(500).json({ ok: false, error: "Error interno" });
  }
}

/** POST /api/usuarios/login (principal) */
router.post("/usuarios/login", loginHandler);

/** POST /api/login (alias retrocompatible) */
router.post("/login", loginHandler);

export default router;

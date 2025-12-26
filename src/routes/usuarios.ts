/**
 * routes/usuarios.ts
 * ------------------
 * Listado y login de usuarios/sucursales.
 * Montado en server.ts con: app.use("/api", usuariosRouter)
 */
import { Router } from "express";
import prisma from "../prismaClient";
import { generarIdUsuario } from "./utils";
// import bcrypt from "bcrypt"; // (si más adelante querés hashear)

const router = Router();

// === REGISTRO DE USUARIO (NUEVO) ===
// POST /api/usuarios/registro
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

    const ya = await prisma.usuario.findUnique({
      where: { mail: email },
      select: { id: true },
    });
    if (ya) {
      return res.status(409).send("El email ya está registrado");
    }

    const id = generarIdUsuario();

    const nuevo = await prisma.usuario.create({
      data: {
        id,
        nombre: nombre ?? null,
        mail: email,
        contrasena: password,
      },
      select: { id: true, nombre: true, mail: true },
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
async function loginHandler(req: any, res: any) {
  try {
    const { email, password, role } = (req.body ?? {}) as {
      email?: string;
      password?: string;
      role?: "cliente" | "vendedor";
    };

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Faltan email y/o contraseña" });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const passInput = String(password);

    console.log("📩 [LOGIN] datos recibidos:", { emailNorm, role });

    const usuario = await prisma.usuario.findFirst({
      where: { mail: { in: [emailNorm, email] } },
      select: { id: true, nombre: true, mail: true, contrasena: true },
    });

    const sucursal = usuario
      ? null
      : await prisma.sucursal.findFirst({
          where: { mail: { in: [emailNorm, email] } },
          select: { id: true, nombre: true, mail: true, contrasena: true },
        });

    if (!usuario && !sucursal) {
      return res.status(401).json({ ok: false, error: "Email o contraseña incorrectos" });
    }

    const okPw =
      (usuario && usuario.contrasena === passInput) ||
      (sucursal && sucursal.contrasena === passInput);

    if (!okPw) {
      return res.status(401).json({ ok: false, error: "Email o contraseña incorrectos" });
    }

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

    return res.json(resp);
  } catch (e) {
    console.error("[LOGIN] error:", e);
    return res.status(500).json({ ok: false, error: "Error interno" });
  }
}

router.post("/usuarios/login", loginHandler);
router.post("/login", loginHandler);

export default router;

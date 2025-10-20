/**
 * routes/usuarios.ts
 * ------------------
 * Listado de usuarios.
 */
import { Router } from "express";
import prisma from "../prismaClient";

//import bcrypt from "bcrypt"; // para hash

const router = Router();

router.get("/usuarios", async (_req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Error al obtener usuarios" });
  }
});

/**
 * POST /api/login
 * body: { email: string, password: string, role?: "cliente" | "vendedor" }
 * retorna: { userId, role, nombre? }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body as {
      email: string;
      password: string;
      role?: "cliente" | "vendedor";
    };

    const emailNorm = (email ?? "").trim().toLowerCase();
    const passInput = (password ?? "");

    console.log("📩 Datos recibidos del front:");
    console.log({ emailNorm, passInput, role });

    // Buscar usuario
    const usuario = await prisma.usuario.findFirst({
      where: { mail: { in: [emailNorm, email] } },
      select: { id: true, nombre: true, mail: true, contrasena: true },
    });

    console.log("🧍 Resultado de búsqueda en Usuario:");
    console.log(usuario);

    // Buscar sucursal si no hay usuario
    const sucursal = usuario
      ? null
      : await prisma.sucursal.findFirst({
          where: { mail: { in: [emailNorm, email] } },
          select: { id: true, nombre: true, mail: true, contrasena: true },
        });

    console.log("🏪 Resultado de búsqueda en Sucursal:");
    console.log(sucursal);

    // Comparación simple
    const ok =
      usuario?.contrasena === passInput ||
      sucursal?.contrasena === passInput;

    console.log("🔑 Coincidencia de contraseña:", ok);

    if (!usuario && !sucursal) {
      console.log("❌ No se encontró ningún usuario ni sucursal con ese mail.");
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    if (!ok) {
      console.log("❌ La contraseña no coincide.");
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // Éxito
    const respuesta = usuario
      ? {
          role: "cliente" as const,
          userId: String(usuario.id),
          nombre: usuario.nombre ?? null,
          email: usuario.mail,
        }
      : {
          role: "vendedor" as const,
          sucursalId: String(sucursal!.id),
          nombre: sucursal!.nombre ?? null,
          email: sucursal!.mail,
        };

    console.log("✅ Respuesta enviada al front:");
    console.log(respuesta);

    return res.json(respuesta);
  } catch (e) {
    console.error("[/api/login] error:", e);
    return res.status(500).json({ error: "Error interno" });
  }
});


export default router;


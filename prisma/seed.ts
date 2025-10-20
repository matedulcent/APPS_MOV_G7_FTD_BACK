import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1) Limpiar todo (hijos -> padres)
  await prisma.contenidoPedido.deleteMany({});
  await prisma.orden.deleteMany({});
  await prisma.envase.deleteMany({});
  await prisma.sabor.deleteMany({});
  await prisma.sucursal.deleteMany({});
  await prisma.usuario.deleteMany({});

  // 2) Insertar datos base

  // === USUARIOS ===
  await prisma.usuario.createMany({
    data: [
      { id: "U7845", nombre: "aaaa", mail: "a1@gmail.com", contrasena: "aaaaaa" },
      { id: "U7846", nombre: "aaaa", mail: "a2@gmail.com", contrasena: "aaaaaa" },
      { id: "U7847", nombre: "aaaa", mail: "a3@gmail.com", contrasena: "aaaaaa" },
      { id: "U7848", nombre: "aaaa", mail: "a4@gmail.com", contrasena: "aaaaaa" },
    ],
  });

  // === SUCURSALES ===
  await prisma.sucursal.createMany({
    data: [
      { id: "S1234", nombre: "Sucursal 1", mail: "s1@gmail.com", contrasena: "aaaaaa", urlImagen: "img1.png", domicilio: "Av. Córdoba 1234" },
      { id: "S1235", nombre: "Sucursal 2", mail: "s2@gmail.com", contrasena: "aaaaaa", urlImagen: "img2.png", domicilio: "Av. Rivadavia 456" },
      { id: "S1236", nombre: "Sucursal 3", mail: "s3@gmail.com", contrasena: "aaaaaa", urlImagen: "img3.png", domicilio: "Av. Santa Fe 789" },
      { id: "S1237", nombre: "Sucursal 4", mail: "s4@gmail.com", contrasena: "aaaaaa", urlImagen: "img4.png", domicilio: "Paseo Colón 1800" },
    ],
  });

  // === ENVASES ===
  await prisma.envase.createMany({
    data: [
      { id: "B1",  tipoEnvase: "Cucurucho_1", maxCantSabores: 1 },
      { id: "B2",  tipoEnvase: "Cucurucho_2", maxCantSabores: 2 },
      { id: "B3",  tipoEnvase: "Cucurucho_3", maxCantSabores: 3 },
      { id: "B4",  tipoEnvase: "Cucurucho_4", maxCantSabores: 4 },
      { id: "B5",  tipoEnvase: "Kilo_0.5",    maxCantSabores: 4 },
      { id: "B6",  tipoEnvase: "Kilo_0.25",   maxCantSabores: 2 },
      { id: "B7",  tipoEnvase: "Kilo_1",      maxCantSabores: 4 },
      { id: "B8",  tipoEnvase: "Vaso_1",      maxCantSabores: 1 },
      { id: "B9",  tipoEnvase: "Vaso_2",      maxCantSabores: 2 },
      { id: "B10", tipoEnvase: "Vaso_3",      maxCantSabores: 3 },
      { id: "B11", tipoEnvase: "Vaso_4",      maxCantSabores: 4 },
    ],
  });

  // === SABORES (20 únicos) ===
  await prisma.sabor.createMany({
    data: [
      { id: "F1",  tipoSabor: "Frutilla" },
      { id: "F2",  tipoSabor: "Chocolate" },
      { id: "F3",  tipoSabor: "Choco Blanco" },
      { id: "F4",  tipoSabor: "Chocolate Amargo" },
      { id: "F5",  tipoSabor: "Chocolate con Almendras" },
      { id: "F6",  tipoSabor: "Choco Menta" },
      { id: "F7",  tipoSabor: "Ron" },
      { id: "F8",  tipoSabor: "Ron con Pasas" },
      { id: "F9",  tipoSabor: "Vainilla" },
      { id: "F10", tipoSabor: "Cacahuate" },
      { id: "F11", tipoSabor: "Maní" },
      { id: "F12", tipoSabor: "Pistacho" },
      { id: "F13", tipoSabor: "Crema Cielo" },
      { id: "F14", tipoSabor: "Crema" },
      { id: "F15", tipoSabor: "Yogur" },
      { id: "F16", tipoSabor: "DDL" },
      { id: "F17", tipoSabor: "Dulce de Leche" },
      { id: "F18", tipoSabor: "Caramelo" },
      { id: "F19", tipoSabor: "Americana" },
      { id: "F20", tipoSabor: "Crema Americana" },
    ],
  });

  // 3) Definir la OFERTA por sucursal (relaciones M:N)
  //    Elegimos sets que cubren los envases/sabores usados por las órdenes de ejemplo.
  const ofertaPorSucursal: Record<string, { envases: string[]; sabores: string[] }> = {
    // P100 (S1234) usa B1,B2,B3,B4,B5,B7 y F1,F2,F3,F4,F5,F9,F10,F11,F15
    S1234: {
      envases: ["B1", "B2", "B3", "B4", "B5", "B7"],
      sabores: ["F1", "F2", "F3", "F4", "F5", "F9", "F10", "F11", "F15"],
    },
    // P101 (S1235) usa B1,B2 y F6,F12,F13
    S1235: {
      envases: ["B1", "B2", "B8"], // agrego B8 como extra de ejemplo
      sabores: ["F6", "F12", "F13"],
    },
    // P102 (S1236) usa B2 y F7,F14
    S1236: {
      envases: ["B2", "B3"], // extra de ejemplo
      sabores: ["F7", "F14"],
    },
    // P103 (S1237) usa B2 y F8
    S1237: {
      envases: ["B2", "B9"], // extra de ejemplo
      sabores: ["F8", "F20"], // agrego F20 como extra de ejemplo
    },
  };

  // Aplicar oferta a cada sucursal (SET reemplaza totalmente la relación)
  for (const [sucursalId, { envases, sabores }] of Object.entries(ofertaPorSucursal)) {
    await prisma.sucursal.update({
      where: { id: sucursalId },
      data: {
        envasesOfrecidos: { set: envases.map((id) => ({ id })) },
        saboresOfrecidos: { set: sabores.map((id) => ({ id })) },
      },
    });
  }

  // 4) ORDENES DE EJEMPLO
  await prisma.orden.createMany({
    data: [
      { id: "P100", fecha: new Date("2025-01-01"), estadoTerminado: true,  usuarioId: "U7845", sucursalId: "S1234" },
      { id: "P101", fecha: new Date("2025-01-02"), estadoTerminado: false, usuarioId: "U7846", sucursalId: "S1235" },
      { id: "P102", fecha: new Date("2025-01-02"), estadoTerminado: false, usuarioId: "U7847", sucursalId: "S1236" },
      { id: "P103", fecha: new Date("2025-01-03"), estadoTerminado: false, usuarioId: "U7848", sucursalId: "S1237" },
    ],
  });

  // 5) CONTENIDO PEDIDO (coincide con las ofertas de cada sucursal)
  const contenidos = [
    // P100 -> S1234
    { ordenId: "P100", envaseId: "B1", saborId: "F1"  },
    { ordenId: "P100", envaseId: "B2", saborId: "F2"  },
    { ordenId: "P100", envaseId: "B2", saborId: "F3"  },
    { ordenId: "P100", envaseId: "B3", saborId: "F4"  },
    { ordenId: "P100", envaseId: "B4", saborId: "F5"  },
    { ordenId: "P100", envaseId: "B4", saborId: "F9"  },
    { ordenId: "P100", envaseId: "B5", saborId: "F10" },
    { ordenId: "P100", envaseId: "B7", saborId: "F11" },
    { ordenId: "P100", envaseId: "B2", saborId: "F15" },

    // P101 -> S1235
    { ordenId: "P101", envaseId: "B1", saborId: "F12" },
    { ordenId: "P101", envaseId: "B2", saborId: "F13" },
    { ordenId: "P101", envaseId: "B2", saborId: "F6"  },

    // P102 -> S1236
    { ordenId: "P102", envaseId: "B2", saborId: "F7"  },
    { ordenId: "P102", envaseId: "B2", saborId: "F14" },

    // P103 -> S1237
    { ordenId: "P103", envaseId: "B2", saborId: "F8"  },
  ];

  for (const c of contenidos) {
    await prisma.contenidoPedido.create({ data: c });
  }

  console.log("✅ Seed finalizada correctamente (con ofertas por sucursal)");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    // Usuarios
    await prisma.usuario.createMany({
        data: [
            { id: "U7845", nombre: "aaaa", mail: "a1@gmail.com", contrasena: "aaaaaa" },
            { id: "U7846", nombre: "aaaa", mail: "a2@gmail.com", contrasena: "aaaaaa" },
            { id: "U7847", nombre: "aaaa", mail: "a3@gmail.com", contrasena: "aaaaaa" },
            { id: "U7848", nombre: "aaaa", mail: "a4@gmail.com", contrasena: "aaaaaa" }
        ]
    });

    // Sucursales
    await prisma.sucursal.createMany({
        data: [
            { id: "S1234", nombre: "aaaa", mail: "s1@gmail.com", contrasena: "aaaaaa", urlImagen: "asd", domicilio: "aaaaaa" },
            { id: "S1235", nombre: "aaaa", mail: "s2@gmail.com", contrasena: "aaaaaa", urlImagen: "casdf", domicilio: "aaaaaa" },
            { id: "S1236", nombre: "aaaa", mail: "s3@gmail.com", contrasena: "aaaaaa", urlImagen: "asdf", domicilio: "aaaaaa" },
            { id: "S1237", nombre: "aaaa", mail: "s4@gmail.com", contrasena: "aaaaaa", urlImagen: "asdf", domicilio: "aaaaaa" }
        ]
    });

    // Envases
    await prisma.envase.createMany({
        data: [
            { id: "B1", tipoEnvase: "Cucurucho_1", maxCantSabores: 1, icon: "icecream" },
            { id: "B2", tipoEnvase: "Cucurucho_2", maxCantSabores: 2, icon: "icecream" },
            { id: "B3", tipoEnvase: "Cucurucho_3", maxCantSabores: 3, icon: "icecream" },
            { id: "B4", tipoEnvase: "Cucurucho_4", maxCantSabores: 4, icon: "icecream" },
            { id: "B5", tipoEnvase: "Kilo_0.5", maxCantSabores: 4, icon: "whatshot" },
            { id: "B6", tipoEnvase: "Kilo_0.25", maxCantSabores: 2, icon: "whatshot" },
            { id: "B7", tipoEnvase: "Kilo_1", maxCantSabores: 4, icon: "whatshot" },
            { id: "B8", tipoEnvase: "Vaso_1", maxCantSabores: 1, icon: "local-drink" },
            { id: "B9", tipoEnvase: "Vaso_2", maxCantSabores: 2, icon: "local-drink" },
            { id: "B10", tipoEnvase: "Vaso_3", maxCantSabores: 3, icon: "local-drink" },
            { id: "B11", tipoEnvase: "Vaso_4", maxCantSabores: 4, icon: "local-drink" }
        ]
    });

    // Sabores
    await prisma.sabor.createMany({
        data: [
            { id: "F1", tipoSabor: "frutilla" },
            { id: "F2", tipoSabor: "Chocolate" },
            { id: "F3", tipoSabor: "Ron" },
            { id: "F4", tipoSabor: "Vainilla" },
            { id: "F5", tipoSabor: "Cacahuate" },
            { id: "F6", tipoSabor: "Pistacho" },
            { id: "F7", tipoSabor: "Crema Cielo" },
            { id: "F8", tipoSabor: "Crema" },
            { id: "F9", tipoSabor: "DDL" },
            { id: "F10", tipoSabor: "Americana" }
        ]
    });

    // Ordenes
    await prisma.orden.createMany({
        data: [
            { id: "P100", fecha: new Date("2025-01-01"), estadoTerminado: true, usuarioId: "U7845", sucursalId: "S1234" },
            { id: "P101", fecha: new Date("2025-01-02"), estadoTerminado: false, usuarioId: "U7846", sucursalId: "S1235" },
            { id: "P102", fecha: new Date("2025-01-02"), estadoTerminado: false, usuarioId: "U7847", sucursalId: "S1236" },
            { id: "P103", fecha: new Date("2025-01-03"), estadoTerminado: false, usuarioId: "U7848", sucursalId: "S1237" }
        ]
    });

    // ContenidoPedido (manejo manual de duplicados)
    const contenidos = [
        { ordenId: "P100", envaseId: "B1", saborId: "F1" },
        { ordenId: "P100", envaseId: "B1", saborId: "F2" },
        { ordenId: "P100", envaseId: "B1", saborId: "F3" },
        { ordenId: "P100", envaseId: "B2", saborId: "F4" },
        { ordenId: "P100", envaseId: "B2", saborId: "F4" },
        { ordenId: "P101", envaseId: "B2", saborId: "F5" },
        { ordenId: "P102", envaseId: "B2", saborId: "F6" },
        { ordenId: "P103", envaseId: "B2", saborId: "F7" },
        { ordenId: "P100", envaseId: "B4", saborId: "F10" },
        { ordenId: "P100", envaseId: "B5", saborId: "F7" },
        { ordenId: "P100", envaseId: "B7", saborId: "F10" },
        { ordenId: "P101", envaseId: "B1", saborId: "F1" },
        { ordenId: "P101", envaseId: "B2", saborId: "F2" },
        { ordenId: "P102", envaseId: "B2", saborId: "F3" },
        { ordenId: "P100", envaseId: "B2", saborId: "F2" }
    ];

    for (const c of contenidos) {
        try {
            await prisma.contenidoPedido.create({ data: c });
        } catch (e) {
            // ignorar duplicados
        }
    }

    console.log("Seed finalizada");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

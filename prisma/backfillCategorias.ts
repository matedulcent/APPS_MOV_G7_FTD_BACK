// Script de una sola vez: reclasifica los sabores/envases que ya existían
// (creados antes de que "categoria" fuera un campo real) usando la misma
// lógica de palabras clave que tenía el front, para no perder la
// categorización que el usuario ya venía viendo. Correr con:
//   npx ts-node --transpile-only prisma/backfillCategorias.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIAS_SABOR = ["Cremas", "Frutales", "Dulce de leche", "Chocolates", "Especiales"];
const CATEGORIAS_ENVASE = ["Conos", "Kilo", "Vasos", "Especiales"];

function normalize(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

function grupoDeSabor(nombre: string): string {
  const n = normalize(nombre);
  if (/(chocolate|choco|cacao|amargo|blanco|almendra|almendras|menta)/.test(n)) return "Chocolates";
  if (/(dulce de leche|ddl)/.test(n)) return "Dulce de leche";
  if (/(crema|americana|vainilla|tramontana|sambayon|flan|yogur|yogurt|ricota|panna|nata)/.test(n)) return "Cremas";
  if (
    /(frutilla|fresa|limon|naranja|frambuesa|mora|maracuya|anan|piña|mango|durazno|melocoton|kiwi|uva|manzana|pera|cereza|sandia|melon|banana|platano)/.test(
      n
    )
  )
    return "Frutales";
  return "Especiales";
}

function grupoDeEnvase(tipoEnvase: string): string {
  const k = (tipoEnvase.split("_")[0] || "").toLowerCase();
  if (k === "cucurucho") return "Conos";
  if (k === "kilo") return "Kilo";
  if (k === "vaso") return "Vasos";
  return "Especiales";
}

async function main() {
  for (const nombre of CATEGORIAS_SABOR) {
    await prisma.categoriaSabor.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  for (const nombre of CATEGORIAS_ENVASE) {
    await prisma.categoriaEnvase.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }

  const sabores = await prisma.sabor.findMany();
  for (const s of sabores) {
    const categoria = grupoDeSabor(s.tipoSabor);
    await prisma.sabor.update({ where: { id: s.id }, data: { categoria } });
    console.log(`Sabor "${s.tipoSabor}" -> ${categoria}`);
  }

  const envases = await prisma.envase.findMany();
  for (const e of envases) {
    const categoria = grupoDeEnvase(e.tipoEnvase);
    await prisma.envase.update({ where: { id: e.id }, data: { categoria } });
    console.log(`Envase "${e.tipoEnvase}" -> ${categoria}`);
  }

  console.log("✅ Backfill de categorías terminado");
}

main()
  .catch((e) => {
    console.error("❌ Error en backfill:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

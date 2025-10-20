/**
 * prismaClient.ts
 * ----------------
 * Crea y exporta un único PrismaClient para toda la app.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export default prisma;

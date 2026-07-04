-- CreateTable
CREATE TABLE "CategoriaEnvase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CategoriaSabor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Envase" (
    "ID_Envase" TEXT NOT NULL PRIMARY KEY,
    "tipoEnvase" TEXT NOT NULL,
    "maxCantSabores" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'Especiales'
);
INSERT INTO "new_Envase" ("ID_Envase", "maxCantSabores", "tipoEnvase") SELECT "ID_Envase", "maxCantSabores", "tipoEnvase" FROM "Envase";
DROP TABLE "Envase";
ALTER TABLE "new_Envase" RENAME TO "Envase";
CREATE UNIQUE INDEX "Envase_tipoEnvase_key" ON "Envase"("tipoEnvase");
CREATE TABLE "new_Sabor" (
    "ID_SABOR" TEXT NOT NULL PRIMARY KEY,
    "tipoSabor" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'Otros'
);
INSERT INTO "new_Sabor" ("ID_SABOR", "tipoSabor") SELECT "ID_SABOR", "tipoSabor" FROM "Sabor";
DROP TABLE "Sabor";
ALTER TABLE "new_Sabor" RENAME TO "Sabor";
CREATE UNIQUE INDEX "Sabor_tipoSabor_key" ON "Sabor"("tipoSabor");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaEnvase_nombre_key" ON "CategoriaEnvase"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaSabor_nombre_key" ON "CategoriaSabor"("nombre");

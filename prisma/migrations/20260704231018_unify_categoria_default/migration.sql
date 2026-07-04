-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sabor" (
    "ID_SABOR" TEXT NOT NULL PRIMARY KEY,
    "tipoSabor" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'Especiales'
);
INSERT INTO "new_Sabor" ("ID_SABOR", "categoria", "tipoSabor") SELECT "ID_SABOR", "categoria", "tipoSabor" FROM "Sabor";
DROP TABLE "Sabor";
ALTER TABLE "new_Sabor" RENAME TO "Sabor";
CREATE UNIQUE INDEX "Sabor_tipoSabor_key" ON "Sabor"("tipoSabor");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

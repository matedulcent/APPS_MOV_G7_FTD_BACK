-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContenidoPedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordenId" TEXT NOT NULL,
    "envaseId" TEXT NOT NULL,
    "saborId" TEXT NOT NULL,
    "grupo" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ContenidoPedido_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden" ("ID_Pedido") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContenidoPedido_envaseId_fkey" FOREIGN KEY ("envaseId") REFERENCES "Envase" ("ID_Envase") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContenidoPedido_saborId_fkey" FOREIGN KEY ("saborId") REFERENCES "Sabor" ("ID_SABOR") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ContenidoPedido" ("envaseId", "id", "ordenId", "saborId") SELECT "envaseId", "id", "ordenId", "saborId" FROM "ContenidoPedido";
DROP TABLE "ContenidoPedido";
ALTER TABLE "new_ContenidoPedido" RENAME TO "ContenidoPedido";
CREATE INDEX "ContenidoPedido_ordenId_idx" ON "ContenidoPedido"("ordenId");
CREATE INDEX "ContenidoPedido_envaseId_idx" ON "ContenidoPedido"("envaseId");
CREATE INDEX "ContenidoPedido_saborId_idx" ON "ContenidoPedido"("saborId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "_EnvaseToSucursal" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EnvaseToSucursal_A_fkey" FOREIGN KEY ("A") REFERENCES "Envase" ("ID_Envase") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EnvaseToSucursal_B_fkey" FOREIGN KEY ("B") REFERENCES "Sucursal" ("ID_Sucursal") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_SaborToSucursal" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SaborToSucursal_A_fkey" FOREIGN KEY ("A") REFERENCES "Sabor" ("ID_SABOR") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SaborToSucursal_B_fkey" FOREIGN KEY ("B") REFERENCES "Sucursal" ("ID_Sucursal") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_EnvaseToSucursal_AB_unique" ON "_EnvaseToSucursal"("A", "B");

-- CreateIndex
CREATE INDEX "_EnvaseToSucursal_B_index" ON "_EnvaseToSucursal"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SaborToSucursal_AB_unique" ON "_SaborToSucursal"("A", "B");

-- CreateIndex
CREATE INDEX "_SaborToSucursal_B_index" ON "_SaborToSucursal"("B");

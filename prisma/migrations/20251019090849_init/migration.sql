/*
  Warnings:

  - A unique constraint covering the columns `[tipoEnvase]` on the table `Envase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tipoSabor]` on the table `Sabor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mail]` on the table `Sucursal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Envase_tipoEnvase_key" ON "Envase"("tipoEnvase");

-- CreateIndex
CREATE UNIQUE INDEX "Sabor_tipoSabor_key" ON "Sabor"("tipoSabor");

-- CreateIndex
CREATE UNIQUE INDEX "Sucursal_mail_key" ON "Sucursal"("mail");

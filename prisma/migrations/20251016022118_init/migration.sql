-- CreateTable
CREATE TABLE "Usuario" (
    "ID_Usuario" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT,
    "mail" TEXT,
    "contrasena" TEXT
);

-- CreateTable
CREATE TABLE "Sucursal" (
    "ID_Sucursal" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT,
    "mail" TEXT,
    "contrasena" TEXT,
    "urlImagen" TEXT,
    "domicilio" TEXT
);

-- CreateTable
CREATE TABLE "Orden" (
    "ID_Pedido" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME,
    "estadoTerminado" BOOLEAN NOT NULL DEFAULT false,
    "usuarioId" TEXT NOT NULL,
    "sucursalId" TEXT NOT NULL,
    CONSTRAINT "Orden_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("ID_Usuario") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Orden_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal" ("ID_Sucursal") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Envase" (
    "ID_Envase" TEXT NOT NULL PRIMARY KEY,
    "tipoEnvase" TEXT NOT NULL,
    "maxCantSabores" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Sabor" (
    "ID_SABOR" TEXT NOT NULL PRIMARY KEY,
    "tipoSabor" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ContenidoPedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ordenId" TEXT NOT NULL,
    "envaseId" TEXT NOT NULL,
    "saborId" TEXT NOT NULL,
    CONSTRAINT "ContenidoPedido_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden" ("ID_Pedido") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContenidoPedido_envaseId_fkey" FOREIGN KEY ("envaseId") REFERENCES "Envase" ("ID_Envase") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContenidoPedido_saborId_fkey" FOREIGN KEY ("saborId") REFERENCES "Sabor" ("ID_SABOR") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_mail_key" ON "Usuario"("mail");

-- CreateIndex
CREATE INDEX "ContenidoPedido_ordenId_idx" ON "ContenidoPedido"("ordenId");

-- CreateIndex
CREATE INDEX "ContenidoPedido_envaseId_idx" ON "ContenidoPedido"("envaseId");

-- CreateIndex
CREATE INDEX "ContenidoPedido_saborId_idx" ON "ContenidoPedido"("saborId");

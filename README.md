# APPS_MOV_G7_FTD_BACK

Backend de la app de administración de heladerías (pedidos + stock por sucursal). Node.js + Express 5 + Prisma 6 + SQLite.

Repo hermano del frontend: [`APPS_MOV_G7_FTD`](../APPS_MOV_G7_FTD).

## Requisitos

- Node.js 22+ y npm

## Instalación

1. Instalar dependencias

   ```bash
   npm install
   ```

2. Crear el archivo `.env` en la raíz del proyecto (no se versiona) con:

   ```
   DATABASE_URL="file:./dev.db"
   ```

3. Generar el cliente de Prisma

   ```bash
   npx prisma generate
   ```

4. La base `prisma/dev.db` ya viene commiteada con datos de prueba (usuarios, sucursales, envases, sabores y algunas órdenes), así que no hace falta migrar ni seedear para arrancar. Si igual querés confirmar que las migraciones están al día:

   ```bash
   npx prisma migrate status
   ```

   Si en algún momento necesitás resetear los datos a los del seed original (¡esto borra todo lo que se haya cargado después!):

   ```bash
   npm run seed:manual
   ```

## Correr el servidor

```bash
npm run dev
```

Levanta en `http://localhost:3001` con recarga automática (nodemon). Probar con:

```bash
curl http://localhost:3001/api/health
```

## Build de producción

```bash
npm run build
npm start
```

## Usuarios de prueba (seed)

| Email          | Password | Rol       |
| -------------- | -------- | --------- |
| a1@gmail.com   | aaaaaa   | cliente   |
| s1@gmail.com   | aaaaaa   | sucursal  |

(hay más usuarios/sucursales de ejemplo, ver `prisma/seed.ts`)

## Endpoints principales

- `GET /api/health` — healthcheck
- `POST /api/login` / `POST /api/usuarios/login` — login de cliente o sucursal
- `POST /api/usuarios/registro` — registro de cliente
- `POST /api/sucursales/registro` — registro de sucursal
- `GET /api/sucursales` — listado de sucursales
- `GET /api/sucursales/sucursales/:id/oferta` — envases y sabores que ofrece una sucursal
- `PUT /api/sucursales/sucursales/:id/oferta` — actualizar la oferta de una sucursal
- `GET /api/envases` / `GET /api/sabores` — catálogos generales
- `GET /api/ordenes` / `GET /api/ordenes/:id` — listado y detalle de órdenes
- `POST /api/ordenes` — crear una orden
- `PATCH /api/ordenes/:id/terminar` — marcar una orden como terminada

## Notas

- La conexión a la base es SQLite local (`prisma/dev.db`), no hay servidor de base de datos externo que levantar.
- Si el frontend (Expo) no puede conectarse, revisar que la IP configurada en `app/services/apiConfig.ts` del front apunte a la IP de esta máquina en la red local, y que el puerto sea `3001`.

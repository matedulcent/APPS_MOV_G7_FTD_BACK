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

## Ver/editar los datos en vivo (Prisma Studio)

Para inspeccionar la base mientras la app está en uso (útil para diagnosticar qué se está guardando):

```bash
npx prisma studio
```

Abre `http://localhost:5555`, con una grilla editable por tabla (Usuario, Sucursal, Orden, Envase, Sabor, ContenidoPedido). Podés dejarlo corriendo en otra terminal mientras usás la app normalmente.

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
- `POST /api/login` / `POST /api/usuarios/login` — login de cliente
- `POST /api/sucursales/login` — login de vendedor (sucursal)
- `POST /api/usuarios/registro` — registro de cliente
- `POST /api/sucursales/registro` — registro de sucursal
- `GET /api/sucursales` — listado de sucursales
- `GET /api/sucursales/:id` — datos de una sucursal puntual
- `GET /api/sucursales/:id/oferta` — envases y sabores que ofrece una sucursal
- `PUT /api/sucursales/:id/oferta` — actualizar la oferta de una sucursal
- `GET /api/envases` / `GET /api/sabores` — catálogos generales (cada item trae su `categoria`)
- `POST /api/envases` / `POST /api/sabores` — crear un envase o sabor nuevo en el catálogo global (acepta `categoria`, por defecto "Especiales")
- `GET /api/envases/categorias` / `GET /api/sabores/categorias` — secciones gestionables (p. ej. "Conos", "Cremas")
- `POST /api/envases/categorias` / `POST /api/sabores/categorias` — crear una sección nueva (vacía), body `{ nombre }`
- `DELETE /api/envases/categorias/:nombre` / `DELETE /api/sabores/categorias/:nombre` — borrar una sección (los items pasan a "Especiales"; esa sección no se puede borrar)
- `GET /api/ordenes` (acepta `?sucursalId=`) / `GET /api/ordenes/sucursal/:id` — listado de órdenes, general o filtrado por sucursal
- `GET /api/ordenes/:id` — detalle de una orden
- `POST /api/ordenes` — crear una orden. Body: `{ usuarioId, sucursalId, items: [{ envaseId, saborId, grupo }] }`. `grupo` identifica a qué envase físico del pedido pertenece cada sabor (por ejemplo, dos kilos con gustos distintos en el mismo pedido usan `grupo` 0 y 1 respectivamente) — sin esto, el panel de la sucursal no puede distinguir qué gustos van juntos en cada envase. Si no se manda, cada item queda en su propio grupo (comportamiento previo).
- `PATCH /api/ordenes/:id/terminar` — marcar una orden como terminada

## Notas

- La conexión a la base es SQLite local (`prisma/dev.db`), no hay servidor de base de datos externo que levantar.
- `ContenidoPedido.grupo` (agregado en la migración `add_contenido_pedido_grupo`) agrupa los sabores por envase físico dentro de un mismo pedido. El front arma este número recorriendo los envases seleccionados en `Detalle_Pedido.tsx`; el panel de vendedor y el historial del cliente lo usan (vía `app/services/agruparContenidos.ts`) para mostrar cada envase como una tarjeta separada con un color propio, en vez de una lista plana de sabores.
- Si el frontend (Expo) no puede conectarse, revisar que la IP configurada en `app/services/apiConfig.ts` del front apunte a la IP de esta máquina en la red local, y que el puerto sea `3001`.

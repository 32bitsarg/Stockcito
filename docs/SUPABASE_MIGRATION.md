# Guía de Migración a Supabase (PostgreSQL)

Este documento detalla los pasos para migrar la base de datos de SQLite (local) a Supabase (PostgreSQL).

## 1. Preparar `schema.prisma`

Actualmente el archivo `prisma/schema.prisma` está configurado para SQLite. Para usar Supabase, debes cambiar el proveedor del datasource.

### Cambios Requeridos:

**Archivo:** `prisma/schema.prisma`

Cambia esto:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Por esto:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

> **Nota:** `directUrl` es necesario para migraciones y conexiones directas en entornos serverless/edge como Vercel, aunque en VPS tradicionales (Linux) `DATABASE_URL` (transaction pooler) suele ser suficiente, Supabase recomienda configurar ambos.

## 2. Configurar Variables de Entorno

En tu archivo `.env` (o en la configuración de producción), actualiza las variables de conexión.

**Archivo:** `.env`

```env
# URL del Transaction Pooler (puerto 6543) - Usado para la aplicación
DATABASE_URL="postgres://postgres.xxxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# URL de Conexión Directa (puerto 5432) - Usado para migraciones
DIRECT_URL="postgres://postgres.xxxx:password@aws-0-region.supabase.com:5432/postgres"
```

Obtén estos valores desde el Dashboard de Supabase -> Project Settings -> Database -> Connection Pooling.

## 3. Ejecutar Migración Inicial

Una vez configurado el schema y las variables, inicializa la base de datos en Supabase:

```bash
# Elimina la carpeta de migraciones de SQLite (incompatible)
rm -rf prisma/migrations

# Crea nueva migración inicial para Postgres
npx prisma migrate dev --name init_info_supabase
```

## 4. (Opcional) Migración de Datos JSON

Actualmente los campos JSON (como `permissions`, `settings`) se guardan como `String` en el schema para compatibilidad con SQLite.
PostgreSQL soporta un tipo nativo `Json`. 

Si en el futuro deseas aprovechar esto:
1. Cambia el tipo en `model` de `String` a `Json`.
2. Elimina los `JSON.parse()` y `JSON.stringify()` manuales en el código, ya que Prisma lo manejará automáticamente.

**Por ahora, se recomienda mantenerlos como `String` para minimizar cambios en el código.**

## 5. Verificar Scripts en `package.json`

Asegúrate de que los scripts de build generen el cliente correctamente:
- `"postinstall": "npx prisma generate"` (Ya está configurado)

## 6. Siguientes Pasos

1. Crear proyecto en Supabase.
2. Actualizar `.env`.
3. Actualizar `schema.prisma`.
4. Ejecutar `npx prisma migrate dev`.
5. Verificar conexión y funcionamiento.

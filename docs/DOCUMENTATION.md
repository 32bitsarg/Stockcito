# Stockcito - Documentación Completa

> Sistema de Punto de Venta (POS) e Inventario para PyMEs Argentinas  
> Versión: 2.0.0 | Última actualización: Enero 2026

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Funcionalidades Implementadas](#funcionalidades-implementadas)
   - [Autenticación y Sesiones](#autenticación-y-sesiones)
   - [Multi-tenancy y Organizaciones](#multi-tenancy-y-organizaciones)
   - [Punto de Venta (POS)](#punto-de-venta-pos)
   - [Gestión de Inventario](#gestión-de-inventario)
   - [Gestión de Clientes](#gestión-de-clientes)
   - [Gestión de Proveedores](#gestión-de-proveedores)
   - [Sistema de Descuentos](#sistema-de-descuentos)
   - [Facturación](#facturación)
   - [Reportes y Análisis](#reportes-y-análisis)
   - [Dashboard](#dashboard)
   - [Gestión de Empleados](#gestión-de-empleados)
   - [Caja Registradora](#caja-registradora)
   - [Sistema de Permisos](#sistema-de-permisos)
   - [Sistema de Suscripción](#sistema-de-suscripción)
   - [Modo Kiosko](#modo-kiosko)
   - [PWA y Modo Offline](#pwa-y-modo-offline)
   - [Aplicación de Escritorio](#aplicación-de-escritorio)
5. [Funcionalidades Pendientes](#funcionalidades-pendientes)
6. [Seguridad Implementada](#seguridad-implementada)
7. [Optimizaciones](#optimizaciones)
8. [Configuración del Entorno](#configuración-del-entorno)
9. [Comandos de Desarrollo](#comandos-de-desarrollo)

---

## Descripción General

**Stockcito** es un sistema integral de Punto de Venta (POS) y gestión de inventario diseñado específicamente para pequeñas y medianas empresas en Argentina. Ofrece funcionalidades completas para:

- Gestión de ventas y cobros
- Control de inventario y stock
- Facturación electrónica (compatible con AFIP)
- Gestión de empleados y turnos
- Reportes financieros y de ventas
- Soporte multi-dispositivo (web, PWA, escritorio)

El sistema soporta múltiples métodos de pago incluyendo efectivo, tarjeta, transferencia y MercadoPago, con cálculo automático de IVA según normativa argentina.

---

## Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | Next.js 15 (App Router), React, TailwindCSS, Shadcn/UI |
| **Backend** | Next.js Server Actions, API Routes |
| **Base de Datos** | SQLite con Prisma ORM |
| **Autenticación** | JWT con cookies HTTP-only |
| **Pagos** | MercadoPago SDK |
| **Email** | Nodemailer con SMTP (Hostinger) |
| **Escritorio** | Electron (Linux - AppImage/DEB) |
| **PWA** | Service Worker personalizado |
| **Cálculos Monetarios** | Decimal.js |
| **Hashing** | Argon2 (con fallback a bcrypt) |

---

## Arquitectura del Proyecto

```
stockcito/
├── actions/              # Server Actions (lógica de negocio)
│   ├── auth-actions.ts           # Registro, login, sesiones
│   ├── sale-actions.ts           # Operaciones de POS
│   ├── product-actions.ts        # CRUD de inventario
│   ├── category-actions.ts       # Gestión de categorías
│   ├── client-actions.ts         # Gestión de clientes
│   ├── supplier-actions.ts       # Gestión de proveedores
│   ├── discount-actions.ts       # Sistema de descuentos
│   ├── invoice-actions.ts        # Facturación
│   ├── report-actions.ts         # Reportes y analytics
│   ├── dashboard-actions.ts      # Métricas del dashboard
│   ├── employee-actions.ts       # PIN, fichaje, turnos
│   ├── kiosk-actions.ts          # Modo multi-empleado
│   ├── subscription-actions.ts   # Gestión de planes
│   ├── organization-actions.ts   # Configuración de negocio
│   ├── payment-actions.ts        # Procesamiento de pagos
│   ├── export-actions.ts         # Exportación de datos
│   └── sales-history-actions.ts  # Historial de ventas
│
├── app/                  # Next.js App Router
│   ├── (auth)/                   # Páginas públicas
│   │   ├── login/                # Inicio de sesión
│   │   └── register/             # Registro de cuenta
│   ├── (dashboard)/              # Páginas protegidas
│   │   ├── dashboard/            # Panel principal
│   │   ├── sales/                # Punto de venta
│   │   ├── inventory/            # Gestión de productos
│   │   ├── categories/           # Categorías
│   │   ├── clients/              # Clientes
│   │   ├── suppliers/            # Proveedores (Premium)
│   │   ├── discounts/            # Descuentos
│   │   ├── reports/              # Reportes
│   │   ├── users/                # Gestión de usuarios
│   │   ├── profile/              # Perfil de usuario
│   │   └── subscription/         # Plan y facturación
│   ├── api/                      # API Routes
│   │   ├── verify-email/         # Verificación de email
│   │   └── webhooks/             # Webhooks (MercadoPago)
│   ├── kiosk/                    # Modo kiosko
│   ├── offline/                  # Página offline PWA
│   ├── setup/                    # Configuración inicial
│   └── docs/                     # Documentación
│
├── components/           # Componentes React
│   ├── auth/                     # Formularios de auth
│   ├── sales/                    # Interfaz de POS
│   ├── inventory/                # Gestión de productos
│   ├── categories/               # Formularios de categorías
│   ├── clients/                  # Gestión de clientes
│   ├── suppliers/                # Gestión de proveedores
│   ├── discounts/                # Sistema de descuentos
│   ├── employees/                # Gestión de empleados
│   ├── reports/                  # Visualización de reportes
│   ├── dashboard/                # Widgets del dashboard
│   ├── subscription/             # Feature gates, uso
│   ├── layout/                   # Navegación, sidebar
│   ├── landing/                  # Landing page marketing
│   ├── profile/                  # Configuración de perfil
│   ├── pwa/                      # Instalación PWA
│   ├── shortcuts/                # Atajos de teclado
│   ├── help/                     # Centro de ayuda
│   └── ui/                       # Componentes Shadcn/UI
│
├── lib/                  # Utilidades compartidas
│   ├── auth.ts                   # Helpers de autenticación
│   ├── db.ts                     # Cliente Prisma
│   ├── permissions.ts            # Control de acceso (RBAC)
│   ├── schemas.ts                # Validación Zod
│   ├── money.ts                  # Cálculos monetarios
│   ├── tax-calculator.ts         # Cálculo de IVA
│   ├── business-code.ts          # Códigos de negocio
│   ├── email.ts                  # Envío de emails
│   ├── jwt.ts                    # Tokens JWT
│   ├── password.ts               # Hashing de contraseñas
│   ├── utils.ts                  # Utilidades generales
│   ├── security/                 # Módulo de seguridad
│   │   ├── rate-limiter.ts       # Limitador de peticiones
│   │   └── sanitize.ts           # Sanitización de inputs
│   ├── subscription/             # Sistema de suscripción
│   │   └── plans.ts              # Definición de planes
│   └── payments/                 # Integración de pagos
│       └── mercadopago.ts        # SDK MercadoPago
│
├── prisma/               # Base de datos
│   ├── schema.prisma             # Esquema de BD
│   ├── seed.ts                   # Datos iniciales
│   └── migrations/               # Migraciones
│
├── electron/             # App de escritorio
│   └── main.js                   # Proceso principal
│
├── public/               # Assets públicos
│   ├── manifest.json             # Manifest PWA
│   ├── sw.js                     # Service Worker
│   └── icons/                    # Iconos de la app
│
└── scripts/              # Scripts de build
    ├── build-electron.sh         # Build Electron
    └── build-linux.sh            # Build Linux
```

---

## Funcionalidades Implementadas

### Autenticación y Sesiones

**Archivo principal:** `actions/auth-actions.ts`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Registro de usuarios | ✅ | Creación de cuenta con email y contraseña |
| Login con email/contraseña | ✅ | Autenticación tradicional |
| Sesiones JWT | ✅ | Tokens con expiración de 7 días |
| Cookies HTTP-only | ✅ | Almacenamiento seguro de sesión |
| Verificación de email | ✅ | Tokens de 24 horas, reenvío disponible |
| Cierre de sesión | ✅ | Invalidación de cookie |
| Rate limiting en login | ✅ | 5 intentos cada 15 minutos |
| Rate limiting en registro | ✅ | 3 registros por hora por IP |

### Multi-tenancy y Organizaciones

**Archivos:** `actions/organization-actions.ts`, `lib/business-code.ts`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Registro de negocio | ✅ | Nombre, dirección, CUIT/CUIL |
| Código de negocio | ✅ | Código único de 6 caracteres para empleados |
| Aislamiento de datos | ✅ | Todas las queries filtran por `organizationId` |
| Configuración de negocio | ✅ | Logo, dirección, datos fiscales |
| Múltiples usuarios por org | ✅ | Hasta 2 (Free) o 10 (Premium) usuarios |

### Punto de Venta (POS)

**Archivo principal:** `actions/sale-actions.ts`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Crear venta | ✅ | Carrito de productos con cantidades |
| Búsqueda de productos | ✅ | Por nombre, SKU, código de barras |
| Múltiples métodos de pago | ✅ | Efectivo, tarjeta, transferencia, MercadoPago |
| Pagos mixtos | ✅ | Combinar métodos en una venta |
| Cálculo de IVA | ✅ | Por producto (21% por defecto) |
| Aplicar descuentos | ✅ | Porcentaje o monto fijo |
| Descuentos por cliente | ✅ | Descuentos personalizados |
| Anular ventas | ✅ | Con autorización de manager |
| Reembolsos | ✅ | Parciales o totales |
| Notas de crédito | ✅ | Generación automática en reembolsos |
| Cambio calculado | ✅ | Para pagos en efectivo |
| Historial de ventas | ✅ | Con filtros por fecha, cliente, método |

### Gestión de Inventario

**Archivo principal:** `actions/product-actions.ts`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| CRUD de productos | ✅ | Crear, leer, actualizar, eliminar |
| Categorías | ✅ | Organización jerárquica |
| SKU/Código de barras | ✅ | Identificadores únicos |
| Control de stock | ✅ | Cantidad actual y mínima |
| Alertas de stock bajo | ✅ | Notificación cuando stock < mínimo |
| Precio de costo | ✅ | Para cálculo de margen |
| Precio de venta | ✅ | Con o sin IVA incluido |
| Tasa de IVA por producto | ✅ | Configurable (0%, 10.5%, 21%, 27%) |
| Productos activos/inactivos | ✅ | Deshabilitar sin eliminar |
| Importación masiva | ✅ | CSV (Premium) |
| Límite de productos | ✅ | 500 (Free) / Ilimitado (Premium) |

### Gestión de Clientes

**Archivo principal:** `actions/client-actions.ts`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| CRUD de clientes | ✅ | Crear, leer, actualizar, eliminar |
| Datos fiscales | ✅ | CUIT/CUIL/DNI |
| Datos de contacto | ✅ | Email, teléfono, dirección |
| Historial de compras | ✅ | Ventas asociadas al cliente |
| Descuentos por cliente | ✅ | Porcentaje fijo |
| Límite de clientes | ✅ | 100 (Free) / Ilimitado (Premium) |
| Búsqueda de clientes | ✅ | Por nombre, email, documento |

### Gestión de Proveedores

**Archivo principal:** `actions/supplier-actions.ts`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| CRUD de proveedores | ✅ | **Solo Premium** |
| Datos de contacto | ✅ | Nombre, email, teléfono |
| Asociación con productos | ✅ | Proveedor por producto |
| Notas y observaciones | ✅ | Campo libre de texto |

### Sistema de Descuentos

**Archivo principal:** `actions/discount-actions.ts`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Descuentos porcentuales | ✅ | Ej: 10% de descuento |
| Descuentos de monto fijo | ✅ | Ej: $500 de descuento |
| Fechas de vigencia | ✅ | Fecha inicio y fin |
| Por categoría | ✅ | Aplicar a categorías específicas |
| Compra mínima | ✅ | Monto mínimo requerido |
| Código de descuento | ✅ | Cupones canjeables |
| Descuentos activos/inactivos | ✅ | Control de estado |

### Facturación

**Archivo principal:** `actions/invoice-actions.ts`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Generación de facturas | ✅ | A partir de ventas |
| Tipos de comprobante | ✅ | A, B, C (estándar AFIP) |
| Campos CAE | ✅ | Código de Autorización Electrónico |
| Notas de crédito | ✅ | Para anulaciones/reembolsos |
| Exportar PDF | ✅ | **Solo Premium** |
| Límite mensual | ✅ | 50 (Free) / Ilimitado (Premium) |
| Numeración correlativa | ✅ | Por punto de venta |

### Reportes y Análisis

**Archivo principal:** `actions/report-actions.ts`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Reporte de ventas | ✅ | Por período, producto, categoría |
| Reporte financiero | ✅ | Ingresos, costos, márgenes |
| Reporte de inventario | ✅ | Stock actual, movimientos |
| Reporte de empleados | ✅ | Ventas por empleado, horas |
| Selección de período | ✅ | Diario, semanal, mensual, personalizado |
| Historial de reportes | ✅ | 7 días (Free) / Ilimitado (Premium) |
| Exportar Excel | ✅ | **Solo Premium** |
| Reportes avanzados | ✅ | **Solo Premium** |

### Dashboard

**Archivo principal:** `actions/dashboard-actions.ts`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Ventas del día | ✅ | Total y cantidad |
| Ventas del mes | ✅ | Comparativa con mes anterior |
| Ingresos totales | ✅ | Por período seleccionado |
| Gráfico de ventas | ✅ | Tendencia temporal |
| Productos más vendidos | ✅ | Top 5/10 productos |
| Alertas de stock bajo | ✅ | Productos por reabastecer |
| Actividad reciente | ✅ | Últimas ventas y movimientos |

### Gestión de Empleados

**Archivo principal:** `actions/employee-actions.ts`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Crear empleados | ✅ | Con rol asignado |
| PIN de acceso | ✅ | 4-6 dígitos para acceso rápido |
| Fichaje (clock in/out) | ✅ | Registro de entrada/salida |
| Registro de descansos | ✅ | Pausas durante el turno |
| Cálculo de horas | ✅ | Total trabajado, horas extra |
| Tracking de ubicación | ✅ | IP/ubicación en fichaje |
| Override de manager | ✅ | Autorización para acciones protegidas |
| Historial de entradas | ✅ | TimeEntry por empleado |

### Caja Registradora

**Modelos Prisma:** `CashDrawer`, `Shift`, `CashMovement`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Apertura de caja | ✅ | Con monto inicial |
| Cierre de caja | ✅ | Arqueo final |
| Movimientos de efectivo | ✅ | Entradas y salidas manuales |
| Turnos de caja | ✅ | Asociados a empleado |
| Monto esperado vs real | ✅ | Cálculo de diferencia |
| Notas en movimientos | ✅ | Justificación de ajustes |

### Sistema de Permisos

**Archivo principal:** `lib/permissions.ts`

#### Roles Predefinidos

| Rol | Descripción | Nivel de Acceso |
|-----|-------------|-----------------|
| **Owner** | Dueño del negocio | Acceso total incluyendo facturación |
| **Admin** | Administrador | Acceso total excepto facturación de suscripción |
| **Manager** | Encargado/Supervisor | Supervisión, overrides, reportes, turnos (máx 50% descuento) |
| **Cashier** | Cajero | Ventas, pagos, caja (máx 15% descuento) |
| **Waiter** | Mesero | Toma de pedidos, mesas (modo restaurante) |
| **Viewer** | Solo lectura | Visualización sin modificaciones |

#### Módulos de Permisos

| Módulo | Permisos Disponibles |
|--------|---------------------|
| **Ventas** | Ver, crear, editar, anular, reembolsar |
| **Inventario** | Ver, crear, editar, eliminar, ajustar stock |
| **Clientes** | Ver, crear, editar, eliminar |
| **Caja** | Ver, abrir, cerrar, movimientos |
| **Reportes** | Ver básicos, ver avanzados, exportar |
| **Usuarios** | Ver, crear, editar, eliminar |
| **Configuración** | Ver, modificar |
| **POS** | Acceso al punto de venta |

### Sistema de Suscripción

**Archivos:** `lib/subscription/plans.ts`, `actions/subscription-actions.ts`

#### Planes Disponibles

| Característica | Plan Free | Plan Premium |
|----------------|-----------|--------------|
| **Precio** | $0 ARS | $4,999 ARS/mes o $49,990 ARS/año |
| **Productos** | 500 máximo | Ilimitados |
| **Clientes** | 100 máximo | Ilimitados |
| **Usuarios** | 2 máximo | 10 máximo |
| **Facturas/mes** | 50 máximo | Ilimitadas |
| **Historial reportes** | 7 días | Ilimitado |
| **Proveedores** | ❌ | ✅ |
| **Exportar PDF/Excel** | ❌ | ✅ |
| **Reportes avanzados** | ❌ | ✅ |
| **Operaciones masivas** | ❌ | ✅ |
| **Audit logs completos** | ❌ | ✅ |
| **Alertas** | ❌ | ✅ |
| **Tema personalizado** | ❌ | ✅ |
| **Acceso API** | ❌ | ✅ |

#### Período de Prueba
- **Duración:** 7 días de trial Premium
- **Período de gracia:** 7 días adicionales para modo offline/Electron

### Modo Kiosko

**Archivos:** `actions/kiosk-actions.ts`, `app/kiosk/page.tsx`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Selección de empleado | ✅ | Lista de empleados activos |
| Login con PIN | ✅ | Acceso rápido sin email |
| Cambio de usuario | ✅ | Sin cerrar la app |
| Dispositivo compartido | ✅ | Múltiples empleados, un dispositivo |

### PWA y Modo Offline

**Archivos:** `public/sw.js`, `public/manifest.json`, `app/offline/page.tsx`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Service Worker | ✅ | Cache de assets estáticos |
| Manifest PWA | ✅ | Instalable en dispositivos |
| Página offline | ✅ | Fallback cuando sin conexión |
| Prompt de instalación | ✅ | Sugerencia para instalar |
| Notificación de actualización | ✅ | Aviso de nueva versión |
| Iconos de app | ✅ | Múltiples resoluciones |

### Aplicación de Escritorio

**Archivos:** `electron/main.js`, `scripts/build-linux.sh`

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Build Linux | ✅ | AppImage y DEB |
| Servidor embebido | ✅ | Next.js standalone bundled |
| Auto-inicio | ✅ | Configurable |
| Integración sistema | ✅ | Bandeja del sistema, notificaciones |

---

## Funcionalidades Pendientes

Las siguientes funcionalidades tienen estructura parcial o están preparadas pero no completamente implementadas:

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| **Kitchen Display (Cocina)** | 🔶 Parcial | Esquema existe, permisos definidos (`KITCHEN_VIEW`, `KITCHEN_UPDATE`), falta componente dedicado |
| **Gestión de Mesas** | 🔶 Parcial | Permisos definidos (`TABLES_VIEW`, `TABLES_MANAGE`), para modo restaurante |
| **API Pública** | 🔶 Parcial | Feature flag en Premium, pero no hay endpoints REST/GraphQL expuestos |
| **Sistema de Alertas** | 🔶 Parcial | Feature en Premium, implementación incompleta |
| **Temas Personalizados** | 🔶 Parcial | Campo `theme` en Organization, solo temas por defecto disponibles |
| **Integraciones Externas** | 🔶 Parcial | Permiso `INTEGRATIONS_MANAGE` existe, sin integraciones implementadas |
| **Sincronización Offline** | 🔶 Parcial | PWA funciona offline, pero no sincroniza datos pendientes |
| **Build Windows/Mac** | ❌ Pendiente | Solo Linux soportado actualmente |
| **Facturación AFIP real** | 🔶 Parcial | Campos CAE existen, falta integración con webservices AFIP |
| **Notificaciones Push** | ❌ Pendiente | No implementado |
| **Backup automático** | ❌ Pendiente | No implementado |

### Leyenda
- ✅ Implementado completamente
- 🔶 Parcialmente implementado / Estructura existe
- ❌ No implementado

---

## Seguridad Implementada

### Rate Limiting

**Archivo:** `lib/security/rate-limiter.ts`

Sistema de limitación de peticiones en memoria (compatible con Electron sin dependencias externas).

| Endpoint/Acción | Límite | Ventana |
|-----------------|--------|---------|
| Login | 5 intentos | 15 minutos |
| Registro | 3 registros | 1 hora |
| Reset de contraseña | 3 solicitudes | 1 hora |
| API general | 100 peticiones | 1 hora |

**Características:**
- Basado en IP del cliente
- Limpieza automática de entradas expiradas
- Respuestas con headers `X-RateLimit-*`
- Bloqueo temporal tras exceder límite

### Sanitización de Inputs

**Archivo:** `lib/security/sanitize.ts`

| Función | Descripción |
|---------|-------------|
| `stripHtml()` | Elimina tags HTML para prevenir XSS |
| `escapeSqlLike()` | Escapa caracteres especiales en queries LIKE |
| `sanitizeFilename()` | Limpia nombres de archivo para prevenir path traversal |
| `validateUrl()` | Valida formato de URLs |
| `validateEmail()` | Valida formato de emails |
| `validatePhone()` | Valida formato de teléfonos |

### Hashing de Contraseñas

**Archivo:** `lib/password.ts`

- **Algoritmo principal:** Argon2id (resistente a ataques GPU)
- **Fallback:** bcrypt (compatibilidad)
- **Configuración:** Memory cost, time cost, parallelism optimizados

### Autenticación JWT

**Archivo:** `lib/jwt.ts`

| Característica | Valor |
|----------------|-------|
| Algoritmo | HS256 |
| Expiración | 7 días |
| Almacenamiento | Cookie HTTP-only |
| Flags | Secure (producción), SameSite: Lax |

### Aislamiento Multi-tenant

Todas las queries a la base de datos incluyen filtro por `organizationId`:

```prisma
// Ejemplo de query aislada
const products = await prisma.product.findMany({
  where: {
    organizationId: session.organizationId,
    // ... otros filtros
  }
})
```

**Validación adicional:**
- Verificación de pertenencia en cada acción
- Tokens incluyen `organizationId` encriptado
- No es posible acceder a datos de otra organización

### Audit Logging

**Modelo Prisma:** `AuditLog`

Todas las acciones críticas se registran con:

| Campo | Descripción |
|-------|-------------|
| `action` | Tipo de acción (CREATE, UPDATE, DELETE, etc.) |
| `entity` | Entidad afectada (Product, Sale, User, etc.) |
| `entityId` | ID del registro afectado |
| `userId` | Usuario que realizó la acción |
| `organizationId` | Organización |
| `ipAddress` | IP del cliente |
| `userAgent` | Navegador/cliente |
| `details` | JSON con datos adicionales |
| `createdAt` | Timestamp |

**Acciones registradas:**
- Login/logout
- Cambios de contraseña
- CRUD de productos, clientes, usuarios
- Ventas y anulaciones
- Cambios de permisos
- Movimientos de caja

### Verificación de Email

**Archivo:** `lib/email.ts`

- Tokens de verificación con expiración de 24 horas
- Reenvío disponible con rate limiting
- Email de bienvenida tras verificación
- Bloqueo de funcionalidades sensibles sin verificar

### Protección de Acciones Sensibles

| Acción | Requiere |
|--------|----------|
| Anular venta | Override de Manager |
| Modificar precio | Override de Manager (según rol) |
| Eliminar producto | Permiso específico |
| Cerrar caja con diferencia | Justificación obligatoria |
| Cambiar rol de usuario | Rol Admin/Owner |
| Acceder a facturación | Rol Owner únicamente |

---

## Optimizaciones

### Cálculos Monetarios

**Librería:** Decimal.js

```javascript
// Evita errores de punto flotante
import Decimal from 'decimal.js'

const subtotal = new Decimal(price).times(quantity)
const tax = subtotal.times(taxRate).dividedBy(100)
const total = subtotal.plus(tax)
```

**Beneficios:**
- Precisión exacta en operaciones financieras
- Sin errores de redondeo típicos de IEEE 754
- Configuración de precisión ajustable

### Build y Desarrollo

| Optimización | Descripción |
|--------------|-------------|
| **Turbopack** | Habilitado para builds de desarrollo más rápidos |
| **Standalone output** | Next.js standalone para Electron |
| **Lazy loading** | Componentes pesados cargados bajo demanda |

### Base de Datos

| Optimización | Descripción |
|--------------|-------------|
| **Índices** | En `organizationId`, fechas, foreign keys |
| **SQLite WAL** | Write-Ahead Logging para mejor concurrencia |
| **Conexión singleton** | Reutilización de conexión Prisma |

### Cache y Revalidación

```javascript
// Invalidación de cache tras mutaciones
revalidatePath('/dashboard')
revalidatePath('/inventory')
```

**Estrategia:**
- Server Components por defecto (sin cliente JS innecesario)
- `revalidatePath` para invalidación selectiva
- Datos estáticos pre-renderizados cuando es posible

### Rate Limiter en Memoria

**Ventajas del enfoque in-memory:**
- Sin dependencia de Redis/Memcached
- Funciona en Electron sin servicios externos
- Limpieza automática de entradas expiradas
- Bajo overhead de memoria

---

## Configuración del Entorno

### Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET="tu-secreto-seguro-de-32-caracteres-minimo"

# Email (Nodemailer)
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_USER="tu-email@dominio.com"
SMTP_PASS="tu-contraseña"
SMTP_FROM="Stockcito <noreply@dominio.com>"

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN="tu-access-token"
MERCADOPAGO_PUBLIC_KEY="tu-public-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Seed inicial (datos de prueba)
npx prisma db seed

# Abrir Prisma Studio
npx prisma studio
```

---

## Comandos de Desarrollo

### Desarrollo Web

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm start

# Linting
npm run lint
```

### Electron (Escritorio)

```bash
# Build de Electron para Linux
npm run build:electron

# O usando el script directamente
./scripts/build-linux.sh
```

### Prisma

```bash
# Ver datos en navegador
npx prisma studio

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Reset de BD (¡borra todos los datos!)
npx prisma migrate reset
```

---

## Información Adicional

### Soporte de Impuestos (Argentina)

| Tipo | Alícuota |
|------|----------|
| IVA Exento | 0% |
| IVA Reducido | 10.5% |
| IVA General | 21% |
| IVA Incrementado | 27% |

### Tipos de Comprobante AFIP

| Tipo | Uso |
|------|-----|
| **Factura A** | Entre responsables inscriptos |
| **Factura B** | A consumidor final o monotributista |
| **Factura C** | Emitida por monotributista |
| **Nota de Crédito** | Anulaciones y devoluciones |

### Métodos de Pago Soportados

| Método | Integración |
|--------|-------------|
| Efectivo | Nativo |
| Tarjeta de débito | Registro manual |
| Tarjeta de crédito | Registro manual |
| Transferencia | Registro manual |
| MercadoPago | SDK integrado |

---

## Changelog

### v2.0.0 (Enero 2026)
- Sistema completo de POS
- Multi-tenancy con organizaciones
- Sistema de suscripción Free/Premium
- PWA con modo offline
- Aplicación Electron para Linux
- Sistema de permisos RBAC
- Integración MercadoPago
- Facturación con campos AFIP

---

*Documentación generada el 4 de enero de 2026*
*Stockcito v2.0.0 - Sistema POS para PyMEs Argentinas*

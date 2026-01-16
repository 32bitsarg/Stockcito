# Stockcito - Pendientes por Prioridad

> Enfoque actual: Completar features existentes, NO añadir nuevas.  
> Última actualización: 15 de enero de 2026

---

## Tabla de Contenidos

1. [Prioridad ALTA - Seguridad Pre-Producción](#prioridad-alta---seguridad-pre-producción)
2. [Prioridad MEDIA - Features Parciales a Completar](#prioridad-media---features-parciales-a-completar)
3. [Prioridad BAJA - Mejoras Opcionales](#prioridad-baja---mejoras-opcionales)
4. [Completado](#completado)

---

## Prioridad ALTA - Seguridad Pre-Producción

> ⚠️ Estas tareas deben completarse ANTES de lanzar a producción.

### 1. 🟡 Bloqueo de Cuenta por Intentos Fallidos
**Estado:** Pendiente  
**Archivo:** `lib/security/rate-limiter.ts`  
**Riesgo:** Medio - Ataques de fuerza bruta

**Estado actual:** Solo rate limiting por IP, no por cuenta

---

### 2. 🟡 Validar Tamaño y Tipo de Uploads
**Estado:** Pendiente  
**Riesgo:** Medio - Archivos maliciosos

**Implementar:**
- Límite de tamaño (5MB para imágenes)
- Validación de tipo MIME real
- Escaneo básico de archivos

---

### 3. 🔴 Mejorar CSP (Content Security Policy) para Producción
**Estado:** Parcialmente implementado  
**Archivo:** `middleware.ts`  
**Riesgo:** Medio-Alto - XSS

**Estado actual:** CSP implementado pero "relajado" (`unsafe-inline`, `unsafe-eval`) para permitir desarrollo y HMR con Next.js.
**Acción Requerida:** Endurecer la política para entorno de producción (eliminar `unsafe-eval` y usar nonces estrictos).

---

## Prioridad MEDIA - Features Parciales a Completar

> 🔶 Estas features tienen el esquema/permisos pero falta la UI.

### 1. Kitchen Display (Cocina)
**Estado:** ✅ Implementado  
**Archivos creados:**
- `app/(dashboard)/kitchen/page.tsx`
- `components/kitchen/kitchen-header.tsx`
- `components/kitchen/kitchen-order-card.tsx`
- `actions/kitchen-actions.ts`

**Implementado:**
- [x] Crear página `/dashboard/kitchen`
- [x] Componente de visualización de pedidos en tiempo real
- [x] Actualización de estado de pedidos (pendiente → preparando → listo → entregado)
- [x] Auto-refresh cada 10 segundos
- [x] Estadísticas de cocina (tiempo promedio, contadores)
- [x] Toggle condicional via Feature Flags

---

### 2. Gestión de Mesas
**Estado:** ✅ Implementado  
**Archivos creados:**
- `app/(dashboard)/tables/page.tsx` - Página principal con estadísticas
- `actions/table-actions.ts` - CRUD completo + estados + reservas
- `components/tables/table-card.tsx` - Tarjeta visual de mesa
- `components/tables/table-dialog.tsx` - Dialog para crear/editar
- `components/tables/tables-client.tsx` - Cliente interactivo
- `prisma/schema.prisma` - Modelo `Table` agregado

**Implementado:**
- [x] Modelo `Table` en Prisma (number, name, capacity, status, shape, position)
- [x] CRUD completo de mesas
- [x] Estados: libre, ocupada, reservada, limpieza
- [x] Reservas con nombre y hora
- [x] Estadísticas en tiempo real
- [x] Toggle condicional via Feature Flags
- [ ] Componente visual drag & drop para layout (futuro)
- [ ] Asignación de pedidos a mesas (futuro)

---

### 3. Sistema de Alertas Push/Email
**Estado:** ✅ Implementado  
**Archivos creados:**
- `actions/notification-actions.ts`
- `actions/alert-actions.ts`
- `app/(dashboard)/settings/page.tsx`
- `components/settings/notification-settings-form.tsx`
- `components/settings/feature-toggles.tsx`

**Implementado:**
- [x] Modelos `NotificationSetting`, `PushSubscription`, `OrganizationFeatures` en Prisma
- [x] Integrar Web Push API (web-push instalado)
- [x] UI de configuración de alertas por usuario (`/settings`)
- [x] Feature toggles para Kitchen/Mesas por organización
- [x] Funciones de disparo de alertas (stock bajo, ventas altas, etc.)
- [ ] Configurar envío de emails para alertas críticas (nodemailer ready)

---

### 4. Sincronización Offline Mejorada
**Estado:** ✅ Implementado  
**Archivos creados:**
- `components/pwa/offline-status.tsx`

**Implementado:**
- [x] Indicador de estado online/offline en header
- [x] Lista de ventas pendientes de sincronización
- [x] Botón "Sincronizar ahora"
- [x] Endpoint `/api/sales/sync` ya existía

---

### 5. Temas Personalizados
**Estado:** Solo light/dark implementado  
**Campo existe:** En configuración de organización

**Pendiente:**
- [ ] Selector de colores primario/secundario
- [ ] Preview en tiempo real
- [ ] Persistencia en BD

---

### 5. Tests Unitarios Críticos
**Estado:** Sin tests

| Área | Tipo | Prioridad |
|------|------|-----------|
| Auth actions | Unit | Alta |
| Cálculos de IVA | Unit | Alta |
| Permisos RBAC | Unit | Alta |
| Webhooks de pago | Integration | Alta |

---

## Prioridad BAJA - Mejoras Opcionales

> 🟢 Implementar cuando haya tiempo disponible.

### Funcionalidades Futuras
| Funcionalidad | Descripción |
|---------------|-------------|
| Build Windows/macOS | Electron solo soporta Linux actualmente |
| Integración AFIP Real | Campos CAE existen, falta conexión a webservices |
| API Pública REST | Feature flag existe, sin endpoints |
| Múltiples Sucursales | Multi-location dentro de organización |
| Programa de Fidelidad | Puntos/recompensas para clientes |
| Órdenes de Compra | Generar pedidos a proveedores |
| 2FA para Admins | TOTP (Google Authenticator) |
| Backup Automático | Exportar BD periódicamente |

### Optimizaciones Menores
| Mejora | Descripción |
|--------|-------------|
| Compresión de Imágenes | Resize automático, thumbnails, WebP |
| Service Worker Agresivo | Pre-cachear rutas, stale-while-revalidate |
| Bundle Splitting | Separar chunks por ruta |
| Centralizar Schemas Zod | Hay duplicación de validaciones |
| Refactorizar pos-interface.tsx | Componente complejo, extraer sub-componentes |

---

## Completado

### ✅ Sprint 15 de Enero de 2026

#### Seguridad y RBAC (Role-Based Access Control)
- [x] **Seguridad en Descuentos:** Restricción total de `/discounts` para roles no administrativos (UI oculta + protección en Server Actions).
- [x] **Seguridad en Inventario:** Empleados solo tienen acceso de lectura. Botones "Nuevo", "Editar", "Eliminar" ocultos y protegidos en servidor.
- [x] **Protección de Datos:** Botón "Exportar" (Clientes e Inventario) restringido solo a Admins/Owners.
- [x] **Visibilidad de Ventas:** Empleados solo ven su propio historial de ventas. Admins ven todo.
- [x] **Privacidad:** Columna "Costo" oculta para roles no administrativos (via restricción de exportación).
- [x] **Sidebar Dinámico:** Se ocultan enlaces a Reportes, Proveedores y Descuentos para roles no autorizados.

#### Mejoras de UX/Funcionalidad
- [x] **Registro de Vendedor:** Se muestra el nombre del vendedor ("Usuario" o "Sistema") en el historial de ventas.
- [x] **Corrección Decimales:** Solucionados errores de serialización (`Decimal` a `Number`) en historial de ventas.
- [x] **Versión Alpha:** Actualizada nomenclatura de versión a `v0.1` en todo el sitio (Landing, Sidebar, PDFs).

### ✅ Sprint 4-5 de Enero de 2026

#### Seguridad Base
- [x] **CSRF Tokens:** Implementado en login y formularios críticos.
- [x] **Validación de Entorno:** `lib/env.ts` valida variables al inicio.
- [x] **Logger Seguro:** `lib/logger.ts` implementado para sanitizar logs en producción.
- [x] **CSP Middleware:** Implementado (ajustado para desarrollo).
- [x] Webhook MercadoPago con verificación HMAC
- [x] Rate limiter persistente (Redis/Upstash)
- [x] IDs únicos en carrito (crypto.randomUUID)
- [x] Verificación real de estado de pago

#### Rendimiento y Otros
- [x] Cache de queries frecuentes (unstable_cache + memoria)
- [x] Paginación server-side (products, clients, sales)
- [x] Queries dashboard optimizadas (Promise.all)
- [x] Sincronización offline de ventas
- [x] Refactorización masiva de Server Actions (`/actions/auth`, `/actions/sale`, etc.)

---

## Checklist Pre-Producción Actualizado

### Seguridad
- [x] Webhook MercadoPago con verificación HMAC
- [x] Rate limiter persistente (Redis)
- [x] IDs únicos en carrito
- [x] Verificación real de estado de pago
- [x] **CSRF tokens en formularios**
- [x] **Console.error sanitizados**
- [x] **Variables de entorno validadas**
- [ ] **CSP estricto (sin unsafe-inline)** (Pendiente para prod)
- [ ] HTTPS obligatorio (HSTS)
- [ ] Bloqueo por intentos fallidos
- [ ] Validación estricta de uploads

### Funcionalidad
- [x] Sincronización offline
- [x] Paginación server-side
- [x] Cache implementado
- [x] Código modularizado
- [x] **RBAC completo en módulos críticos**
- [ ] Tests unitarios críticos

---
*Documento actualizado el 15 de enero de 2026*


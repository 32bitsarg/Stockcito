# TODO Fixes - Sprint 20 Enero 2026

> Rama de trabajo: `fix/pending-todos-and-mocks`

---

## 🔴 Crítico (Pre-Producción)

### 1. ✅ Método de Pago Real desde MercadoPago
- [x] **Archivo:** `app/(dashboard)/settings/page.tsx`
- [x] **Problema:** Mock de método de pago, no se obtiene de MercadoPago
- [x] **Solución:** Implementar fetch real usando la API de MercadoPago
- **Estado:** ✅ Completado
- **Cambios realizados:**
  - `lib/payments/mercadopago.ts`: Agregadas funciones `getSubscriptionInfo`, `searchSubscriptionByEmail`, `getPaymentMethodFromSubscription`
  - `actions/payment-actions.ts`: Agregada función `getPaymentMethod()`
  - `app/(dashboard)/settings/page.tsx`: Reemplazado mock por llamada real

### 2. Validar Tamaño y Tipo de Uploads
- [ ] **Archivo:** Por definir
- [ ] **Problema:** No hay validación de archivos
- [ ] **Solución:** Límite 5MB, validación MIME real
- **Estado:** ⏳ Pendiente

### 3. Bloqueo de Cuenta por Intentos Fallidos
- [ ] **Archivo:** `lib/security/rate-limiter.ts`
- [ ] **Problema:** Solo rate limiting por IP, no por cuenta
- [ ] **Solución:** Agregar bloqueo por email/cuenta
- **Estado:** ⏳ Pendiente

---

## 🟡 Mocks/Simulaciones a Reemplazar

### 4. ✅ Billing Settings - Datos Reales
- [x] **Archivo:** `components/settings/billing-settings.tsx`
- [x] **Problema:** Placeholders de tarjeta y vencimiento
- [x] **Solución:** Mostrar datos reales del método de pago
- **Estado:** ✅ Completado
- **Cambios realizados:**
  - `lib/payments/mercadopago.ts`: Agregada función `getLastPaymentDetails()` que busca los últimos pagos para obtener datos de tarjeta (últimos 4 dígitos, vencimiento, marca)
  - `actions/payment-actions.ts`: Actualizada `getPaymentMethod()` para incluir `expirationMonth` y `expirationYear`
  - `components/settings/billing-settings.tsx`: Actualizado para mostrar datos reales o fallback "Método de pago activo"
  - `app/(dashboard)/settings/page.tsx`: Actualizado para pasar los nuevos campos

### 5. ✅ Subscription Success - Verificación Real
- [x] **Archivo:** `app/(dashboard)/subscription/success/page.tsx`
- [x] **Problema:** Delay simulado en verificación
- [x] **Solución:** Verificar estado real de suscripción
- **Estado:** ✅ Completado
- **Cambios realizados:**
  - `actions/payment-actions.ts`: Agregada función `verifySubscriptionPayment()` que verifica el pago con MercadoPago
  - `app/(dashboard)/subscription/success/page.tsx`: Reescrito completamente para:
    - Llamar a la verificación real del pago
    - Manejar estados: loading, success, pending, error
    - Auto-reintentar en caso de estado pendiente (hasta 3 veces)
    - Mostrar confetti solo cuando el pago está realmente aprobado

---

## 🟢 Código Pendiente (TODOs)

### 6. ✅ Kitchen Actions - Table Name
- [x] **Archivo:** `actions/kitchen-actions.ts:106`
- [x] **Problema:** `tableName: undefined // TODO`
- [x] **Solución:** Integrar sistema de mesas con cocina
- **Estado:** ✅ Completado
- **Cambios realizados:**
  - `prisma/schema.prisma`: Agregado campo `tableId` al modelo `Sale` con índice
  - `lib/schemas.ts`: Actualizado `saleSchema` para aceptar `tableId`
  - `actions/kitchen-actions.ts`: Ahora obtiene info de mesa y construye `tableName` dinámicamente
  - `actions/sale/create-sale-actions.ts`: Al crear venta con mesa, marca la mesa como "occupied"
  - `components/sales/table-selector.tsx`: Nuevo componente visual para seleccionar mesa en POS
  - `components/sales/pos-interface.tsx`: Integrado selector de mesa (solo visible si `tableManagement` está activo)
  - `app/(dashboard)/sales/new/page.tsx`: Pasa features y mesas al componente POS
  - Nueva migración: `20260120111433_add_table_id_to_sale`

### 7. Logger - External Service
- [ ] **Archivo:** `lib/logger.ts:30`
- [x] **Problema:** `// TODO: Implement external logging service`
- [x] **Solución:** Integrar servicio externo (Appwrite)
- **Estado:** ✅ Completado
- **Cambios realizados:**
  - `lib/appwrite/client.ts`: Cliente de Appwrite para operaciones del servidor
  - `lib/appwrite/logging.ts`: Servicio de logging con cola de reintentos
  - `lib/appwrite/index.ts`: Barrel file
  - `lib/logger.ts`: Integrado con Appwrite, envía logs cuando está configurado
  - `scripts/setup-appwrite.ts`: Script para crear database y collection automáticamente
  - `.env.example`: Agregadas variables de Appwrite
  - Instalado `node-appwrite` SDK

---

## 📚 Documentación

### 8. Actualizar DOCUMENTATION.md
- [ ] Sincronizar versión (v0.1 vs 2.0.0)
- [ ] Actualizar fechas
- [ ] Corregir estado de sincronización offline
- **Estado:** ⏳ Pendiente

---

## Progreso

| Total | Completados | En Progreso | Pendientes |
|-------|-------------|-------------|------------|
| 8     | 5           | 0           | 3          |

---

*Última actualización: 20 de enero de 2026*


# Restructuración del Sistema de Suscripciones

## Resumen de Cambios
Se implementó un sistema de 3 niveles de planes de suscripción con límites más restrictivos para el plan Free.

---

## 📊 Nueva Estructura de Planes

### Plan Free (Gratis)
**Ideal para:** Probar el sistema antes de comprometerse.

| Límite | Valor |
|--------|-------|
| Productos | 25 |
| Clientes | 10 |
| Usuarios | 1 (solo el dueño) |
| Proveedores | 0 (sin acceso) |
| Facturas/mes | 20 |
| Notas de crédito/mes | 5 |
| Historial de reportes | 24 horas |

**Funciones deshabilitadas:**
- ❌ Gestión de proveedores
- ❌ Exportación PDF/Excel
- ❌ Reportes avanzados
- ❌ Alertas automáticas
- ❌ Temas personalizados
- ❌ Soporte prioritario

---

### Plan Emprendedor ($15,000 ARS/mes)
**Ideal para:** Negocios unipersonales y emprendimientos.

| Límite | Valor |
|--------|-------|
| Productos | 300 |
| Clientes | 200 |
| Usuarios | 2 (dueño + 1 empleado/socio) |
| Proveedores | 10 |
| Facturas/mes | 200 |
| Notas de crédito/mes | 50 |
| Historial de reportes | 30 días |

**Funciones habilitadas:**
- ✅ Gestión de proveedores (hasta 10)
- ✅ Exportación PDF
- ✅ Exportación Excel
- ❌ Reportes avanzados
- ❌ Alertas automáticas
- ❌ Auditoría completa
- ❌ Temas personalizados
- ❌ Soporte prioritario

---

### Plan Pyme ($30,000 ARS/mes)
**Ideal para:** Negocios establecidos y equipos.

| Límite | Valor |
|--------|-------|
| Productos | Ilimitados |
| Clientes | Ilimitados |
| Usuarios | Ilimitados |
| Proveedores | Ilimitados |
| Facturas/mes | Ilimitadas |
| Notas de crédito/mes | Ilimitadas |
| Historial de reportes | Completo |

**Todas las funciones habilitadas:**
- ✅ Gestión de proveedores ilimitados
- ✅ Exportación PDF/Excel
- ✅ Reportes avanzados completos
- ✅ Alertas automáticas
- ✅ Auditoría completa
- ✅ Operaciones masivas
- ✅ Temas personalizados
- ✅ Soporte prioritario
- ✅ Acceso API

---

## 📝 Archivos Modificados

### Definición de Planes
- `lib/subscription/plans.ts` - Nueva estructura de 3 planes con límites actualizados

### Tracking de Uso
- `lib/subscription/usage-tracker.ts` - Agregado soporte para límite de proveedores

### Servicio de Suscripción
- `lib/subscription/subscription-service.ts` - Soporte para plan "entrepreneur"

### Pagos
- `lib/payments/mercadopago.ts` - Precios dinámicos según plan objetivo
- `actions/payment-actions.ts` - Determinación de plan basado en monto de pago

### Actions con Límites
- `actions/auth/user-management-actions.ts` - Validación de límite de usuarios
- `actions/supplier-actions.ts` - Validación de acceso a proveedores y límite

### UI/Componentes
- `components/subscription/plan-comparison.tsx` - Tabla comparativa de 3 planes
- `components/landing/pricing.tsx` - Precios en landing con 3 planes
- `components/layout/sidebar.tsx` - Badge de plan para los 3 niveles

### Páginas
- `app/(dashboard)/subscription/page.tsx` - Mostrar nombre correcto del plan
- `app/(dashboard)/subscription/upgrade/page.tsx` - Página de upgrade con 3 opciones

---

## ✅ Límites Aplicados Correctamente

| Recurso | Validación | Archivo |
|---------|-----------|---------|
| Productos | ✅ | `actions/product-actions.ts` |
| Clientes | ✅ | `actions/client-actions.ts` |
| Usuarios | ✅ (NUEVO) | `actions/auth/user-management-actions.ts` |
| Proveedores | ✅ (NUEVO) | `actions/supplier-actions.ts` |
| Facturas | ✅ | `actions/invoice-actions.ts` |
| Notas de crédito | ✅ | `actions/credit-note-actions.ts` |
| Exportación PDF | ✅ | `actions/invoice-actions.ts` |
| Exportación Excel | ✅ | `actions/export-actions.ts` |

---

## 🔄 Precio Anual

| Plan | Mensual | Anual | Ahorro |
|------|---------|-------|--------|
| Free | $0 | $0 | - |
| Emprendedor | $15,000 | $150,000 | 2 meses gratis |
| Pyme | $30,000 | $300,000 | 2 meses gratis |

---

## 📌 Notas Adicionales

1. **Trial de 7 días**: Los nuevos usuarios obtienen acceso completo al plan Pyme durante 7 días.

2. **Degradación automática**: Si un usuario no paga, pasa automáticamente al plan Free y sus datos se conservan.

3. **Límites suaves**: Si el usuario excede los límites después de bajar de plan, sus datos no se borran, pero no puede crear nuevos registros hasta que elimine algunos o suba de plan.

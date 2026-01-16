# Stockcito v0.1 - Resumen de Funcionalidades

> Última actualización: 15 de enero de 2026

---

## ✅ Funciones IMPLEMENTADAS y Funcionando

### 🔐 Autenticación y Seguridad
| Función | Estado | Notas |
|---------|--------|-------|
| Login con email/password | ✅ Completo | Con CSRF + Rate Limiting |
| Login con PIN (empleados) | ✅ Completo | Código de negocio + PIN |
| Registro de organizaciones | ✅ Completo | Con trial de 7 días |
| Roles de usuario | ✅ Completo | Owner, Admin, Manager, Cashier, Waiter, Viewer |
| RBAC (Control de acceso) | ✅ Completo | Permisos por rol en sidebar y acciones |
| Middleware CSP | ✅ Completo | (Relajado para dev) |
| Logger seguro | ✅ Completo | Sanitiza errores en producción |

### 📦 Inventario
| Función | Estado | Notas |
|---------|--------|-------|
| CRUD de Productos | ✅ Completo | Crear, editar, eliminar |
| Categorías | ✅ Completo | Organización por categorías |
| Control de Stock | ✅ Completo | Mínimos, alertas |
| Alertas de Stock Bajo | ✅ Completo | Widgets en dashboard |
| Búsqueda y Filtros | ✅ Completo | Por nombre, SKU |
| Exportación a Excel/CSV | ✅ Completo | Solo para admins |
| Tasa de IVA por producto | ✅ Completo | Campo `taxRate` |

### 🛒 Punto de Venta (POS)
| Función | Estado | Notas |
|---------|--------|-------|
| Interfaz de venta rápida | ✅ Completo | `/sales/new` |
| Búsqueda de productos | ✅ Completo | Autocompletado |
| Carrito/Items de venta | ✅ Completo | Agregar, quitar, cantidades |
| Cálculo de IVA automático | ✅ Completo | Subtotal + IVA |
| Aplicar descuentos | ✅ Completo | Por porcentaje o monto fijo |
| Múltiples métodos de pago | ✅ Completo | Efectivo, Tarjeta, etc. |
| Registro de vendedor | ✅ Completo | `userId` en cada venta |
| Historial de ventas | ✅ Completo | Con filtros y paginación |
| Generación de PDF/Comprobante | ✅ Completo | Solo plan Premium |

### 💵 Caja Registradora
| Función | Estado | Notas |
|---------|--------|-------|
| Apertura/Cierre de caja | ✅ Completo | `/sales/drawer` |
| Registro de movimientos | ✅ Completo | Ingresos, egresos |
| Arqueo de caja | ✅ Completo | |

### 👥 Clientes
| Función | Estado | Notas |
|---------|--------|-------|
| CRUD de Clientes | ✅ Completo | |
| Búsqueda | ✅ Completo | |
| Asociar a ventas | ✅ Completo | |
| Exportación | ✅ Completo | Solo admins |

### 🏢 Proveedores
| Función | Estado | Notas |
|---------|--------|-------|
| CRUD de Proveedores | ✅ Completo | Solo Admin/Manager |

### 🏷️ Descuentos
| Función | Estado | Notas |
|---------|--------|-------|
| CRUD de Descuentos | ✅ Completo | Solo Admin |
| Por porcentaje o monto | ✅ Completo | |
| Vigencia (fechas) | ✅ Completo | |
| Por categoría | ✅ Completo | |
| Aplicar en POS | ✅ Completo | |

### 👤 Gestión de Usuarios (Empleados)
| Función | Estado | Notas |
|---------|--------|-------|
| CRUD de Empleados | ✅ Completo | `/users` |
| Asignar roles | ✅ Completo | |
| PIN de acceso rápido | ✅ Completo | |

### 📊 Dashboard y Reportes
| Función | Estado | Notas |
|---------|--------|-------|
| Métricas del día/mes | ✅ Completo | Ventas, ingresos |
| Top productos vendidos | ✅ Completo | |
| Alertas de stock bajo | ✅ Completo | Widget |
| Gráficos de ventas | ✅ Completo | Recharts |
| Dashboard diferenciado por rol | ✅ Completo | Empleados ven solo sus ventas |

### 💳 Suscripciones / SaaS
| Función | Estado | Notas |
|---------|--------|-------|
| Plan Free vs Premium | ✅ Completo | |
| Límites por plan | ✅ Completo | Productos, facturas/mes |
| Trial de 7 días | ✅ Completo | |
| Integración MercadoPago | ✅ Completo | Webhooks verificados |

### 🌐 PWA / Offline
| Función | Estado | Notas |
|---------|--------|-------|
| Service Worker básico | ✅ Completo | |
| Sincronización offline | ✅ Completo | IndexedDB + Background Sync |

### 🖥️ Electron (Desktop)
| Función | Estado | Notas |
|---------|--------|-------|
| Build para Linux | ✅ Completo | |

---

## 🟡 Funciones PARCIALES o Falta UI

| Función | Estado | Qué falta |
|---------|--------|-----------|
| **Kitchen Display (Cocina)** | 🟡 Esquema existe | Falta página `/dashboard/kitchen`, notificaciones en tiempo real |
| **Gestión de Mesas** | 🟡 Esquema existe | Falta página `/dashboard/tables`, layout visual |
| **Alertas Push/Email** | 🟡 Stock bajo funciona | Falta integrar Web Push API y emails |
| **Temas personalizados** | 🟡 Light/Dark listo | Falta selector de colores custom |
| **Control Horario** | 🟡 Ruta existe | `/users/time` - verificar estado |
| **Auditoría** | 🟡 Ruta existe | `/users/audit` - verificar estado |

---

## 🔴 Funciones PENDIENTES (No implementadas)

| Función | Prioridad | Notas |
|---------|-----------|-------|
| **Tests Unitarios** | Alta | Sin tests actualmente |
| **Bloqueo por intentos fallidos** | Alta | Solo rate limit por IP, no por cuenta |
| **Validación de uploads** | Alta | Tamaño y tipo de archivos |
| **CSP estricto (producción)** | Media | Actualmente relajado para dev |
| **Build Windows/macOS** | Baja | Solo Linux ahora |
| **Integración AFIP real** | Baja | Campos CAE existen, falta webservice |
| **API REST pública** | Baja | Feature flag existe, sin endpoints |
| **Múltiples sucursales** | Baja | Multi-location |
| **Programa de fidelidad** | Baja | Puntos/recompensas |
| **Órdenes de compra** | Baja | A proveedores |
| **2FA para Admins** | Baja | TOTP |
| **Backup automático** | Baja | Export BD periódico |

---

## 📝 Resumen Ejecutivo

- **~85% del MVP está funcional** para un sistema de punto de venta.
- Los módulos **críticos** (POS, Inventario, Usuarios, Pagos) están **completos**.
- Lo que más urge antes de producción: **Tests** y **Seguridad de uploads**.
- Las features de "Cocina" y "Mesas" son para restaurantes y pueden esperar.

---

*Documento generado el 15 de enero de 2026*

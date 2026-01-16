# Guía de Flujos de Trabajo por Rol - Stockcito v0.1

> **Última actualización:** 15 de enero de 2026  
> Este documento describe las acciones disponibles para cada tipo de rol en el sistema.

---

## Tabla de Contenidos

1. [Resumen de Roles](#resumen-de-roles)
2. [Owner (Propietario)](#owner-propietario)
3. [Admin (Administrador)](#admin-administrador)
4. [Manager (Encargado)](#manager-encargado)
5. [Cashier (Cajero)](#cashier-cajero)
6. [Waiter (Mesero)](#waiter-mesero)
7. [Viewer (Observador)](#viewer-observador)
8. [Matriz de Permisos](#matriz-de-permisos)

---

## Resumen de Roles

| Rol | Descripción | Nivel de Acceso |
|-----|-------------|-----------------|
| **Owner** | Dueño del negocio | Total |
| **Admin** | Administrador con casi todos los permisos | Alto |
| **Manager** | Encargado de turno | Medio-Alto |
| **Cashier** | Cajero de punto de venta | Medio |
| **Waiter** | Mesero (solo restaurantes) | Bajo |
| **Viewer** | Solo visualización | Muy Bajo |

---

## Owner (Propietario)

### 🎯 Descripción
El Owner tiene acceso **total** al sistema. Es el único que puede gestionar la suscripción, regenerar códigos de negocio y eliminar la organización.

### 📋 Flujo de Trabajo Diario

#### Al Iniciar el Día
1. **Revisar Dashboard** (`/dashboard`)
   - Ver ventas del día/semana/mes
   - Revisar productos con stock bajo
   - Verificar estado de caja

2. **Verificar Alertas** (icono en header)
   - Notificaciones de stock bajo
   - Ventas de alto valor pendientes

#### Durante el Día
3. **Gestión General**
   - Supervisar ventas en tiempo real
   - Aprobar descuentos que excedan límites
   - Resolver problemas de empleados

#### Al Cerrar
4. **Revisión de Cierre**
   - Revisar historial de ventas (`/sales/history`)
   - Verificar cierre de caja (`/sales/drawer`)
   - Revisar auditoría (`/users/audit`)

### 🛠️ Acciones Exclusivas del Owner

| Acción | Ruta | Descripción |
|--------|------|-------------|
| Gestionar Suscripción | `/subscription` | Cambiar plan, ver facturas |
| Regenerar Código de Negocio | `/profile` → Seguridad | Nuevo código para empleados |
| Eliminar Organización | Configuración | Borrar todo permanentemente |
| Exportar Datos Completos | Reportes | Backup de toda la info |
| Configurar Features | `/settings` | Activar Kitchen Display, Mesas |

### 📍 Navegación Disponible

```
Dashboard ────────────────────────────────────────────────────────
├── 📊 Dashboard           → Resumen general
├── 📦 Inventario          → Ver, crear, editar, eliminar productos
├── 📁 Categorías          → Gestionar categorías
├── 🛒 Ventas (POS)        → Punto de venta
├── 📜 Historial           → Todas las ventas (puede ver de todos)
├── 💰 Caja                → Abrir, cerrar, movimientos
├── 👥 Clientes            → CRUD completo + exportar
├── 🏢 Proveedores         → CRUD completo
├── 📈 Reportes            → Todos los reportes
│
Administración ───────────────────────────────────────────────────
├── 👤 Usuarios            → CRUD, asignar roles
├── ⏰ Control Horario     → Ver entradas de todos
├── 📋 Auditoría           → Ver todos los logs
├── 💸 Descuentos          → CRUD completo
├── ⚙️ Configuración       → Notificaciones, Features
│
Restaurante (si está activado) ────────────────────────────────────
├── 👨‍🍳 Cocina              → Kitchen Display
└── 🍽️ Mesas               → Gestión de mesas
```

---

## Admin (Administrador)

### 🎯 Descripción
El Admin tiene casi los mismos permisos que el Owner, excepto gestión de suscripción y eliminación de la organización.

### 📋 Flujo de Trabajo Diario

#### Mañana
1. **Verificar inventario** (`/inventory`)
   - Revisar productos con stock bajo
   - Actualizar precios si es necesario
   - Crear productos nuevos

2. **Gestionar empleados** (`/users`)
   - Verificar asistencia
   - Resolver problemas de acceso

#### Durante el Día
3. **Supervisión**
   - Monitorear ventas
   - Aprobar descuentos especiales
   - Gestionar clientes VIP

#### Cierre
4. **Reportes**
   - Generar reportes de ventas
   - Exportar datos para contabilidad
   - Revisar auditoría

### 🛠️ Acciones del Admin

| Acción | Disponible | Notas |
|--------|------------|-------|
| Gestionar Productos | ✅ | CRUD completo |
| Gestionar Usuarios | ✅ | No puede crear Owners |
| Ver Auditoría | ✅ | Todos los logs |
| Exportar Datos | ✅ | Clientes, Inventario |
| Gestionar Descuentos | ✅ | CRUD completo |
| Gestionar Suscripción | ❌ | Solo Owner |
| Regenerar Código | ❌ | Solo Owner |

### ⚠️ Limitaciones vs Owner
- No puede cambiar el plan de suscripción
- No puede regenerar el código de negocio
- No puede eliminar la organización
- No puede crear usuarios con rol "Owner"

---

## Manager (Encargado)

### 🎯 Descripción
El Manager es el encargado de turno. Puede gestionar ventas, ver reportes y supervisar empleados de menor rango, pero no puede modificar configuraciones críticas.

### 📋 Flujo de Trabajo Diario

#### Apertura de Turno
1. **Abrir caja** (`/sales/drawer/new`)
   - Contar efectivo inicial
   - Registrar apertura

2. **Verificar equipo**
   - Revisar quién está presente (`/users/time`)
   - Asignar tareas

#### Durante el Turno
3. **Operación**
   - Procesar ventas complejas
   - Aprobar descuentos hasta su límite
   - Resolver reclamos de clientes

4. **Supervisión**
   - Monitorear Kitchen Display
   - Gestionar mesas (si aplica)

#### Cierre de Turno
5. **Cerrar caja**
   - Contar efectivo
   - Registrar diferencias
   - Generar reporte de turno

### 🛠️ Acciones del Manager

| Acción | Disponible | Notas |
|--------|------------|-------|
| Ventas (POS) | ✅ | Completo |
| Ver Inventario | ✅ | Solo lectura |
| Editar Productos | ❌ | Solo Admin/Owner |
| Ver Reportes | ✅ | Limitados a su turno |
| Ver Auditoría | ❌ | Solo Admin/Owner |
| Gestionar Caja | ✅ | Abrir, cerrar, movimientos |
| Descuentos | ✅ | Solo aplicar, no crear |
| Control Horario | ✅ | Ver todos, editar propio |

### 📍 Navegación Visible

```
Dashboard ────────────────────────────────────────────────────────
├── 📊 Dashboard           → Resumen (limitado)
├── 📦 Inventario          → Solo lectura
├── 🛒 Ventas (POS)        → Completo
├── 📜 Historial           → Sus ventas + equipo
├── 💰 Caja                → Completo
├── 👥 Clientes            → Ver, crear, editar
├── 📈 Reportes            → Ventas y productos
│
Restaurante (si activo) ──────────────────────────────────────────
├── 👨‍🍳 Cocina              → Kitchen Display
└── 🍽️ Mesas               → Ver y cambiar estados
```

---

## Cashier (Cajero)

### 🎯 Descripción
El Cajero es el rol principal de punto de venta. Está optimizado para procesar ventas rápidamente.

### 📋 Flujo de Trabajo Diario

#### Al Empezar
1. **Fichar entrada** (`/users/time`)
   - Clock In con ubicación

2. **Verificar caja asignada**
   - Confirmar efectivo inicial

#### Durante el Turno
3. **Procesar Ventas** (`/sales/new`)
   - Buscar productos por nombre/código
   - Escanear códigos de barras
   - Aplicar descuentos autorizados
   - Cobrar (efectivo, tarjeta, MercadoPago)

4. **Gestionar Clientes**
   - Buscar cliente existente
   - Crear cliente nuevo si es necesario

#### Al Terminar
5. **Fichar salida**
   - Clock Out

### 🛠️ Acciones del Cashier

| Acción | Disponible | Notas |
|--------|------------|-------|
| Ventas (POS) | ✅ | Función principal |
| Ver Inventario | ✅ | Solo consulta (stock) |
| Editar Productos | ❌ | - |
| Ver Historial | ✅ | Solo sus ventas |
| Gestionar Caja | ⚠️ | Solo movimientos, no abrir/cerrar |
| Clientes | ✅ | Crear y buscar |
| Aplicar Descuentos | ✅ | Hasta su límite (10% default) |
| Control Horario | ✅ | Solo propio |

### 📍 Navegación Visible

```
Dashboard ────────────────────────────────────────────────────────
├── 📊 Dashboard           → Resumen básico
├── 📦 Inventario          → Solo ver stock
├── 🛒 Ventas (POS)        → ⭐ Principal
├── 📜 Historial           → Solo sus ventas
├── 👥 Clientes            → Buscar, crear
│
Personal ─────────────────────────────────────────────────────────
└── ⏰ Control Horario     → Clock In/Out
```

### ⚡ Atajos de Teclado en POS
- `F1` - Ayuda
- `F2` - Buscar producto
- `F3` - Buscar cliente
- `F4` - Aplicar descuento
- `F8` - Cobrar
- `Esc` - Cancelar venta

---

## Waiter (Mesero)

### 🎯 Descripción
Rol específico para restaurantes. Puede tomar pedidos y gestionar mesas.

### 📋 Flujo de Trabajo

#### Al Empezar
1. **Fichar entrada**
2. **Ver mesas asignadas** (`/tables`)

#### Durante el Turno
3. **Tomar pedidos**
   - Seleccionar mesa
   - Agregar productos al pedido
   - Enviar a cocina

4. **Seguimiento**
   - Ver estado en Kitchen Display
   - Notificar cuando esté listo

5. **Cobrar**
   - Llevar cuenta a la mesa
   - Procesar pago
   - Liberar mesa

### 🛠️ Acciones del Waiter

| Acción | Disponible | Notas |
|--------|------------|-------|
| Ventas (POS) | ✅ | Asociadas a mesas |
| Mesas | ✅ | Ver, ocupar, liberar |
| Kitchen Display | ✅ | Solo ver |
| Inventario | ⚠️ | Solo ver stock |
| Control Horario | ✅ | Solo propio |

### 📍 Navegación Visible

```
Dashboard ────────────────────────────────────────────────────────
├── 🛒 Ventas (POS)        → Pedidos
├── 📜 Historial           → Sus pedidos
│
Restaurante ──────────────────────────────────────────────────────
├── 👨‍🍳 Cocina              → Ver estado
├── 🍽️ Mesas               → ⭐ Principal
│
Personal ─────────────────────────────────────────────────────────
└── ⏰ Control Horario     → Clock In/Out
```

---

## Viewer (Observador)

### 🎯 Descripción
Rol de solo lectura. Útil para contadores, auditores externos o dueños que solo quieren ver sin modificar.

### 🛠️ Acciones del Viewer

| Acción | Disponible |
|--------|------------|
| Ver Dashboard | ✅ |
| Ver Inventario | ✅ |
| Ver Ventas | ✅ |
| Ver Reportes | ✅ |
| Modificar cualquier cosa | ❌ |
| Procesar ventas | ❌ |
| Control Horario | ❌ |

### 📍 Navegación Visible

```
Dashboard (Solo Lectura) ─────────────────────────────────────────
├── 📊 Dashboard           → Métricas
├── 📦 Inventario          → Stock actual
├── 📜 Historial           → Ventas realizadas
└── 📈 Reportes            → Informes
```

---

## Matriz de Permisos

### Leyenda
- ✅ Acceso completo
- ⚠️ Acceso parcial
- ❌ Sin acceso

| Funcionalidad | Owner | Admin | Manager | Cashier | Waiter | Viewer |
|---------------|-------|-------|---------|---------|--------|--------|
| **Dashboard** | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| **Inventario - Ver** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| **Inventario - Editar** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Ventas (POS)** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Historial - Propio** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Historial - Todos** | ✅ | ✅ | ⚠️ | ❌ | ❌ | ✅ |
| **Caja - Abrir/Cerrar** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Caja - Movimientos** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Clientes - Ver** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| **Clientes - Editar** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Clientes - Exportar** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Proveedores** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Reportes** | ✅ | ✅ | ⚠️ | ❌ | ❌ | ✅ |
| **Usuarios - Gestionar** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Control Horario - Propio** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Control Horario - Todos** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Auditoría** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Descuentos - Crear** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Descuentos - Aplicar** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Configuración** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Suscripción** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Kitchen Display** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ❌ |
| **Mesas** | ✅ | ✅ | ✅ | ⚠️ | ✅ | ❌ |

---

## Recomendaciones de Simplificación

### Para Negocios Pequeños (1-3 empleados)
- Usar solo roles: **Owner** + **Cashier**
- El owner hace todo lo administrativo
- Los cajeros solo procesan ventas

### Para Negocios Medianos (4-10 empleados)
- Usar: **Owner** + **Admin** + **Cashier**
- Owner: Estrategia y finanzas
- Admin: Operaciones diarias
- Cashier: Punto de venta

### Para Restaurantes
- Usar: **Owner** + **Manager** + **Waiter** + **Cashier**
- Manager: Encargado de turno
- Waiter: Atención de mesas
- Cashier: Caja central

---

*Documento generado el 15 de enero de 2026 para Stockcito v0.1*

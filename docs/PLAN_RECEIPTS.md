# Plan de Mejoras: Sistema de Tickets y Facturación

Este documento detalla el plan de implementación para profesionalizar la emisión de comprobantes y preparar el terreno para futuras integraciones fiscales.

## Objetivos
1.  **Numeración Profesional:** Implementar numeración correlativa por organización (ej: `0001-00000001`) independiente del ID de base de datos.
2.  **Inmutabilidad (Snapshot):** Garantizar que si se cambia el nombre o precio de un producto en el futuro, el historial de ventas mantenga los datos originales.
3.  **Impresión Térmica:** Crear un diseño optimizado para impresoras de 80mm.
4.  **Integración POS:** Botón directo "Imprimir Ticket" en el flujo de venta.

## 1. Cambios en Base de Datos (Schema)

### Tabla `Organization`
- Agregar campo `lastTicketNumber` (Int, default 0) para llevar el contador secuencial de cada comercio.

### Tabla `Sale`
- Agregar campo `ticketNumber` (String) para mostrar el número formateado (ej: "TCK-0001-00421").
- Agregar campo `ticketSequence` (Int) para el número crudo correlativo.

### Tabla `SaleItem`
- Agregar campo `productName` (String). Actualmente solo guardamos `productId`, si el nombre cambia en el inventario, cambia en las ventas viejas. Esto corrige eso.

## 2. Backend (Server Actions)

### Actualizar `createSale` (o equivalente)
- **Transacción Atómica:**
    - Leer y aumentar `organization.lastTicketNumber`.
    - Asignar ese nuevo número a `Sale.ticketSequence`.
    - Formatear `Sale.ticketNumber` (ej: padding con ceros).
    - Guardar `productName` en cada `SaleItem` copiado del producto actual.

## 3. Frontend (Componentes)

### Nuevo Componente: `<TicketReceipt />`
- Diseño "Mobile First" pero pensado para papel de 80mm.
- Estilos CSS `@media print` para ocultar el resto de la interfaz y solo imprimir el ticket.
- Datos a mostrar:
    - Logo / Nombre Fantasía.
    - Datos del comercio (Dirección, Teléfono).
    - Fecha y Hora.
    - **Nro de Ticket** (El nuevo campo).
    - Lista de items (Cant x Precio).
    - Totales.
    - Pie de página ("Gracias por su compra").

### Actualización: `PosInterface`
- En el modal/pantalla de "Venta Exitosa":
    - Agregar botón principal: `<Printer /> Imprimir Ticket`.
    - Este botón invoca `window.print()` con el componente de Ticket renderizado (posiblemente usando un iframe oculto o una ruta dedicada `/sales/[id]/ticket` para facilitar la impresión móvil).

## 4. Workflows y Pruebas
- Verificar que dos ventas seguidas incrementen correctamente el contador.
- Verificar la impresión en pantalla (preview del navegador).
- Verificar que el historial muestre el nombre del producto "congelado" de la venta.

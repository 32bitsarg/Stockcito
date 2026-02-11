
# Análisis de Stockcito

Este documento presenta un análisis detallado de la aplicación **Stockcito**, cubriendo sus funcionalidades actuales, recomendaciones de seguridad y optimización, y propuestas de diseño para mejorar la experiencia de usuario.

## 1. Características Principales (Features)

Stockcito es una solución integral de **Punto de Venta (POS) e Inventario** diseñada para PyMEs y emprendedores, con soporte híbrido (Web y Desktop vía Electron/Tauri). La versión actual es la **v0.1.4**.

### 🏢 Gestión de Negocio y Suscripción
- **Sistema Multi-Tenant**: Soporte para múltiples organizaciones y usuarios.
- **Planes de Suscripción**:
  - **Free**: Ideal para pruebas (25 productos, 10 clientes, 1 usuario).
  - **Emprendedor**: $15.000/mes (300 productos, 200 clientes, 2 usuarios, 10 proveedores).
  - **Pyme**: $30.000/mes (Ilimitado, funciones avanzadas).
- **Pagos**: Integración completa con **MercadoPago** para gestión de suscripciones.
- **Facturación**: Soporte preparado para facturación electrónica (AFIP) con generación de CAEs y Notas de Crédito.

### 🛒 TPV (Terminal Punto de Venta)
- **Interfaz Moderna**: Diseño optimizado para ventas rápidas con soporte de escáner de código de barras.
- **Búsqueda Inteligente**: Localiza productos por nombre o SKU al instante.
- **Múltiples Métodos de Pago**: Efectivo, Tarjeta, Transferencia, MercadoPago.
- **Tickets Profesionales**: Generación de tickets numerados secuencialmente, listos para impresoras térmicas de 80mm.
- **Snapshot de Productos**: Guarda el estado del producto al momento de la venta para historial fidedigno.
- **Descuentos y Promociones**: Aplicación flexible de descuentos por producto o venta total.

### 📦 Gestión de Inventario
- **Control de Stock**: Seguimiento en tiempo real con alertas de bajo stock personalizables.
- **Catalogación**: Organización mediante Categorías y Proveedores.
- **Edición Rápida**: Ajustes de stock e información directamente desde el listado.
- **Importación/Exportación**: Herramientas para carga masiva de datos.

### 🍽️ Modo Restaurante (Add-on)
- **Gestión de Mesas**: Mapa interactivo de mesas con estados (Libre, Ocupada, Reservada).
- **Comandas**: Asignación de pedidos a mesas específicas.
- **KDS (Kitchen Display System)**: Pantalla de cocina en tiempo real para gestionar la preparación de pedidos.

### 👥 Gestión de Equipo
- **Roles y Permisos**: Sistema granular (Owner, Admin, Manager, Cashier, Waiter, Viewer).
- **Turnos y Caja**: Apertura y cierre de caja, control de movimientos de efectivo y arqueo ciego.
- **Control de Asistencia**: Registro de entrada/salida (Clock In/Out) con geolocalización opcional.
- **Seguridad de Empleados**: Acceso rápido mediante PIN de 4-6 dígitos.

### 📱 Experiencia de Usuario
- **Diseño Responsivo**: Adaptado para Desktop, Tablet y Móviles.
- **Modo Oscuro/Claro**: Soporte nativo con cambio automático o manual.
- **Notificaciones**: Sistema de alertas Push y por Email para eventos críticos.
- **Modo Offline**: Funcionalidad básica sin conexión a internet (especialmente en versión Desktop).

---

## 2. Recomendaciones de Seguridad

Basado en la arquitectura actual (Next.js, Prisma, Server Actions), se sugieren las siguientes mejoras:

### Autenticación y Sesiones
- **MFA (Autenticación Multifactor)**: Implementar 2FA (vía App autenticadora o Email) para roles críticos como Owner y Admin.
- **Rotación de Tokens**: Asegurar que los tokens de sesión (JWT/Jose) tengan tiempos de expiración cortos y mecanismos de renovación (refresh tokens) seguros.
- **Rate Limiting**: Reforzar el límite de intentos de login en `middleware.ts` o a nivel de infraestructura para prevenir fuerza bruta.

### Protección de Datos
- **Sanitización de Entradas**: Aunque Zod ayuda, asegurar que todas las entradas de texto libre (nombres, descripciones) estén sanitizadas para prevenir XSS almacenado.
- **Logs de Auditoría**: El sistema `AuditLog` es excelente. Asegurar que los logs críticos (intentos de acceso fallidos, cambios de permisos) sean inmutables o se envíen a un servicio externo seguro.
- **Variables de Entorno**: Verificar que las claves de API (MercadoPago, Appwrite, DB) no se expongan nunca en el cliente (prefijo `NEXT_PUBLIC_` solo cuando sea estrictamente necesario).

### Infraestructura
- **CSP Estricto**: El CSP actual en `middleware.ts` es "relajado" (`unsafe-inline`, `unsafe-eval`). Trabajar para eliminar `unsafe-inline` moviendo estilos/scripts a archivos externos o usando nonces estrictos para todo.
- **Headers de Seguridad**: Agregar headers adicionales como `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, y `Permissions-Policy` para limitar el acceso a hardware (cámara/micro) solo a rutas necesarias.

---

## 3. Recomendaciones de Optimización

Para garantizar un rendimiento fluido, especialmente en dispositivos de gama baja habituales en comercios:

### Rendimiento (Performance)
- **Server Components**: Mover la mayor lógica posible a React Server Components (RSC) para reducir el bundle de JavaScript enviado al cliente. Las acciones en `actions/` ya son un buen paso.
- **Optimización de Imágenes**:
  - Usar `next/image` para todas las imágenes (logos, productos).
  - Implementar carga diferida (lazy loading) para imágenes fuera del viewport inicial.
  - Servir imágenes en formatos modernos (WebP/AVIF).
- **Code Splitting**: Verificar que las librerías pesadas (como `recharts` o `jspdf`) se carguen dinámicamente (`next/dynamic`) solo cuando se necesitan.

### Base de Datos
- **Consultas Eficientes**: Revisar `prisma/schema.prisma` para asegurar que todas las búsquedas frecuentes (por `sku`, `email`, `status`) tengan índices (`@@index`).
- **Paginación**: Implementar paginación "cursor-based" en lugar de "offset-based" para tablas grandes (Ventas, Logs) para mejorar la velocidad de carga.
- **Caching**: Utilizar `unstable_cache` de Next.js para cachear resultados de consultas pesadas que cambian poco (ej: Configuración de Organización, Categorías).

### Desktop (Electron/Tauri)
- **Bundle Size**: Minimizar el tamaño del instalador auditando las dependencias (`npm list`). Retirar librerías no utilizadas.
- **Actualizaciones**: Implementar un sistema de actualización diferencial para que los usuarios no tengan que descargar todo el instalador nuevamente.

---

## 4. Features y Mejoras de Diseño (UX/UI)

Para maximizar el factor "WOW" y la usabilidad:

### Diseño Visual (Aesthetics)
- **Micro-interacciones**: Agregar feedback táctil y visual al escanear productos (pequeña vibración o sonido + destello verde en pantalla).
- **Transiciones**: Usar `framer-motion` para animar suavemente la entrada/salida de modales y el cambio entre páginas (Page Transitions).
- **Glassmorphism Refinado**: Expandir el uso de efectos de vidrio esmerilado (blur) en barras laterales, modales y tarjetas flotantes para dar profundidad moderna.
- **Data Visualization**: Mejorar los gráficos del Dashboard con animaciones de entrada y tooltips interactivos más ricos.

### Experiencia de Usuario (UX)
- **Modo Kiosco**: Una interfaz simplificada y bloqueada para que los clientes puedan autogestionar pedidos (Self-Service).
- **Atajos de Teclado**: Implementar atajos globales para acciones comunes (F1: Ayuda, F5: Actualizar Stock, Alt+N: Nueva Venta, Esc: Cancelar).
- **Onboarding Interactivo**: Un tour guiado (usando librerías como `driver.js` o custom) para nuevos usuarios que explique las funciones clave al iniciar sesión por primera vez.
- **Búsqueda Global (Command Palette)**: Un menú tipo "Ctrl+K" que permita navegar a cualquier parte de la app o ejecutar acciones (ej: "Crear Producto", "Ver Ventas de Hoy") sin usar el mouse.

### Accesibilidad
- **Contraste y Color**: Asegurar que los colores del tema tengan suficiente contraste para entornos muy iluminados (común en tiendas).
- **Tamaño de Fuente Dinámico**: Permitir al cajero ajustar el tamaño de la letra para mejorar la legibilidad en pantallas táctiles o monitores lejanos.

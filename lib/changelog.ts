// Changelog data - Add new entries at the top
// The first entry's version is automatically used as the current app version

export interface ChangelogChange {
    type: 'new' | 'improvement' | 'fix' | 'performance'
    title: string
    description: string
}

export interface ChangelogEntry {
    version: string
    date: string
    title: string
    description: string
    changes: ChangelogChange[]
}

export const changelogEntries: ChangelogEntry[] = [
    {
        version: '0.1.3',
        date: '2026-01-20',
        title: 'Integración Lector Código de Barras 🛒',
        description: 'Soporte completo para lectores de código de barras en POS e Inventario.',
        changes: [
            {
                type: 'new',
                title: 'Tickets Profesionales',
                description: 'Numeración secuencial y formato optimizado para impresoras térmicas de 80mm.'
            },
            {
                type: 'improvement',
                title: 'Snapshot de Productos',
                description: 'Los tickets guardan el nombre del producto al momento de la venta, preservando el historial.'
            },
            {
                type: 'new',
                title: 'Impresión Directa',
                description: 'Botón para imprimir ticket inmediatamente después de la venta.'
            },
            {
                type: 'new',
                title: 'Escaneo Global',
                description: 'Escanea productos desde cualquier pantalla para ir directo a la venta o crear el producto.'
            },
            {
                type: 'new',
                title: 'Búsqueda Inteligente en POS',
                description: 'El POS ahora busca productos en el servidor si no están cargados localmente al escanear.'
            },
            {
                type: 'new',
                title: 'Creación Rápida de Productos',
                description: 'Al escanear un código nuevo, se abre el formulario de creación con el SKU pre-cargado.'
            },
            {
                type: 'new',
                title: 'Ajuste Rápido de Stock',
                description: 'Haz clic en el indicador de stock en el POS para ajustar cantidades rápidamente (solo Admin/Manager).'
            },
            {
                type: 'new',
                title: 'Alerta Stock Agotado al Escanear',
                description: 'Al escanear un producto sin stock, se muestra alerta con opción de editar stock (según permisos).'
            },
            {
                type: 'improvement',
                title: 'Actualización Automática de Stock',
                description: 'El inventario se actualiza automáticamente después de cada venta sin necesidad de recargar.'
            },
            {
                type: 'improvement',
                title: 'Impresión con Portal React',
                description: 'Sistema de impresión de tickets robusto usando portales para evitar conflictos con modales.'
            },
            {
                type: 'fix',
                title: 'Corrección Rutas Inventario',
                description: 'Corregida la redirección al crear productos nuevos desde el escáner.'
            },
            {
                type: 'fix',
                title: 'Navegación Fantasma Scanner',
                description: 'Corregido comportamiento donde el "Enter" del scanner activaba botones enfocados.'
            },
            {
                type: 'fix',
                title: 'Creación de Usuario en Modo Automático',
                description: 'Solucionado bug que impedía crear usuarios con PIN automático.'
            },
            {
                type: 'fix',
                title: 'Error Venta Modal Éxito',
                description: 'Corregido error "Cannot read reduce" al mostrar el modal de venta exitosa.'
            },
            {
                type: 'fix',
                title: 'Sincronización Base de Datos',
                description: 'Corregidos campos faltantes (ticketNumber, ticketSequence) en base de datos local.'
            },
            {
                type: 'improvement',
                title: 'Visualización de Credenciales',
                description: 'Nueva ventana emergente muestra el PIN y contraseña generados al crear un empleado, como respaldo al email.'
            },
            {
                type: 'fix',
                title: 'Visibilidad de Usuarios en Kiosco',
                description: 'El modo kiosco ahora muestra a todos los empleados, indicando cuáles tienen PIN pendiente de configurar.'
            }
        ]
    },
    {
        version: '0.1.2',
        date: '2026-01-20',
        title: 'Integración Restaurante + Logging 🍽️',
        description: 'Mejoras importantes en el sistema de restaurantes y monitoreo de la aplicación',
        changes: [
            {
                type: 'new',
                title: 'Integración Mesas + Cocina',
                description: 'Ahora puedes asignar mesas a las ventas y el display de cocina muestra el número de mesa para cada pedido'
            },
            {
                type: 'new',
                title: 'Selector de Mesa en POS',
                description: 'Nuevo componente visual para seleccionar mesa al crear una venta (solo si gestión de mesas está activada)'
            },
            {
                type: 'new',
                title: 'Sistema de Logging con Appwrite',
                description: 'Los errores y eventos se registran en Appwrite para monitoreo centralizado en producción'
            },
            {
                type: 'improvement',
                title: 'Método de pago real desde MercadoPago',
                description: 'La página de configuración ahora muestra los datos reales del método de pago (últimos 4 dígitos, vencimiento)'
            },
            {
                type: 'improvement',
                title: 'Verificación real de suscripción',
                description: 'La página de éxito de suscripción ahora verifica el pago en tiempo real con MercadoPago'
            },
            {
                type: 'improvement',
                title: 'Mesa se marca ocupada automáticamente',
                description: 'Al crear una venta con mesa asignada, la mesa cambia automáticamente a estado "ocupada"'
            },
            {
                type: 'fix',
                title: 'Kitchen Display - tableName',
                description: 'Corregido el TODO pendiente que mostraba undefined en lugar del nombre de mesa'
            },
        ]
    },
    {
        version: '0.1.1',
        date: '2026-01-19',
        title: 'Mejoras de Seguridad y UX 🔐',
        description: 'Mejoras en la seguridad del registro y experiencia de usuario',
        changes: [
            {
                type: 'new',
                title: 'Página de Changelog',
                description: 'Nueva página para ver el historial de cambios y actualizaciones del sistema'
            },
            {
                type: 'new',
                title: 'Opción "Recordarme"',
                description: 'Los usuarios pueden elegir mantener su sesión activa por 30 días'
            },
            {
                type: 'improvement',
                title: 'Validación de contraseña mejorada',
                description: 'Ahora se requiere mínimo 8 caracteres, mayúscula, minúscula, número y caracter especial'
            },
            {
                type: 'improvement',
                title: 'Indicador de fortaleza de contraseña',
                description: 'Barra visual que muestra qué tan segura es la contraseña mientras se escribe'
            },
            {
                type: 'improvement',
                title: 'Redirección automática de landing',
                description: 'Si el usuario ya está logueado, la landing lo redirige automáticamente al dashboard'
            },
            {
                type: 'fix',
                title: 'Warning de searchParams en registro',
                description: 'Corregido el warning de Next.js 15+ sobre el uso asíncrono de searchParams'
            },
        ]
    },
    {
        version: '0.1.0',
        date: '2026-01-17',
        title: 'Lanzamiento Inicial 🎉',
        description: 'Primera versión pública de Stockcito',
        changes: [
            {
                type: 'new',
                title: 'Sistema POS completo',
                description: 'Punto de venta con soporte para productos, clientes y múltiples métodos de pago'
            },
            {
                type: 'new',
                title: 'Gestión de inventario',
                description: 'Control de stock con alertas de bajo inventario y categorización de productos'
            },
            {
                type: 'new',
                title: 'Módulo de clientes',
                description: 'Registro y seguimiento de clientes con historial de compras'
            },
            {
                type: 'new',
                title: 'Reportes y analytics',
                description: 'Dashboard con métricas de ventas, productos más vendidos y tendencias'
            },
            {
                type: 'new',
                title: 'Sistema de suscripciones',
                description: 'Planes Free y Premium con integración de MercadoPago'
            },
            {
                type: 'new',
                title: 'Modo restaurante',
                description: 'Funcionalidades específicas para restaurantes: cocina y gestión de mesas'
            },
            {
                type: 'new',
                title: 'Control de usuarios',
                description: 'Roles (owner, admin, manager, cashier) con permisos diferenciados'
            },
            {
                type: 'improvement',
                title: 'Diseño responsive',
                description: 'Interfaz adaptada para desktop, tablet y móvil'
            },
            {
                type: 'improvement',
                title: 'Tema oscuro/claro',
                description: 'Soporte completo para modo oscuro con cambio automático'
            },
        ]
    },
]

// Current version is always the first entry in the changelog
export const APP_VERSION = changelogEntries[0]?.version || '0.0.0'

// Helper to get version with 'v' prefix
export const APP_VERSION_DISPLAY = `v${APP_VERSION}`

// Feedback email for bug reports and suggestions
export const FEEDBACK_EMAIL = 'noreply@stockcito.com'

// App info for consistency across the app
export const APP_INFO = {
    name: 'Stockcito',
    version: APP_VERSION,
    versionDisplay: APP_VERSION_DISPLAY,
    tagline: 'POS · Inventario · Facturación',
    description: 'Sistema de punto de venta para PyMEs argentinas',
    feedbackEmail: FEEDBACK_EMAIL,
} as const

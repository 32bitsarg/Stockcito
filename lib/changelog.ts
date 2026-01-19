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

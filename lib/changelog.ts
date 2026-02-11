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
        version: '0.1.5',
        date: '2026-02-11',
        title: 'Nueva Estética Premium & Mejoras Visuales 🎨',
        description: 'Hemos renovado completamente la imagen del sistema para que sea más profesional, elegante y fácil de usar.',
        changes: [
            {
                type: 'improvement',
                title: 'Nuevo Diseño "Total Black"',
                description: 'Cambiamos el estilo visual por uno mucho más moderno en blanco y negro de alta gama, con tipografías más claras y elegantes.'
            },
            {
                type: 'improvement',
                title: 'Terminal de Venta más Amplia',
                description: 'Agrandamos el área de trabajo en el punto de venta para que puedas ver más productos a la vez y sea todo más cómodo.'
            },
            {
                type: 'improvement',
                title: 'Gráficos de Rendimiento Inteligentes',
                description: 'Los gráficos de ventas ahora son más limpios y muestran resúmenes automáticos de tus ingresos y promedios diarios.'
            },
            {
                type: 'improvement',
                title: 'Panel de Control mas "En Vivo"',
                description: 'Actualizamos los indicadores para que sepas en todo momento que el sistema está sincronizado y funcionando en tiempo real.'
            },
            {
                type: 'improvement',
                title: 'Traducción Completa al Español',
                description: 'Eliminamos las palabras que quedaban en inglés para que todo el sistema sea 100% amigable y fácil de entender.'
            },
            {
                type: 'fix',
                title: 'Ajustes en la Configuración',
                description: 'Corregimos pequeños errores visuales en la página de ajustes y mejoramos la consistencia de los botones.'
            },
        ]
    },
    {
        version: '0.1.4',
        date: '2026-01-29',
        title: 'Planes para Todos los Negocios 💎',
        description: 'Actualizamos nuestros precios y planes para que siempre tengas una opción que se adapte al tamaño de tu comercio.',
        changes: [
            {
                type: 'new',
                title: 'Plan para tu Primer Negocio',
                description: 'Lanzamos el Plan Emprendedor, ideal si estás empezando solo o con alguien más. Incluye todo lo necesario para crecer.'
            },
            {
                type: 'improvement',
                title: 'Plan Pyme Ilimitado',
                description: 'Mejoramos nuestro plan más completo para que no tengas límites de productos, clientes ni usuarios. ¡Energía total para tu empresa!'
            },
            {
                type: 'improvement',
                title: 'Prueba Gratis Siempre Lista',
                description: 'Mantenemos un plan gratuito para que puedas conocer el sistema y dar tus primeros pasos sin costo.'
            },
            {
                type: 'improvement',
                title: 'Control de Usuarios por Plan',
                description: 'Ahora el sistema te avisa de forma clara cuántos empleados podés sumar según el plan que elijas.'
            },
            {
                type: 'improvement',
                title: 'Tabla Comparativa Sencilla',
                description: 'Diseñamos una nueva tabla de planes donde podés ver de un vistazo qué incluye cada opción sin términos técnicos raros.'
            }
        ]
    },
    {
        version: '0.1.3',
        date: '2026-01-20',
        title: 'Lector de Código de Barras y Facturación 🛒',
        description: '¡Ahora podés vender mucho más rápido! Agregamos soporte para scanners y mejoramos la impresión de tus comprobantes.',
        changes: [
            {
                type: 'new',
                title: 'Ventas con Scanner',
                description: 'Solo tenés que pasar el código por el scanner y el producto se agrega solo al carrito. ¡Súper rápido!'
            },
            {
                type: 'new',
                title: 'Tickets más Lindos',
                description: 'Mejoramos el formato de los tickets para que salgan perfectos en cualquier impresora térmica común.'
            },
            {
                type: 'new',
                title: 'Carga de Productos al Instante',
                description: 'Si escaneás un código nuevo que no tenés cargado, el sistema te ayuda a crearlo en un segundo con el código ya puesto.'
            },
            {
                type: 'improvement',
                title: 'Ajuste de Stock a un Clic',
                description: 'Si ves que el stock está mal mientras vendés, podés tocar el número y corregirlo ahí mismo sin salir de la pantalla.'
            },
            {
                type: 'fix',
                title: 'Ventas sin Errores',
                description: 'Corregimos errores que hacían que a veces no se pueda imprimir el ticket o que el carrito se trabe.'
            }
        ]
    },
    {
        version: '0.1.2',
        date: '2026-01-20',
        title: 'Tu Negocio siempre Monitoreado 🛠️',
        description: 'Hicimos el sistema mucho más robusto para que nunca te falle en medio de una venta importante.',
        changes: [
            {
                type: 'new',
                title: 'Control de Mesas y Comandas',
                description: 'Si tenés un restaurante o bar, ahora podés marcar qué mesa está pidiendo y que la cocina lo vea clarito.'
            },
            {
                type: 'improvement',
                title: 'Estado de tu suscripción',
                description: 'Ahora podés ver los datos de tu último pago y cuándo vence tu plan de forma súper sencilla.'
            },
            {
                type: 'improvement',
                title: 'Mesas Ocupadas',
                description: 'Cuando abrís un pedido en una mesa, el sistema la marca como ocupada automáticamente para que no haya confusiones.'
            },
            {
                type: 'fix',
                title: 'Estabilidad Mejorada',
                description: 'Agregamos un sistema que nos avisa a nosotros si algo falla para que podamos arreglarlo antes de que te des cuenta.'
            }
        ]
    },
    {
        version: '0.1.1',
        date: '2026-01-19',
        title: 'Más Seguridad para vos 🔐',
        description: 'Protegemos mejor tus datos y hacemos que entrar al sistema sea más cómodo.',
        changes: [
            {
                type: 'new',
                title: 'Botón "Recordarme"',
                description: 'Si tildás esta opción, no hace falta que pongas tu clave cada vez que entres desde tu compu de confianza.'
            },
            {
                type: 'new',
                title: 'Nueva Sección de Novedades',
                description: 'Creamos este rinconcito para que siempre sepas qué cosas nuevas estamos agregando para vos.'
            },
            {
                type: 'improvement',
                title: 'Claves más Seguras',
                description: 'Te ayudamos a elegir una contraseña fuerte con un indicador visual para que tu cuenta esté siempre protegida.'
            }
        ]
    },
    {
        version: '0.1.0',
        date: '2026-01-17',
        title: '¡Bienvenidos a Stockcito! 🎉',
        description: 'Hoy nace tu mejor aliado para gestionar tus ventas e inventario de forma fácil.',
        changes: [
            {
                type: 'new',
                title: 'Todo para Vendér',
                description: 'Un sistema de ventas súper simple donde podés cargar productos, buscar clientes y cobrar en efectivo o tarjeta.'
            },
            {
                type: 'new',
                title: 'Control de tus Productos',
                description: 'Cargá todo tu stock y dejá que Stockcito te avise cuando te estás quedando sin mercadería.'
            },
            {
                type: 'new',
                title: 'Mirá cómo crece tu Negocio',
                description: 'Un resumen visual con lo que vas vendiendo en el día y cuáles son tus productos estrella.'
            },
            {
                type: 'improvement',
                title: 'Funciona en tu Celu y tu Compu',
                description: 'Podés usar el sistema desde cualquier lado, ya sea una tablet en el local o tu celular mientras estás afuera.'
            }
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

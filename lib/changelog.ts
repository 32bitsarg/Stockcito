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
        version: '0.2.2',
        date: '2026-03-04',
        title: 'Mejoras en el POS, Seguridad y Experiencia de Usuario 🛡️⚡',
        description: 'Actualizamos el punto de venta con nuevas funcionalidades, reforzamos la seguridad de tus datos y pulimos la interfaz.',
        changes: [
            {
                type: 'fix',
                title: 'Protección Reforzada de Datos',
                description: 'Corregimos una vulnerabilidad que, en teoría, podía permitir acceder a información de otro comercio. Ahora cada negocio tiene sus datos 100% aislados y protegidos.'
            },
            {
                type: 'new',
                title: 'Elegí Cómo Te Pagan',
                description: 'Ahora al cobrar podés elegir entre Efectivo, Tarjeta o Transferencia con un solo toque. Ya no queda todo registrado como efectivo.'
            },
            {
                type: 'new',
                title: 'Aviso de Nueva Versión',
                description: 'Cuando actualicemos Stockcito, te va a aparecer un cartelito avisándote qué hay de nuevo. Así siempre estás al tanto de las mejoras.'
            },
            {
                type: 'improvement',
                title: 'Terminal de Venta más Estable',
                description: 'Eliminamos errores internos que aparecían al procesar ventas. Ahora todo funciona de forma más limpia y sin advertencias en el sistema.'
            },
            {
                type: 'fix',
                title: 'Ventana de Cambio de Usuario Arreglada',
                description: 'Corregimos la ventana que aparecía al querer cambiar de usuario. Antes se veía rota y pegada arriba de la pantalla, ahora se abre centrada como corresponde.'
            },
            {
                type: 'improvement',
                title: 'Barra Superior más Limpia',
                description: 'Sacamos el botón de "Ir a la página principal" de la barra de arriba para que quede más despejada y solo tenga los accesos que realmente usás.'
            },
            {
                type: 'improvement',
                title: 'Logo del Menú con más Espacio',
                description: 'Agregamos más aire al nombre y logo de Stockcito en el menú lateral para que no quede tan apretado contra los bordes.'
            },
            {
                type: 'improvement',
                title: 'Dashboard más Cómodo en el Celular',
                description: 'Rediseñamos cómo se ven las tarjetas y gráficos del dashboard en pantallas chicas. Ahora todo es más compacto y necesitás menos scroll para ver tus métricas.'
            },
            {
                type: 'new',
                title: 'Escáner de Código de Barras con Cámara',
                description: 'Desde el celular podés escanear códigos de barras con la cámara para agregar productos al carrito. Soporta todos los códigos de productos argentinos y etiquetas de balanza.'
            },
            {
                type: 'new',
                title: 'Generador de Códigos de Barras',
                description: 'Si tenés productos propios, ahora podés generar códigos de barras EAN-13 únicos e imprimir etiquetas directo desde Stockcito. Elegí cuántas etiquetas querés por producto y listo.'
            },
            {
                type: 'new',
                title: 'Etiquetas Sueltas sin Producto',
                description: 'Podés crear etiquetas con código de barras sin vincularlas a un producto. Cuando después crees el producto con ese código, se vincula automáticamente.'
            },
            {
                type: 'new',
                title: 'Indicador de Novedades en el Menú',
                description: 'Las secciones con funciones nuevas ahora muestran un cartelito "Nuevo" en el menú lateral que desaparece automáticamente después de unas horas.'
            }
        ]
    },
    {
        version: '0.2.1',
        date: '2026-02-26',
        title: 'Parche de Seguridad Crítico 🛡️',
        description: 'Actualización de emergencia para proteger la integridad y privacidad de tus datos.',
        changes: [
            {
                type: 'fix',
                title: 'Protección de Datos',
                description: 'Implementamos un parche de seguridad de alta prioridad para asegurar que tu información comercial se mantenga estrictamente privada y accesible únicamente por los miembros de tu negocio.'
            }
        ]
    },
    {
        version: '0.2.0',
        date: '2026-02-26',
        title: 'Ventas por Peso y Escáner de Balanzas ⚖️',
        description: '¡Ahora podés vender fiambres, quesos o verduras por gramos! Adaptamos todo el sistema para que leer y gestionar el peso sea comodísimo.',
        changes: [
            {
                type: 'new',
                title: 'Nuevos Productos "Pesables"',
                description: 'Al crear un producto vas a poder elegir si "Se vende por peso". Podrás cargar el precio de 1 Kilo, administrar el stock midiendo los gramos, y el sistema hará los cálculos por vos.'
            },
            {
                type: 'new',
                title: 'Soporte para Balanzas de Mostrador',
                description: 'Caja conectada: Si tenés una balanza (como Kretz o Systel) que imprime un código de barras con el peso, pasá el lector y Stockcito sumará exactamente los gramos reales al carrito.'
            },
            {
                type: 'new',
                title: 'Balanza Virtual y Botones Rápidos',
                description: 'Si cortás fiambrería a mano, inventamos un panel para agregar súper rápido: 100g, 250g o medio kilo tocando un solo botón en la pantalla de cobro.'
            },
            {
                type: 'improvement',
                title: 'Inventario mucho más inteligente',
                description: 'Mejoramos la tabla de tus productos. En los artículos que vendas por peso, vas a visualizar siempre el valor de "Precio x 100gr", para ajustarte al estándar de fiambrerías y verdulerías.'
            },
            {
                type: 'improvement',
                title: 'Tickets Transparentes',
                description: 'Tus clientes van a ver impreso claramente la cantidad de "GR" (Gramos) o "KG" (Kilos) de los artículos pesados que se están llevando.'
            },
            {
                type: 'improvement',
                title: 'Suscripciones Mejoradas',
                description: 'Perfeccionamos el plan Emprendedor con MercadoPago para que la gestión de facturación sea infalible y transparente a la hora de suscribirte.'
            }
        ]
    },
    {
        version: '0.1.8',
        date: '2026-02-19',
        title: 'Sincronización en Tiempo Real & Mejoras de Planes ⚡',
        description: 'Mejoramos la forma en que Stockcito guarda tu información para que todo sea instantáneo y más seguro.',
        changes: [
            {
                type: 'new',
                title: 'Reflejo Instantáneo en Pantalla',
                description: 'Ahora cuando creás, editás o eliminás un producto, cliente, proveedor o categoría, los cambios aparecen al instante sin necesidad de actualizar la página (F5).'
            },
            {
                type: 'improvement',
                title: 'Sistema de Suscripciones Renovado',
                description: 'Arreglamos los límites de uso. Ahora si estás probando la plataforma (Período de Prueba), vas a tener acceso a todas las funciones premium completas por 14 días.'
            },
            {
                type: 'fix',
                title: 'Descuentos y Empleados Fluidos',
                description: 'Las activaciones y desactivaciones de descuentos y los cambios en el equipo de empleados ahora también se reflejan automáticamente en todo el sistema.'
            },
            {
                type: 'fix',
                title: 'Anulaciones de Venta Mejoradas',
                description: 'Al anular o devolver una venta, el dinero y los productos vuelven a su lugar, y ahora tu historial de ventas se refresca solo, de manera inmediata.'
            }
        ]
    },
    {
        version: '0.1.7',
        date: '2026-02-16',
        title: 'Arquitectura Offline-First & Sincronización Inteligente 📡',
        description: 'Hemos transformado Stockcito para que tu negocio nunca se detenga, incluso si te quedás sin internet.',
        changes: [
            {
                type: 'new',
                title: 'Modo Offline Completo',
                description: 'Ahora podés navegar por todas las secciones, realizar ventas y crear clientes sin conexión a internet.'
            },
            {
                type: 'new',
                title: 'Sincronización Automática',
                description: 'Tus operaciones offline se guardan localmente y se sincronizan solas apenas recuperás la conexión.'
            },
            {
                type: 'improvement',
                title: 'Resolución de Conflictos de Stock',
                description: 'Implementamos el sistema "Vende Siempre, Alerta Después" para manejar conflictos de stock entre múltiples cajeros offline.'
            },
            {
                type: 'improvement',
                title: 'Alertas de Stock Negativo',
                description: 'Nuevo banner en el Dashboard para que los administradores revisen y resuelvan inconsistencias de stock tras una sincronización.'
            },
            {
                type: 'improvement',
                title: 'Indicadores de Conexión "En Vivo"',
                description: 'Agregamos puntos de estado (🟢/🔴) y el timestamp de la última sincronización al Dashboard.'
            }
        ]
    },
    {
        version: '0.1.6',
        date: '2026-02-15',
        title: 'Preparación para el modo Offline 🛠️',
        description: 'Mejoras internas en la gestión de datos para soportar el funcionamiento sin conexión.',
        changes: [
            {
                type: 'improvement',
                title: 'Migración de Páginas a Client Components',
                description: 'Refactorizamos las páginas principales para soportar el cacheo de datos en el cliente.'
            },
            {
                type: 'fix',
                title: 'Estabilidad de Sesión',
                description: 'Mejoramos la validación de sesiones para evitar desconexiones accidentales.'
            }
        ]
    },
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

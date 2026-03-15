import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Guía de Usuario y Soporte | Stockcito - Sistema de Gestión",
    description: "Aprendé a usar Stockcito: atajos de teclado para ventas rápidas, gestión de inventario offline y configuración de roles. La ayuda que tu comercio en Pergamino necesita para crecer.",
    alternates: {
        canonical: 'https://stockcito.com/docs',
    },
    openGraph: {
        title: "Documentación Oficial de Stockcito | Centro de Ayuda",
        description: "Manual completo para digitalizar tu comercio. Punto de venta, control de stock y tutoriales técnicos.",
        type: "article",
        url: "https://stockcito.com/docs",
    },
};

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": "https://stockcito.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Documentación",
                "item": "https://stockcito.com/docs"
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
            />
            {children}
        </>
    );
}

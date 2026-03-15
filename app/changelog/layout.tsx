import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Novedades y Actualizaciones | Stockcito - Evolución POS",
    description: "Consultá las últimas mejoras y nuevas funcionalidades de Stockcito. Seguimos evolucionando nuestro sistema POS y gestión de inventario para potenciar tu comercio.",
    alternates: {
        canonical: 'https://stockcito.com/changelog',
    },
    openGraph: {
        title: "Changelog de Stockcito | Registro de Mejoras",
        description: "Descubrí qué hay de nuevo: mejoras en el punto de venta, control de stock offline y nuevas herramientas de facturación.",
        type: "website",
        url: "https://stockcito.com/changelog",
    },
};

export default function ChangelogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

import type { Metadata, Viewport } from "next";
import { Outfit, Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme-provider";
import { RegisterSW } from "@/components/pwa/register-sw";
import QueryProvider from "@/components/providers/query-provider";
import { OfflineBanner } from "@/components/offline/offline-banner";
import { SyncService } from "@/components/offline/sync-service";
import { validateEnv } from "@/lib/env";
import { Toaster } from "sonner";
import { UpdateNotifier } from "@/components/layout/update-notifier";
import Script from "next/script";

// Validate environment variables at startup
if (typeof window === 'undefined') {
  validateEnv();
}

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Stockcito — Sistema de Gestión y Inventario para Comercios",
  description: "Stockcito: La solución integral para control de stock, POS y facturación. Automatizá tus precios ante la inflación y simplificá tus ventas. Probá 7 días gratis.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Stockcito",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Stockcito — Controlá tu Comercio con Inteligencia',
    description: 'Sistema POS y gestión de inventario optimizado para la realidad argentina. Multiusuario, offline-first y reportes fiscales automáticos.',
    url: 'https://stockcito.com',
    siteName: 'Stockcito',
    locale: 'es_AR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://stockcito.com',
  },
  keywords: ["sistema pos", "control de stock", "inventario offline", "pergamino", "gestión comercial", "pwa", "argentina"],
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icons/icon.svg",
    apple: "/apple-touch-icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-S55PN94557"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-S55PN94557');
          `}
        </Script>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Stockcito",
              "operatingSystem": "Windows, Linux, macOS",
              "applicationCategory": "BusinessApplication",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "reviewCount": "12"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "ARS",
                "description": "Prueba gratuita de 7 días"
              },
              "areaServed": {
                "@type": "City",
                "name": "Pergamino",
                "sameAs": "https://es.wikipedia.org/wiki/Pergamino_(Buenos_Aires)"
              },
              "author": {
                "@type": "Organization",
                "name": "Stockcito Node Systems"
              }
            })
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} ${robotoMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <OfflineBanner />
            <SyncService />
            <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
              {children}
            </main>
            <RegisterSW />
            <Toaster richColors closeButton position="top-center" />
            <UpdateNotifier />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

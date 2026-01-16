import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme-provider";
import { RegisterSW } from "@/components/pwa/register-sw";
import { validateEnv } from "@/lib/env";

// Validate environment variables at startup
if (typeof window === 'undefined') {
  validateEnv();
}

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Stockcito — Sistema de gestión para comercios",
  description: "Stockcito: gestión de stock, POS, facturación y reportes orientados a comercios locales. Simplifica ventas, controla IVA y automatiza tu inventario.",
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
    title: 'Stockcito — Sistema de gestión para comercios',
    description: 'POS, facturación y control de inventario optimizado para comercios en Argentina. Precios sin IVA, IVA desglosado y reportes fiscales.',
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
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
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
            {children}
          </main>
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  );
}

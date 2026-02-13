import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme-provider";
import { RegisterSW } from "@/components/pwa/register-sw";
import { validateEnv } from "@/lib/env";
import { Toaster } from "sonner";

// Validate environment variables at startup
if (typeof window === 'undefined') {
  validateEnv();
}

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} ${robotoMono.variable} antialiased`}
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
          <Toaster richColors closeButton position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}

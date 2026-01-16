/** @type {import('next').NextConfig} */
const nextConfig = {
    // Output standalone para empaquetado con Electron
    output: 'standalone',

    // Experimental settings para mejorar estabilidad
    experimental: {
        // Optimiza la carga de chunks en navegación - mejor tree-shaking
        optimizePackageImports: [
            'lucide-react',
            'date-fns',
            'recharts',
            '@ark-ui/react',
            'framer-motion',
            'zod',
        ],
    },

    // Mejorar estabilidad en desarrollo
    onDemandEntries: {
        // period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 60 * 1000,
        // number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 5,
    },
};

export default nextConfig;

#!/bin/bash

# Script para preparar y construir la app de Electron para Linux
# Ejecutar desde el directorio raíz del proyecto

set -e

echo "🚀 Preparando Stockcito para Linux..."

# 1. Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# 2. Generar cliente Prisma
echo "🗄️  Generando cliente Prisma..."
npx prisma generate

# 3. Build de Next.js
echo "🔨 Construyendo Next.js..."
npm run build

# 4. Copiar archivos estáticos al standalone
echo "📁 Copiando archivos estáticos..."
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# 5. Copiar Prisma al standalone
echo "🗃️  Copiando configuración de Prisma..."
mkdir -p .next/standalone/prisma
cp prisma/schema.prisma .next/standalone/prisma/
if [ -f "prisma/dev.db" ]; then
    cp prisma/dev.db .next/standalone/prisma/
fi

# 6. Build de Electron
echo "🖥️  Construyendo aplicación Electron..."
npx electron-builder --linux --config electron-builder.json

echo ""
echo "✅ Build completado!"
echo "📍 Los instaladores están en: dist-electron/"
echo ""
ls -la dist-electron/ 2>/dev/null || echo "Verifica el directorio dist-electron/"

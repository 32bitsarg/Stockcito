#!/bin/bash
set -e

echo "🔨 Building Next.js..."
npm run build

echo "📦 Building Electron package..."
npx electron-builder build --linux deb --dir

echo "📂 Copying standalone files..."
RESOURCES_DIR="dist-electron/linux-unpacked/resources"

# Remove incomplete standalone copy
rm -rf "$RESOURCES_DIR/standalone"

# Copy full standalone with node_modules
cp -r .next/standalone "$RESOURCES_DIR/"

# Copy static files
cp -r .next/static "$RESOURCES_DIR/standalone/.next/"

# Copy public files
cp -r public "$RESOURCES_DIR/standalone/"

# Copy prisma
cp -r prisma "$RESOURCES_DIR/standalone/"

echo "📦 Building final .deb package..."
npx electron-builder build --linux deb --prepackaged dist-electron/linux-unpacked

echo "✅ Build complete!"
ls -lh dist-electron/*.deb

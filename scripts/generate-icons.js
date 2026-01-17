const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');
const svgPath = path.join(iconsDir, 'icon.svg');

async function generateIcons() {
    // Read SVG
    const svgBuffer = fs.readFileSync(svgPath);

    for (const size of sizes) {
        const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(outputPath);

        console.log(`Generated: icon-${size}x${size}.png`);
    }

    // Also create apple-touch-icon.png (180x180)
    await sharp(svgBuffer)
        .resize(180, 180)
        .png()
        .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
    console.log('Generated: apple-touch-icon.png');

    // Create favicon.ico (32x32 PNG, browsers accept it)
    await sharp(svgBuffer)
        .resize(32, 32)
        .png()
        .toFile(path.join(__dirname, '../public/favicon.png'));
    console.log('Generated: favicon.png');

    console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);

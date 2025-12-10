const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'icon.svg');
const pngPath = path.join(__dirname, 'public', 'icon.png');
const icoPath = path.join(__dirname, 'public', 'icon.ico');

async function generateIcons() {
    // Dynamic import for ESM module
    const pngToIco = (await import('png-to-ico')).default;
    
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate PNG 512x512
    await sharp(svgBuffer)
        .resize(512, 512)
        .png()
        .toFile(pngPath);
    console.log('✅ Generated icon.png (512x512)');

    // Generate multiple PNG sizes for ICO
    const sizes = [16, 32, 48, 64, 128, 256];
    const pngBuffers = [];
    
    for (const size of sizes) {
        const buffer = await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toBuffer();
        pngBuffers.push(buffer);
    }
    
    // Convert to ICO
    const icoBuffer = await pngToIco(pngBuffers);
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('✅ Generated icon.ico');
    
    console.log('');
    console.log('🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);

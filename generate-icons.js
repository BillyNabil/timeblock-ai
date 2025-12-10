const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'icon.svg');
const pngPath = path.join(__dirname, 'public', 'icon.png');
const png1024Path = path.join(__dirname, 'build', 'icon.png');

async function generateIcons() {
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Create build folder if not exists
    if (!fs.existsSync(path.join(__dirname, 'build'))) {
        fs.mkdirSync(path.join(__dirname, 'build'));
    }

    // Generate PNG 512x512 for public
    await sharp(svgBuffer)
        .resize(512, 512)
        .png()
        .toFile(pngPath);
    console.log('✅ Generated public/icon.png (512x512)');

    // Generate PNG 1024x1024 for electron-icon-builder
    await sharp(svgBuffer)
        .resize(1024, 1024)
        .png()
        .toFile(png1024Path);
    console.log('✅ Generated build/icon.png (1024x1024)');
    
    console.log('');
    console.log('🎉 Now run: npx electron-icon-builder --input=build/icon.png --output=build');
}

generateIcons().catch(console.error);

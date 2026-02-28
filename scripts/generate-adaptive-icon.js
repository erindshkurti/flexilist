const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'assets', 'images', 'logo.png');
const outputPath = path.join(__dirname, '..', 'assets', 'images', 'adaptive-icon-foreground.png');

async function createPaddedIcon() {
    try {
        // Android adaptive icons need the actual logo to be within the safe zone
        // Standard size is 108x108 dp, with the inner 72dp as the safe zone
        // For a 1024x1024 image, we want the logo to be about 60-65% of the total size

        // 1. Read the original image and resize it smaller
        const resizedLogo = await sharp(inputPath)
            .resize({
                width: 614, // ~60% of 1024
                height: 614,
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toBuffer();

        // 2. Create a transparent 1024x1024 background and composite the logo in the center
        await sharp({
            create: {
                width: 1024,
                height: 1024,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        })
            .composite([
                { input: resizedLogo, gravity: 'center' }
            ])
            .png()
            .toFile(outputPath);

        console.log(`Successfully created padded icon at: ${outputPath}`);
    } catch (error) {
        console.error('Error creating adaptive icon:', error);
    }
}

createPaddedIcon();


import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactsDir = path.join(__dirname, '../public/artifacts');

async function convertImages() {
    if (!fs.existsSync(artifactsDir)) {
        console.error(`Directory not found: ${artifactsDir}`);
        return;
    }

    const files = fs.readdirSync(artifactsDir);
    const pngFiles = files.filter(file => file.toLowerCase().endsWith('.png'));

    console.log(`Found ${pngFiles.length} PNG files to convert.`);

    let convertedCount = 0;
    let errorCount = 0;

    for (const file of pngFiles) {
        const inputPath = path.join(artifactsDir, file);
        const outputPath = path.join(artifactsDir, file.replace(/\.png$/i, '.webp'));

        // Skip if webp already exists (optional, but good for idempotency, effectively overwriting is requested implicitly by "convert")
        // User asked "convert and save", implying update.

        try {
            await sharp(inputPath)
                .webp({ quality: 80 })
                .toFile(outputPath);

            console.log(`Converted: ${file} -> ${path.basename(outputPath)}`);
            convertedCount++;
        } catch (err) {
            console.error(`Failed to convert ${file}:`, err);
            errorCount++;
        }
    }

    console.log(`\nConversion complete.`);
    console.log(`Success: ${convertedCount}`);
    console.log(`Errors: ${errorCount}`);
}

convertImages();

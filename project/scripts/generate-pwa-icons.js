import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [192, 512];
const sourceImage = path.join(__dirname, '../public/ah_expense_gold_logo.png');
const outputDir = path.join(__dirname, '../public');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate regular icons
sizes.forEach(size => {
  sharp(sourceImage)
    .resize(size, size)
    .toFile(path.join(outputDir, `pwa-${size}x${size}.png`))
    .catch(err => console.error(`Error generating ${size}x${size} icon:`, err));
});

// Generate maskable icons (with padding)
sizes.forEach(size => {
  // For maskable icons, we need to add padding (40% of the size)
  const padding = Math.floor(size * 0.4);
  const contentSize = size - (padding * 2);

  sharp(sourceImage)
    .resize(contentSize, contentSize)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(path.join(outputDir, `pwa-maskable-${size}x${size}.png`))
    .catch(err => console.error(`Error generating maskable ${size}x${size} icon:`, err));
}); 
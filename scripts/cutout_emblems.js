const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const brainDir = 'C:/Users/DELL/.gemini/antigravity-ide/brain/ab7c7402-f82e-43c1-add9-faef2a06dc8b';

// Locate files
const files = fs.readdirSync(brainDir);
const ownershipFile = files.find(f => f.startsWith('val_ownership_3d_') && f.endsWith('.jpg'));
const excellenceFile = files.find(f => f.startsWith('val_excellence_3d_') && f.endsWith('.jpg'));
const socialFile = files.find(f => f.startsWith('val_social_3d_') && f.endsWith('.jpg'));

if (!ownershipFile || !excellenceFile || !socialFile) {
  console.error('Could not find all emblem files:', { ownershipFile, excellenceFile, socialFile });
  process.exit(1);
}

console.log('Ownership:', ownershipFile);
console.log('Excellence:', excellenceFile);
console.log('Social:', socialFile);

async function chromaKeyGreen(srcPath, destPathLight, destPathDark) {
  console.log('Processing Green Chroma:', srcPath);
  const img = await Jimp.read(srcPath);
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  // Clone for light and dark
  const out = img.clone();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const col = img.getPixelColor(x, y);
      let r = (col >> 24) & 255;
      let g = (col >> 16) & 255;
      let b = (col >> 8) & 255;

      const maxRB = Math.max(r, b);
      const greenDiff = g - maxRB;

      if (greenDiff > 35 && g > 85) {
        // Transparent
        out.setPixelColor(0, x, y);
      } else if (greenDiff > 8 && g > 65) {
        // Soft antialiasing boundary
        const t = (greenDiff - 8) / 27; // 0 to 1
        const alpha = Math.round(255 * (1 - t));
        g = Math.round(maxRB * 0.9 + g * 0.1); // Despill
        const newCol = ((r << 24) | (g << 16) | (b << 8) | alpha) >>> 0;
        out.setPixelColor(newCol, x, y);
      } else {
        // Despill foreground if slight green spill on edges
        if (g > maxRB && maxRB > 40) {
          g = Math.round(maxRB * 0.95);
          const newCol = ((r << 24) | (g << 16) | (b << 8) | 255) >>> 0;
          out.setPixelColor(newCol, x, y);
        }
      }
    }
  }

  // Save 512x512 PNG
  const resized = out.clone().resize({ w: 512, h: 512 });
  await resized.write(destPathLight);
  await resized.write(destPathDark);
  console.log('Saved to', destPathLight, 'and', destPathDark);
}

async function chromaKeyMagenta(srcPath, destPathLight, destPathDark) {
  console.log('Processing Magenta Chroma:', srcPath);
  const img = await Jimp.read(srcPath);
  const w = img.bitmap.width;
  const h = img.bitmap.height;

  const out = img.clone();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const col = img.getPixelColor(x, y);
      let r = (col >> 24) & 255;
      let g = (col >> 16) & 255;
      let b = (col >> 8) & 255;

      // Magenta detection: high R and high B, lower G
      const minRB = Math.min(r, b);
      const magentaDiff = minRB - g;

      if (magentaDiff > 35 && minRB > 90) {
        // Transparent
        out.setPixelColor(0, x, y);
      } else if (magentaDiff > 8 && minRB > 65) {
        // Soft antialiasing boundary
        const t = (magentaDiff - 8) / 27;
        const alpha = Math.round(255 * (1 - t));
        // Despill magenta: pull r and b down towards g
        r = Math.round(g * 0.8 + r * 0.2);
        b = Math.round(g * 0.8 + b * 0.2);
        const newCol = ((r << 24) | (g << 16) | (b << 8) | alpha) >>> 0;
        out.setPixelColor(newCol, x, y);
      } else {
        // Subtle despill on edges
        if (minRB > g * 1.2 && g > 40) {
          r = Math.round(g * 1.05);
          b = Math.round(g * 1.05);
          const newCol = ((r << 24) | (g << 16) | (b << 8) | 255) >>> 0;
          out.setPixelColor(newCol, x, y);
        }
      }
    }
  }

  const resized = out.clone().resize({ w: 512, h: 512 });
  await resized.write(destPathLight);
  await resized.write(destPathDark);
  console.log('Saved to', destPathLight, 'and', destPathDark);
}

async function run() {
  await chromaKeyGreen(
    path.join(brainDir, ownershipFile),
    'public/images/3d/emblem_ownership_light.png',
    'public/images/3d/emblem_ownership_dark.png'
  );

  await chromaKeyGreen(
    path.join(brainDir, excellenceFile),
    'public/images/3d/emblem_excellence_light.png',
    'public/images/3d/emblem_excellence_dark.png'
  );

  await chromaKeyMagenta(
    path.join(brainDir, socialFile),
    'public/images/3d/emblem_social_light.png',
    'public/images/3d/emblem_social_dark.png'
  );

  console.log('--- ALL 3 EMBLEMS SUCCESSFULLY CONVERTED TO TRANSPARENT 3D PNGs! ---');
}

run().catch(console.error);

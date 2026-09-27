const fs = require('fs');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

console.log('Generating 100% exact high-contrast transparent logos...');

const rawJpg = fs.readFileSync('public/uploads/logos/AE-Logo-1772929160806.jpg');
const decoded = jpeg.decode(rawJpg);

// Tight crop bounds:
const cropX = 230;
const cropY = 290;
const cropW = 7356 - cropX + 15;
const cropH = 1308 - cropY + 15;

const outW = 2400;
const outH = Math.round(cropH * (outW / cropW));
console.log(`Cropping (${cropX}, ${cropY}, ${cropW}, ${cropH}) -> (${outW}x${outH})`);

const pngLight = new PNG({ width: outW, height: outH });
const pngDark = new PNG({ width: outW, height: outH });

const scaleX = cropW / outW;
const scaleY = cropH / outH;

for (let y = 0; y < outH; y++) {
  for (let x = 0; x < outW; x++) {
    const srcX = Math.min(Math.floor(cropX + x * scaleX), decoded.width - 1);
    const srcY = Math.min(Math.floor(cropY + y * scaleY), decoded.height - 1);
    const srcIdx = (srcY * decoded.width + srcX) * 4;
    const destIdx = (y * outW + x) * 4;

    const r = decoded.data[srcIdx];
    const g = decoded.data[srcIdx + 1];
    const b = decoded.data[srcIdx + 2];

    const brightness = (r + g + b) / 3;

    // Background is pure white (255,255,255)
    let alpha = 255;
    if (r > 230 && g > 230 && b > 230) {
      const diff = 255 - brightness;
      alpha = Math.min(255, Math.max(0, Math.round(diff * 14)));
    }

    // Exact sections:
    const isTagline = srcY > 1080;
    const isApparelWord = !isTagline && srcX >= 1500 && srcX < 4260;
    const isEmporiumWord = !isTagline && srcX >= 4260;
    const isEmblem = srcX < 1500;

    // Inside emblem, red pixels vs black pixels:
    // Red 'A' pixels have r > 110 and r > g + 25
    const isEmblemRed = isEmblem && (r > 110 && (r - g > 25) && (r - b > 25));

    // --- LIGHT MODE LOGO ---
    // Perfect corporate red and deep black, 100% transparent background
    pngLight.data[destIdx] = r;
    pngLight.data[destIdx + 1] = g;
    pngLight.data[destIdx + 2] = b;
    pngLight.data[destIdx + 3] = alpha;

    // --- DARK MODE LOGO ---
    pngDark.data[destIdx + 3] = alpha;

    if (isApparelWord || isEmblemRed) {
      // Red elements in dark mode: vibrant luminous crimson
      // Enhances visibility on dark navy background
      pngDark.data[destIdx] = Math.min(255, Math.round(r * 1.05 + 10));
      pngDark.data[destIdx + 1] = Math.max(0, Math.round(g * 0.85));
      pngDark.data[destIdx + 2] = Math.max(0, Math.round(b * 0.85));
    } else {
      // All black/dark elements (EMPORIUM, Tagline, E in emblem) -> brilliant silver-white
      if (isEmporiumWord) {
        // EMPORIUM in dark mode: pure crisp white
        const val = Math.min(255, Math.max(240, Math.round(255 - brightness * 0.15)));
        pngDark.data[destIdx] = val;
        pngDark.data[destIdx + 1] = val;
        pngDark.data[destIdx + 2] = val;
      } else if (isTagline) {
        // Tagline: silver-white
        const val = Math.min(245, Math.max(210, Math.round(240 - brightness * 0.2)));
        pngDark.data[destIdx] = val;
        pngDark.data[destIdx + 1] = val;
        pngDark.data[destIdx + 2] = val;
      } else {
        // E in emblem: chrome silver
        const val = Math.min(255, Math.max(220, Math.round(250 - brightness * 0.25)));
        pngDark.data[destIdx] = val;
        pngDark.data[destIdx + 1] = val;
        pngDark.data[destIdx + 2] = val;
      }
    }
  }
}

fs.writeFileSync('public/uploads/logos/apparel-emporium-logo-light.png', PNG.sync.write(pngLight));
fs.writeFileSync('public/uploads/logos/apparel-emporium-logo-dark.png', PNG.sync.write(pngDark));
fs.writeFileSync('public/images/logo_light.png', PNG.sync.write(pngLight));
fs.writeFileSync('public/images/logo_dark.png', PNG.sync.write(pngDark));

console.log('Saved 100% exact transparent logos for light and dark modes!');

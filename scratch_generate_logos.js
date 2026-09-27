const fs = require('fs');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

console.log('Generating tight-cropped transparent logo assets...');

const rawJpg = fs.readFileSync('public/uploads/logos/AE-Logo-1772929160806.jpg');
const decoded = jpeg.decode(rawJpg);

// Content bounds discovered: x: 244 to 7356 (w: 7112), y: 304 to 1308 (h: 1004)
// Let's add slight margin (e.g. 20px)
const cropX = Math.max(0, 244 - 30);
const cropY = Math.max(0, 304 - 20);
const cropW = Math.min(decoded.width - cropX, 7112 + 60);
const cropH = Math.min(decoded.height - cropY, 1004 + 40);

console.log('Cropping bounds:', { cropX, cropY, cropW, cropH });

// Target high-definition output width: 2400px (retina sharp, fast loading)
const outW = 2400;
const outH = Math.round(cropH * (outW / cropW));
console.log('Output dimensions:', outW, 'x', outH);

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

    // Determine if pixel is white background
    // Smooth alpha calculation for anti-aliasing
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const brightness = (r + g + b) / 3;

    let alpha = 255;
    if (r > 235 && g > 235 && b > 235) {
      // Background is near white
      const diff = 255 - brightness;
      alpha = Math.min(255, Math.max(0, Math.round(diff * 14)));
    }

    // Is it part of the red 'A' or 'APPAREL'?
    // Red pixels have high R, low G, low B
    const isRed = r > 130 && (r - g > 40) && (r - b > 40);

    // Light version: transparent background, keep vibrant original colors
    pngLight.data[destIdx] = r;
    pngLight.data[destIdx + 1] = g;
    pngLight.data[destIdx + 2] = b;
    pngLight.data[destIdx + 3] = alpha;

    // Dark version:
    // If red, keep vibrant ruby red (enhance slightly for dark mode pop)
    // If dark/black (EMPORIUM, tagline, E part), invert to crisp silver-white
    pngDark.data[destIdx + 3] = alpha;
    if (isRed) {
      // Boost red saturation for dark navy contrast
      pngDark.data[destIdx] = Math.min(255, Math.round(r * 1.08));
      pngDark.data[destIdx + 1] = Math.round(g * 0.9);
      pngDark.data[destIdx + 2] = Math.round(b * 0.9);
    } else {
      // Dark pixel (black/dark grey) -> Map to elegant platinum/silver-white
      // original brightness ~ 0-80 -> output ~ 240-255
      const silver = Math.min(255, Math.max(220, Math.round(255 - brightness * 0.3)));
      pngDark.data[destIdx] = silver;
      pngDark.data[destIdx + 1] = silver;
      pngDark.data[destIdx + 2] = silver;
    }
  }
}

// Write to files
fs.writeFileSync('public/uploads/logos/apparel-emporium-logo-light.png', PNG.sync.write(pngLight));
fs.writeFileSync('public/uploads/logos/apparel-emporium-logo-dark.png', PNG.sync.write(pngDark));
fs.writeFileSync('public/images/logo_light.png', PNG.sync.write(pngLight));
fs.writeFileSync('public/images/logo_dark.png', PNG.sync.write(pngDark));

console.log('Successfully generated transparent high-res logos for light and dark modes!');

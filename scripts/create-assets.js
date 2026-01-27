const fs = require('fs');
const path = require('path');

// Minimal valid 1x1 PNG (transparent pixel) - works for icon, favicon, adaptive-icon
const MINIMAL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIwAAAABJRU5ErkJggg==',
  'base64'
);

// Slightly larger placeholder for splash (Expo may require min dimensions - 1x1 can work for dev)
const assetsDir = path.join(__dirname, '..', 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const files = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'];
for (const file of files) {
  fs.writeFileSync(path.join(assetsDir, file), MINIMAL_PNG);
  console.log('Created', file);
}

console.log('Done. Replace these with 1024x1024 (icon), 2000x2000 (splash) PNGs for production.');

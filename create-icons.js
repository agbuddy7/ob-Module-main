/**
 * Create placeholder icon files for the extension
 * This is a temporary script - replace with actual icons later
 */

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
function createSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#667eea"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="${size * 0.6}" font-family="Arial, sans-serif">🔒</text>
</svg>`;
}

const iconsDir = path.join(__dirname, 'extension', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create placeholder icon files
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const svg = createSVG(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg);
  console.log(`Created icon${size}.svg`);
});

// Create a note file
fs.writeFileSync(path.join(iconsDir, 'README.txt'), 
  'These are placeholder SVG icons.\nReplace with proper PNG icons for production use.\n'
);

console.log('Icon placeholders created successfully!');

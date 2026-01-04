# 🔒 ob-module

A browser extension and web tool that scrambles images to increase the cost of AI scraping, using a keyless self-contained detection system.

## Features

- **Smart Scrambling**: Divides images into 64 tiles (8×8 grid) and shuffles them deterministically
- **Auto-Detection**: Scrambled images can be automatically detected and unscrambled - no keys needed!
- **Self-Contained**: All encoding information is embedded in the image itself via a marker column
- **Browser Extension**: Automatically unscramble images while browsing
- **Web App**: Standalone tool for scrambling/unscrambling without installing anything
- **72 Unique Patterns**: Uses seed-based shuffling with 72 possible combinations

## How It Works

### Core Concept

1. **Image Division**: Original image is divided into an 8×8 grid (64 tiles)
2. **Shuffling**: Tiles are shuffled using a deterministic seed-based algorithm
3. **Marker Column**: A 9th column is added containing:
   - 7 black tiles
   - 1 "negative" tile (inverted RGB of the original first tile)
4. **Encoding**: The position of the marker column (1-9) and the negative tile (1-8) encode the seed
5. **Result**: A 9×8 scrambled image that contains all information needed for unscrambling

### Encoding System

```
Column Position (C): 1-9 (where marker column is inserted)
Negative Position (N): 1-8 (row of negative tile within marker column)
Seed = (C - 1) × 8 + N
Range: 1 to 72
```

### Detection & Unscrambling

1. Check if image has 9:8 aspect ratio
2. Scan columns to find the marker (7 black + 1 non-black tile)
3. Extract seed from marker position
4. Regenerate shuffle pattern and reverse it
5. Verify by comparing inverted negative tile with reconstructed first tile
6. Reconstruct original 8×8 image

## Installation

### Browser Extension

**No build step required!** The extension works out-of-the-box:

1. Clone or download this repository:
   ```bash
   git clone https://github.com/agbuddy7/image-scrambler.git
   cd image-scrambler
   ```

2. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/` folder

That's it! No `npm install` or `npm run build` needed.

### Web App

The web app is available at `web-app/index.html` or can be tested using `test-manual.html` in the root directory. Simply open these files in your browser - no build step required!

## Usage

### Browser Extension

**Scrambling Images:**
1. Click the extension icon
2. Upload or drag-and-drop an image
3. Click "Scramble Image"
4. Download the scrambled result

**Auto-Unscrambling:**
- The extension automatically detects and unscrambles images as you browse
- Unscrambled images show a 🔓 badge
- Configure settings in the Options page

### Web App

**Scramble Tab:**
1. Upload an image
2. Click "Scramble Image"
3. View encoding information
4. Download scrambled image

**Unscramble Tab:**
1. Upload a scrambled image
2. Click "Unscramble Image"
3. View detection and verification status
4. Download original image

## Development

### Project Structure

```
image-scrambler/
├── core/                   # Core scrambling engine (source)
│   ├── prng.js            # Seeded PRNG (Mulberry32)
│   ├── canvas-utils.js    # Image manipulation helpers
│   ├── scrambler.js       # Main scramble logic
│   ├── detector.js        # Detection logic
│   └── unscrambler.js     # Reverse scramble logic
├── extension/             # Browser extension (no build needed!)
│   ├── core/             # Core files (copied for self-contained extension)
│   ├── manifest.json      # Chrome MV3 manifest
│   ├── popup/            # Extension popup
│   ├── content/          # Content scripts
│   ├── background/       # Service worker
│   └── options/          # Options page
├── web-app/              # Standalone web tool
│   ├── index.html
│   ├── app.js
│   └── styles.css
└── tests/                # Unit tests
    ├── scrambler.test.js
    └── detector.test.js
```

### Development Notes

**No Build Required**: The extension and core files use vanilla JavaScript (no ES6 modules) to work directly in browsers without any build step. Simply edit the files and reload the extension.

**Building (Optional)**: For the web app or if you want to bundle files:

```bash
# Install dependencies (only if using webpack)
npm install

# Production build
npm run build

# Development build with watch mode
npm run watch
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Technical Details

### Scrambling Algorithm

1. Load image into canvas
2. Calculate tile dimensions: `tileWidth = width/8`, `tileHeight = height/8`
3. Extract 64 tiles into array
4. Generate random column position (1-9) and negative position (1-8)
5. Calculate seed: `seed = (columnPosition - 1) * 8 + negativePosition`
6. Use seeded PRNG with Fisher-Yates shuffle
7. Create negative tile: `RGB = 255 - originalRGB`
8. Assemble 9×8 output with marker column

### Detection Algorithm

1. Quick aspect ratio check (9:8 ≈ 1.125)
2. For each column, check if it matches marker pattern
3. Black tile detection: average RGB < 10
4. Extract seed from marker position
5. Return detection result

### Unscrambling Algorithm

1. Detect scrambled image and extract seed
2. Extract 64 scrambled tiles (skip marker column)
3. Generate same shuffle map using seed
4. Create and apply reverse shuffle map
5. Verify: invert negative tile and compare with first tile (95% threshold)
6. Assemble original 8×8 image

### PRNG: Mulberry32

Uses the Mulberry32 algorithm for deterministic pseudo-random number generation:
- Fast and efficient
- Good statistical properties
- Same seed always produces same sequence
- Perfect for reproducible shuffling

## Security Considerations

⚠️ **Important**: This is **visual obfuscation, NOT encryption**.

**What it does:**
- Increases cost of bulk AI scraping
- Requires custom code to unscramble at scale
- Protects casual browsing from automated scrapers

**What it doesn't do:**
- Provide cryptographic security
- Stop determined attackers
- Prevent manual reconstruction
- Protect against reverse engineering

**Use Cases:**
- Personal photos on social media
- Portfolio images from bulk scrapers
- Reducing unauthorized dataset collection
- Making scraping more expensive

## Browser Compatibility

- Chrome/Edge: Full support (Manifest V3)
- Firefox: Requires manifest adaptation
- Safari: Requires manifest adaptation

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Mulberry32 PRNG algorithm
- Canvas API for image manipulation
- Chrome Extension APIs

---

**Note**: This tool is designed to increase the cost of bulk scraping, not to provide absolute protection. Use it as one layer in a comprehensive content protection strategy.

# Quick Start Guide

Get started with Image Scrambler in 5 minutes!

## Installation

```bash
# Clone the repository
git clone https://github.com/agbuddy7/image-scrambler.git
cd image-scrambler

# Install dependencies
npm install

# Build the project
npm run build
```

## Option 1: Use the Web App (No Installation Required)

1. Start a local server:
   ```bash
   cd dist
   python3 -m http.server 8000
   ```

2. Open in your browser:
   - http://localhost:8000/web-app/index.html

3. Scramble an image:
   - Click the "Scramble" tab
   - Upload or drag-drop an image
   - Click "Scramble Image"
   - Download the result

4. Unscramble an image:
   - Click the "Unscramble" tab
   - Upload a scrambled image
   - Click "Unscramble Image"
   - Download the original

## Option 2: Install as Browser Extension

1. Build the project (if not already done):
   ```bash
   npm run build
   ```

2. Open Chrome and navigate to:
   ```
   chrome://extensions/
   ```

3. Enable "Developer mode" (toggle in top-right)

4. Click "Load unpacked"

5. Select the `dist/` folder from this project

6. The extension is now installed! 🎉

## Using the Extension

### Scramble Images

1. Click the extension icon in your browser toolbar
2. Upload an image or drag-and-drop
3. Click "Scramble Image"
4. View the encoding information (seed, column position, etc.)
5. Click "Download Scrambled" to save

### Auto-Unscramble While Browsing

The extension automatically detects and unscrambles images as you browse:

1. Navigate to any webpage with scrambled images
2. The extension automatically detects them (9:8 aspect ratio)
3. Images are unscrambled in real-time
4. A 🔓 badge appears on unscrambled images

### Configure Settings

1. Right-click the extension icon
2. Click "Options"
3. Toggle features:
   - Auto-unscramble images
   - Show unscramble badges
4. Click "Save Settings"

## Quick Test

Want to see it in action immediately?

1. Start a local server in the project root:
   ```bash
   python3 -m http.server 8000
   ```

2. Open the manual test page:
   - http://localhost:8000/test-manual.html

3. Follow the on-screen instructions:
   - Create Test Image
   - Scramble
   - Detect
   - Unscramble

## How It Works

### The Magic Behind the Scenes

1. **Scrambling**: Your image is divided into 64 tiles (8×8), shuffled using a seed, and a marker column is added (making it 9×8)

2. **Marker Column**: Contains 7 black tiles and 1 "negative" tile (inverted colors of the original first tile)

3. **Seed Encoding**: The position of the marker column (1-9) and negative tile (1-8) encode the seed used for shuffling

4. **Detection**: Automatically detects scrambled images by checking the 9:8 aspect ratio and scanning for the marker column

5. **Unscrambling**: Extracts the seed, regenerates the shuffle pattern, reverses it, and reconstructs the original image

### No Keys Needed!

Everything needed to unscramble is embedded in the image itself. No passwords, no databases, no servers!

## What's Next?

- Read the [full README](README.md) for detailed documentation
- Check out the [Testing Guide](TESTING.md) for comprehensive testing instructions
- Explore the code in `core/` to understand the algorithms
- Customize the UI in `extension/popup/` or `web-app/`

## Troubleshooting

### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Extension Doesn't Load
- Make sure you selected the `dist/` folder, not the root folder
- Check Chrome's extension page for error messages
- Try rebuilding: `npm run build`

### Web App Doesn't Work
- Make sure you're using a local server (not opening the HTML file directly)
- ES modules require a server to work
- Use Python's http.server or any other local server

### Tests Fail
```bash
# Run with correct Node options
NODE_OPTIONS='--experimental-vm-modules' npm test
```

## Need Help?

- Check the [README](README.md) for detailed information
- Read the [Testing Guide](TESTING.md) for testing instructions
- Open an issue on GitHub if you find a bug

## Security Note

⚠️ **Important**: This is visual obfuscation, NOT encryption!

- ✅ Good for: Protecting images from bulk AI scraping
- ✅ Good for: Making automated collection more expensive
- ❌ Not for: Protecting sensitive information
- ❌ Not for: Preventing determined attackers

Use this as part of a comprehensive content protection strategy, not as your only defense.

---

Happy scrambling! 🔒✨

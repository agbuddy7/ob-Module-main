# Image Scrambler Extension

Browser extension for scrambling images and automatically unscrambling them while browsing.

## Installation

**No build step required!** This extension works out-of-the-box.

### Chrome/Edge

1. Open `chrome://extensions/` (or `edge://extensions/` for Edge)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this `extension/` folder

That's it! The extension is now installed.

## Usage

### Scrambling Images

1. Click the extension icon in your browser toolbar
2. Upload or drag-and-drop an image
3. Click "Scramble Image"
4. Download the scrambled result

### Auto-Unscrambling

The extension automatically detects and unscrambles scrambled images as you browse the web:
- Unscrambled images show a 🔓 badge
- Configure auto-unscrambling in the extension options

## Development

This extension uses vanilla JavaScript with no build step required:
- All core functionality is in the `core/` directory
- Scripts are loaded via `<script>` tags (no ES6 modules)
- Edit files and reload the extension to see changes

## Files Structure

```
extension/
├── manifest.json          # Extension manifest (Chrome MV3)
├── core/                 # Core scrambling engine
│   ├── prng.js          # Seeded random number generator
│   ├── canvas-utils.js  # Image manipulation utilities
│   ├── scrambler.js     # Scrambling logic
│   ├── detector.js      # Detection logic
│   └── unscrambler.js   # Unscrambling logic
├── popup/               # Extension popup UI
│   ├── popup.html       # Popup interface
│   ├── popup.js         # Popup logic
│   └── popup.css        # Popup styles
├── content/             # Content scripts
│   ├── content.js       # Auto-unscrambling logic
│   └── content.css      # Badge styles
├── background/          # Background service worker
│   └── service-worker.js
├── options/             # Options page
│   ├── options.html
│   └── options.js
└── icons/              # Extension icons
```

## Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Edge (Manifest V3)
- ⚠️ Firefox - Requires manifest adaptation
- ⚠️ Safari - Requires manifest adaptation

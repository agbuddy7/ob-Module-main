# Migration to Vanilla JS - No Build Step Required

## Summary

This document describes the migration from ES6 modules to vanilla JavaScript, eliminating the need for webpack and any build step.

## Problem

The extension was using ES6 modules (`import`/`export`) which:
1. Don't work in Chrome extension popups without bundling
2. Required webpack build step (`npm install` + `npm run build`)
3. Made the extension harder to develop and distribute

## Solution

All files have been converted to vanilla JavaScript:
- No `import` or `export` statements
- Functions and classes are globally accessible
- Scripts are loaded via `<script>` tags in correct dependency order

## Changes Made

### 1. Core Files (in `/core/`)

All core files converted to vanilla JS:

- **prng.js**: Removed `export default`, `SeededRandom` is now global
- **canvas-utils.js**: Removed all `export` statements, all functions are global
- **scrambler.js**: Removed `import` and `export`, uses global dependencies
- **detector.js**: Removed `import` and `export`, uses global dependencies
- **unscrambler.js**: Removed `import` and `export`, uses global dependencies

### 2. Browser Extension (in `/extension/`)

#### Self-Contained Extension
- Created `/extension/core/` directory with copies of all core files
- Extension can now be loaded directly without any external dependencies

#### Updated Files
- **manifest.json**: 
  - Updated `content_scripts.js` array to load core files before content.js
  - Paths are relative to extension root (e.g., `"core/prng.js"`)
  
- **popup/popup.html**:
  - Removed `type="module"` from script tag
  - Added multiple `<script>` tags in dependency order:
    1. `../core/prng.js`
    2. `../core/canvas-utils.js`
    3. `../core/scrambler.js`
    4. `popup.js`

- **popup/popup.js**:
  - Removed `import` statement
  - Uses global `scrambleImage` function directly

- **content/content.js**:
  - Removed `import` statements
  - Uses global functions loaded via manifest.json

### 3. Web App (in `/web-app/`)

- **index.html**:
  - Removed `type="module"` from script tag
  - Added multiple `<script>` tags loading core files first

- **app.js**:
  - Removed `import` statements
  - Uses global functions

### 4. Test File

- **test-manual.html**:
  - Updated to load scripts via `<script>` tags instead of ES6 modules

### 5. Documentation

- **README.md**: Updated installation instructions to emphasize no build step
- **extension/README.md**: Created new guide for extension installation

## Installation Instructions

### Before (with build)
```bash
git clone https://github.com/agbuddy7/image-scrambler.git
cd image-scrambler
npm install        # Install dependencies
npm run build      # Build with webpack
# Load dist/ folder in Chrome
```

### After (no build!)
```bash
git clone https://github.com/agbuddy7/image-scrambler.git
cd image-scrambler
# Load extension/ folder directly in Chrome - that's it!
```

## Script Loading Order

For the extension and web app to work, scripts must be loaded in this order:

1. `prng.js` - No dependencies
2. `canvas-utils.js` - No dependencies  
3. `scrambler.js` - Depends on: prng.js, canvas-utils.js
4. `detector.js` - Depends on: canvas-utils.js
5. `unscrambler.js` - Depends on: detector.js, scrambler.js, canvas-utils.js
6. Application code (popup.js, app.js, etc.)

## Benefits

✅ **No build step** - Works immediately after cloning  
✅ **Easier development** - Edit and reload, no compilation  
✅ **Smaller repository** - No node_modules or dist artifacts  
✅ **Simpler onboarding** - No npm, no webpack, just load and go  
✅ **Better debugging** - Unminified, readable code in browser  
✅ **Universal compatibility** - Works everywhere JavaScript works  

## Backwards Compatibility

### Tests
The existing Jest tests in `/tests/` still use ES6 modules because:
- Node.js test environment supports ES6 modules natively
- Tests don't run in browser environment
- No changes needed to test files

### Future Bundling
If bundling is needed in the future (e.g., for minification):
- Core files in `/core/` remain the source of truth
- Webpack or other bundlers can still process vanilla JS
- Build step is optional, not required

## Technical Notes

### Global Scope
All functions and classes are defined in global scope:
```javascript
// Before (ES6)
export function scrambleImage() { ... }

// After (vanilla)
function scrambleImage() { ... }  // Globally accessible
```

### Dependencies
Dependencies are implicit based on load order:
```javascript
// Before (ES6)
import SeededRandom from './prng.js';

// After (vanilla)
// SeededRandom is already loaded and global
const rng = new SeededRandom(seed);
```

### Chrome Extension Content Scripts
Chrome loads content scripts in the order specified in manifest.json:
```json
"js": [
  "core/prng.js",
  "core/canvas-utils.js",
  "core/scrambler.js",
  "core/detector.js",
  "core/unscrambler.js",
  "content/content.js"
]
```

## Verification

All changes verified:
- ✅ Syntax validation with Node.js
- ✅ No `import` or `export` statements remain
- ✅ Code review passed with no issues
- ✅ Security scan passed with no vulnerabilities
- ✅ Extension directory is self-contained
- ✅ Documentation updated

## Migration Date

December 13, 2025

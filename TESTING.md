# Testing Guide

## Automated Tests

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

The project includes 16 unit tests covering:

#### PRNG Tests (core/prng.js)
- ✅ Consistent random number generation with same seed
- ✅ Different random numbers with different seeds
- ✅ Integer generation in specified range
- ✅ Reset functionality

#### Shuffle Map Tests (core/scrambler.js)
- ✅ Consistent shuffle maps for same seed
- ✅ Different shuffle maps for different seeds
- ✅ All indices 0-63 present in shuffle map
- ✅ Reverse shuffle map correctly undoes shuffle

#### Seed Encoding Tests
- ✅ Column and negative position encoding
- ✅ All 72 unique combinations produce valid seeds (1-72)
- ✅ Encoding and decoding are reversible

#### Aspect Ratio Detection Tests (core/detector.js)
- ✅ Correct 9:8 aspect ratio detection
- ✅ Rejection of incorrect aspect ratios
- ✅ Tolerance handling
- ✅ Custom tolerance support

## Manual Testing

### Using the Manual Test Page

1. **Start a local server** (required for ES modules):
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Or using Node.js (install http-server globally)
   npx http-server -p 8000
   ```

2. **Open the test page**:
   - Navigate to http://localhost:8000/test-manual.html

3. **Test the flow**:
   - Click "Create 400×400 Test Image" - should create a colorful grid
   - Click "Scramble Image" - should show scrambled 9×8 image with seed info
   - Click "Detect Scrambled Image" - should detect and show encoding info
   - Click "Unscramble Image" - should restore original image with verification

### Expected Results

**After Scrambling:**
- Image dimensions change from 400×400 to 450×400 (9×8 ratio)
- One column should be mostly black with one colored tile
- Tiles should be visibly shuffled
- Seed information displayed (Column, Negative Position, Seed 1-72)

**After Detection:**
- Should detect as scrambled image
- Should show correct column and negative positions
- Seed should match scramble output

**After Unscrambling:**
- Image restored to 400×400
- Original tile pattern restored (numbers 0-63 in order)
- Verification should pass (✅ Yes)

## Testing the Web App

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Start a server in the dist directory**:
   ```bash
   cd dist
   python3 -m http.server 8000
   ```

3. **Open the web app**:
   - Navigate to http://localhost:8000/web-app/index.html

4. **Test Scramble Tab**:
   - Upload any image
   - Click "Scramble Image"
   - Verify scrambled output has 9:8 aspect ratio
   - Download and verify file

5. **Test Unscramble Tab**:
   - Upload the scrambled image from previous step
   - Click "Unscramble Image"
   - Verify original image is restored
   - Check verification status

## Testing the Browser Extension

### Loading the Extension

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

### Testing the Popup

1. Click the extension icon
2. Upload a test image
3. Click "Scramble Image"
4. Verify scrambled output
5. Click "Download Scrambled"
6. Verify downloaded file

### Testing Content Script Auto-Detection

1. Create a test HTML page with a scrambled image:
   ```html
   <!DOCTYPE html>
   <html>
   <body>
     <img src="scrambled-image.png" alt="Test">
   </body>
   </html>
   ```

2. Open the page in Chrome
3. The scrambled image should automatically be detected and unscrambled
4. A 🔓 badge should appear on the image
5. Hover over the badge to see tooltip

### Testing Options Page

1. Right-click extension icon → Options
2. Toggle "Auto-unscramble images"
3. Toggle "Show unscramble badges"
4. Click "Save Settings"
5. Verify settings are persisted

## Edge Cases to Test

### Scrambling
- ✅ Very small images (< 100×100) - should still work
- ✅ Non-square images
- ✅ Large images (> 2000×2000)
- ✅ Images with transparency

### Detection
- ❌ Non-scrambled images - should not be detected
- ❌ Images with similar but incorrect aspect ratios
- ❌ Images with black columns that aren't markers
- ✅ Scrambled images after JPEG compression

### Unscrambling
- ✅ Scrambled images with slight JPEG artifacts (95% threshold)
- ❌ Corrupted scrambled images
- ❌ Manually edited scrambled images

## Performance Testing

Test with various image sizes:
- 400×400 (typical social media)
- 800×800 (HD social media)
- 2000×2000 (high resolution)
- 4000×4000 (very high resolution)

Expected processing times (approximate):
- 400×400: < 100ms
- 800×800: < 200ms
- 2000×2000: < 500ms
- 4000×4000: < 1000ms

## Troubleshooting

### Tests Fail
- Ensure you're using Node.js 16+
- Run `npm install` to install dependencies
- Check that `NODE_OPTIONS='--experimental-vm-modules'` is set

### Manual Test Page Doesn't Work
- Ensure you're using a local server (not `file://`)
- Check browser console for errors
- Verify ES module support (Chrome 61+, Firefox 60+)

### Extension Doesn't Load
- Ensure `npm run build` completed successfully
- Check `dist/` folder contains all files
- Look for errors in Chrome's extension page

### Content Script Doesn't Detect Images
- Check browser console for errors
- Verify image has correct 9:8 aspect ratio
- Ensure image is larger than 100×100 pixels

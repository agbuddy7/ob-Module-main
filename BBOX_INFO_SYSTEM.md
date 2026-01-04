# Bbox Info System - Implementation Summary

## Overview
The system now saves and reuses bounding box information to make unscrambling more accurate without metadata issues.

## How It Works

### Workflow

```
SCRAMBLING:
1. Upload image → Auto-detect face → Get bbox coordinates
2. Scramble only the face region
3. Download two files:
   - scrambled-image.png (the scrambled image)
   - scrambled-info.json (contains bbox and scramble details)

UNSCRAMBLING:
1. Upload scrambled-image.png
2. Load scrambled-info.json (via "Load Bbox Info" button)
3. Detect face ONLY in the saved bbox region
4. If face detected in that region → Unscramble successfully
5. If not in that region → Try full image detection
```

## Files Generated

### When Scrambling:

**scrambled-info.json** contains:
```json
{
  "bbox": {
    "x": 185,
    "y": 146,
    "width": 152,
    "height": 152
  },
  "seed": 42,
  "columnPosition": 5,
  "negativePosition": 3,
  "timestamp": "2026-01-04T21:30:00.000Z"
}
```

## Features

### ✅ Extension (popup)
- **Download Image** button → Downloads scrambled PNG
- **Download Info** button → Downloads JSON with bbox details
- User downloads both files together

### ✅ Web App
- **Download Image** button → Downloads scrambled PNG
- **Download with Info** button → Downloads JSON with bbox details
- **Load Bbox Info** button → User loads the JSON file when unscrambling
- Unscramble button detects whether bbox info is loaded

## Smart Detection Logic

### When Unscrambling with Bbox Info:
```javascript
if (savedBboxInfo) {
  // Try detection ONLY in the saved region first
  detectInRegion(image, savedBboxInfo.bbox)
  
  if (faceFoundInRegion) {
    // Use that region for unscrambling ✅
  } else {
    // Fall back to full image detection
  }
}
```

### When Unscrambling WITHOUT Bbox Info:
```javascript
// Try full image detection (current behavior)
detectFullImage(image)
```

## Why This Works

1. **On Web**: Social media strips metadata but user keeps the JSON file
   - If uploading to Instagram: Download both files, redownload with JSON
   - If keeping locally: Bbox info helps with precise detection

2. **On Direct Download**: Metadata survives, JSON is backup

3. **Fallback Safety**: Always works without JSON, just less precise

## Implementation Files Modified

### Web App
- `web-app/app.js`
  - Added bbox info JSON download
  - Added JSON file loading interface
  - Updated unscramble detection to use bbox region
  - Added `detectFaceInRegion()` function

### Extension
- `extension/popup/popup.js`
  - Added "Download Info" button
  - Generates JSON with bbox details
  - Same smart detection as web app

## User Experience

### Scrambling
```
Upload → [Detecting face...]
        → [Scrambling face...]
        → Shows: Original image, Scrambled image, Bbox info
        → Two download buttons:
          ✓ Download Image
          ✓ Download Info
```

### Unscrambling
```
Upload image → [Detecting...]
            → Shows: "Load Bbox Info" button
            → User clicks "Load Bbox Info" → selects JSON file
            → Shows: "Unscramble (Using Bbox)" button
            → Click unscramble
            → Success! (detects in correct region)
```

## Benefits

✅ **Solves web upload problem** - No metadata needed if JSON kept
✅ **Backward compatible** - Works without JSON (full image detection)
✅ **Accurate detection** - Knows exactly where the face was
✅ **No metadata hassle** - Doesn't rely on image metadata
✅ **User friendly** - Simple button-click interface

## Future Enhancements

- Store bbox info in image URL query params (for sharing)
- Embed bbox in image as invisible watermark (steganography)
- Support multiple faces (array of bboxes)
- Automatic matching of image + JSON files by timestamp

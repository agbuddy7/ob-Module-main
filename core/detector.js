/**
 * Scrambled Image Detector
 * Detects if an image is scrambled and extracts encoding information
 * 
 * Dependencies: canvas-utils functions must be loaded first
 */

/**
 * Check if image has correct aspect ratio for scrambled image (9:8)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} tolerance - Tolerance for ratio match (default 0.02)
 * @returns {boolean}
 */
function hasScrambledAspectRatio(width, height, tolerance = 0.02) {
  const ratio = width / height;
  const expectedRatio = 9 / 8; // 1.125
  return Math.abs(ratio - expectedRatio) < tolerance;
}

/**
 * Detect scrambled image and extract encoding information
 * @param {HTMLImageElement|HTMLCanvasElement|string} source - Image source
 * @returns {Promise<{detected: boolean, columnPosition?: number, negativePosition?: number, seed?: number}>}
 */
async function detectScrambledImage(source) {
  try {
    const canvas = await loadImageToCanvas(source);
    
    // Quick aspect ratio check
    if (!hasScrambledAspectRatio(canvas.width, canvas.height)) {
      return { detected: false };
    }
    
    // Calculate tile dimensions (should be 9 columns x 8 rows)
    const tileWidth = Math.floor(canvas.width / 9);
    const tileHeight = Math.floor(canvas.height / 8);
    
    // Check each column for marker pattern (7 black + 1 non-black)
    for (let col = 0; col < 9; col++) {
      const tiles = [];
      
      // Extract tiles in this column
      for (let row = 0; row < 8; row++) {
        const tile = extractTile(canvas, col * tileWidth, row * tileHeight, tileWidth, tileHeight);
        tiles.push(tile);
      }
      
      // Check if this column is the marker (7 black + 1 non-black)
      const blackTiles = tiles.filter(tile => isBlackTile(tile));
      
      if (blackTiles.length === 7) {
        // Found marker column, find the non-black tile
        for (let row = 0; row < 8; row++) {
          if (!isBlackTile(tiles[row])) {
            const columnPosition = col + 1; // 1-indexed
            const negativePosition = row + 1; // 1-indexed
            const seed = (columnPosition - 1) * 8 + negativePosition;
            
            return {
              detected: true,
              columnPosition,
              negativePosition,
              seed,
              tileWidth,
              tileHeight
            };
          }
        }
      }
    }
    
    return { detected: false };
  } catch (error) {
    console.error('Error detecting scrambled image:', error);
    return { detected: false };
  }
}

/**
 * Scrambled Image Detector
 * Detects if an image is scrambled and extracts encoding information
 * 
 * Dependencies: canvas-utils functions must be loaded first
 */

/**
 * Dynamically calculate the expected aspect ratio for scrambled images
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {boolean}
 */


/**
 * Detect scrambled image and extract encoding information
 * @param {HTMLImageElement|HTMLCanvasElement|string} source - Image source
 * @returns {Promise<{detected: boolean, columnPosition?: number, negativePosition?: number, seed?: number}>}
 */
async function detectScrambledImage(source) {
  try {
    const canvas = await loadImageToCanvas(source);
    console.log(`🔍 Detecting scrambled image: ${canvas.width}x${canvas.height}`);

    // Use dynamic aspect ratio check
 
    // Calculate tile dimensions (should be 9 columns x 8 rows)
    const tileWidth = Math.floor(canvas.width / 9);
    const tileHeight = Math.floor(canvas.height / 8);
    console.log(`🔍 Tile dimensions: ${tileWidth}x${tileHeight}`);

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
      console.log(`🔍 Column ${col + 1}: ${blackTiles.length} black tiles`);

      if (blackTiles.length === 7) {
        // Found marker column, find the non-black tile
        for (let row = 0; row < 8; row++) {
          if (!isBlackTile(tiles[row])) {
            const columnPosition = col + 1; // 1-indexed
            const negativePosition = row + 1; // 1-indexed
            const seed = (columnPosition - 1) * 8 + negativePosition;

            console.log(`✅ Marker column detected at column ${columnPosition}, row ${negativePosition}`);
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

    console.log('❌ No marker column detected');
    return { detected: false };
  } catch (error) {
    console.error('❌ Error detecting scrambled image:', error);
    return { detected: false };
  }
}

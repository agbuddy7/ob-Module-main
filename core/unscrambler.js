/**
 * Image Unscrambler - Reverse scramble logic
 * Detects and unscrambles images back to original form
 * 
 * Dependencies: detector.js, scrambler.js, and canvas-utils functions must be loaded first
 */

/**
 * Extract scrambled tiles (excluding marker column)
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {number} columnPosition - Marker column position (1-indexed)
 * @param {number} tileWidth - Tile width
 * @param {number} tileHeight - Tile height
 * @returns {ImageData[]} Array of 64 scrambled tiles
 */
function extractScrambledTiles(canvas, columnPosition, tileWidth, tileHeight) {
  const tiles = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 9; col++) {
      // Skip the marker column
      if (col !== columnPosition - 1) {
        const tile = extractTile(canvas, col * tileWidth, row * tileHeight, tileWidth, tileHeight);
        tiles.push(tile);
      }
    }
  }
  
  return tiles;
}

/**
 * Unscramble an image
 * @param {HTMLImageElement|HTMLCanvasElement|string} source - Image source
 * @param {boolean} verify - Whether to verify unscrambling (default true)
 * @returns {Promise<{canvas: HTMLCanvasElement, verified: boolean, seed: number}>}
 */
async function unscrambleImage(source, verify = true) {
  // Detect scrambled image and get encoding info
  const detection = await detectScrambledImage(source);
  
  if (!detection.detected) {
    throw new Error('Image is not a scrambled image');
  }
  
  const { columnPosition, negativePosition, seed, tileWidth, tileHeight } = detection;
  
  // Load image to canvas
  const canvas = await loadImageToCanvas(source);
  
  // Extract negative tile from marker column
  const negativeTile = extractTile(
    canvas,
    (columnPosition - 1) * tileWidth,
    (negativePosition - 1) * tileHeight,
    tileWidth,
    tileHeight
  );
  
  // Extract all scrambled tiles (64 tiles, excluding marker column)
  const scrambledTiles = extractScrambledTiles(canvas, columnPosition, tileWidth, tileHeight);
  
  if (scrambledTiles.length !== 64) {
    throw new Error(`Expected 64 tiles, got ${scrambledTiles.length}`);
  }
  
  // Generate shuffle map and reverse it
  const shuffleMap = generateShuffleMap(seed);
  const reverseMap = generateReverseShuffleMap(shuffleMap);
  
  // Unscramble tiles using reverse map
  const originalTiles = reverseMap.map(index => scrambledTiles[index]);
  
  // Verify if requested
  let verified = false;
  if (verify) {
    // Invert the negative tile to get original first tile
    const invertedNegative = invertTile(negativeTile);
    
    // Compare with reconstructed first tile
    verified = compareTiles(invertedNegative, originalTiles[0]);
  }
  
  // Assemble original 8x8 image
  const outputCanvas = assembleTiles(originalTiles, 8, 8);
  
  return {
    canvas: outputCanvas,
    verified,
    seed
  };
}

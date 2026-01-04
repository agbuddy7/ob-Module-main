/**
 * Image Scrambler - Main scramble logic
 * Divides image into 8×8 grid and shuffles tiles with a marker column
 * 
 * Dependencies: SeededRandom (from prng.js) and canvas-utils functions must be loaded first
 */

/**
 * Fisher-Yates shuffle with seeded random
 * @param {Array} array - Array to shuffle
 * @param {SeededRandom} rng - Seeded random number generator
 * @returns {Array} - Shuffled array
 */
function shuffleArray(array, rng) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate shuffle map for 64 tiles
 * @param {number} seed - Seed for random number generator
 * @returns {number[]} - Shuffle map (original index at each position)
 */
function generateShuffleMap(seed) {
  const rng = new SeededRandom(seed);
  const indices = Array.from({ length: 64 }, (_, i) => i);
  return shuffleArray(indices, rng);
}

/**
 * Scramble an image
 * @param {HTMLImageElement|HTMLCanvasElement|string} source - Image source
 * @returns {Promise<{canvas: HTMLCanvasElement, columnPosition: number, negativePosition: number, seed: number}>}
 */
async function scrambleImage(source) {
  // Load image to canvas
  const canvas = await loadImageToCanvas(source);
  
  // Extract 8x8 tiles (64 tiles)
  const tiles = extractTiles8x8(canvas);
  
  if (tiles.length !== 64) {
    throw new Error(`Expected 64 tiles, got ${tiles.length}`);
  }

  // Generate random column position (1-9) and negative position (1-8)
  const columnPosition = Math.floor(Math.random() * 9) + 1; // 1-9
  const negativePosition = Math.floor(Math.random() * 8) + 1; // 1-8
  
  // Calculate seed from positions
  const seed = (columnPosition - 1) * 8 + negativePosition;
  
  // Generate shuffle map
  const shuffleMap = generateShuffleMap(seed);
  
  // Shuffle tiles according to map
  const shuffledTiles = shuffleMap.map(index => tiles[index]);
  
  // Create negative of first tile (original position 0,0)
  const negativeTile = invertTile(tiles[0]);
  
  // Create black tiles for marker column
  const tileWidth = tiles[0].width;
  const tileHeight = tiles[0].height;
  const blackTile = createBlackTile(tileWidth, tileHeight);
  
  // Build marker column (7 black + 1 negative)
  const markerColumn = [];
  for (let i = 0; i < 8; i++) {
    if (i === negativePosition - 1) {
      markerColumn.push(negativeTile);
    } else {
      markerColumn.push(blackTile);
    }
  }
  
  // Assemble output canvas (9 columns x 8 rows)
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = 9 * tileWidth;
  outputCanvas.height = 8 * tileHeight;
  
  // Place tiles with marker column at specified position
  let shuffledIndex = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 9; col++) {
      const x = col * tileWidth;
      const y = row * tileHeight;
      
      if (col === columnPosition - 1) {
        // This is the marker column
        putTile(outputCanvas, markerColumn[row], x, y);
      } else {
        // Regular shuffled tile
        putTile(outputCanvas, shuffledTiles[shuffledIndex], x, y);
        shuffledIndex++;
      }
    }
  }
  
  return {
    canvas: outputCanvas,
    columnPosition,
    negativePosition,
    seed
  };
}

/**
 * Generate reverse shuffle map (to undo shuffle)
 * @param {number[]} shuffleMap - Original shuffle map
 * @returns {number[]} - Reverse shuffle map
 */
function generateReverseShuffleMap(shuffleMap) {
  const reverseMap = new Array(shuffleMap.length);
  for (let i = 0; i < shuffleMap.length; i++) {
    reverseMap[shuffleMap[i]] = i;
  }
  return reverseMap;
}

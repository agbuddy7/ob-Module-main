/**
 * Canvas-based image manipulation utilities
 */

/**
 * Load an image into a canvas
 * @param {HTMLImageElement|HTMLCanvasElement|string} source - Image element, canvas, or URL
 * @returns {Promise<HTMLCanvasElement>}
 */
async function loadImageToCanvas(source) {
  return new Promise((resolve, reject) => {
    // If source is already a canvas, just return a copy
    if (source instanceof HTMLCanvasElement) {
      const canvas = document.createElement('canvas');
      canvas.width = source.width;
      canvas.height = source.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(source, 0, 0);
      resolve(canvas);
      return;
    }

    const img = typeof source === 'string' ? new Image() : source;
    
    const onLoad = () => {
      try {
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        
        // Scale down very large images to prevent canvas size limits
        const maxDimension = 2048; // Safe limit for most browsers
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas);
      } catch (error) {
        // CORS error or other canvas error
        reject(new Error(`Canvas drawing failed: ${error.message}`));
      }
    };

    if (typeof source === 'string') {
      img.onload = onLoad;
      img.onerror = reject;
      img.crossOrigin = 'anonymous';
      img.src = source;
    } else if (img.complete) {
      onLoad();
    } else {
      img.onload = onLoad;
      img.onerror = reject;
    }
  });
}

/**
 * Extract a tile from canvas
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {number} x - X position in pixels
 * @param {number} y - Y position in pixels
 * @param {number} width - Tile width
 * @param {number} height - Tile height
 * @returns {ImageData}
 */
function extractTile(canvas, x, y, width, height) {
  const ctx = canvas.getContext('2d');
  return ctx.getImageData(x, y, width, height);
}

/**
 * Put a tile onto canvas
 * @param {HTMLCanvasElement} canvas - Target canvas
 * @param {ImageData} tileData - Tile image data
 * @param {number} x - X position in pixels
 * @param {number} y - Y position in pixels
 */
function putTile(canvas, tileData, x, y) {
  const ctx = canvas.getContext('2d');
  ctx.putImageData(tileData, x, y);
}

/**
 * Create a black tile
 * @param {number} width - Tile width
 * @param {number} height - Tile height
 * @returns {ImageData}
 */
function createBlackTile(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  // ImageData is already initialized to transparent black (all zeros)
  // We need opaque black, so set alpha to 255
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i + 3] = 255; // Alpha channel
  }
  return imageData;
}

/**
 * Invert RGB values of a tile (create negative)
 * @param {ImageData} tileData - Original tile data
 * @returns {ImageData} - Inverted tile data
 */
function invertTile(tileData) {
  const inverted = new ImageData(tileData.width, tileData.height);
  for (let i = 0; i < tileData.data.length; i += 4) {
    inverted.data[i] = 255 - tileData.data[i];       // R
    inverted.data[i + 1] = 255 - tileData.data[i + 1]; // G
    inverted.data[i + 2] = 255 - tileData.data[i + 2]; // B
    inverted.data[i + 3] = tileData.data[i + 3];       // A (keep same)
  }
  return inverted;
}

/**
 * Check if a tile is black (average brightness < threshold)
 * @param {ImageData} tileData - Tile to check
 * @param {number} threshold - Brightness threshold (default 10)
 * @returns {boolean}
 */
function isBlackTile(tileData, threshold = 30) {
  let sum = 0;
  const data = tileData.data;
  for (let i = 0; i < data.length; i += 4) {
    sum += data[i] + data[i + 1] + data[i + 2];
  }
  const avgBrightness = sum / (data.length * 3 / 4);
  // console.log(`Tile brightness: ${avgBrightness}`);
  return avgBrightness < threshold;
}

/**
 * Compare two tiles for similarity
 * @param {ImageData} tile1 - First tile
 * @param {ImageData} tile2 - Second tile
 * @param {number} threshold - Match threshold (0-1, default 0.95)
 * @returns {boolean}
 */
function compareTiles(tile1, tile2, threshold = 0.95) {
  if (tile1.width !== tile2.width || tile1.height !== tile2.height) {
    return false;
  }

  let matchingPixels = 0;
  const totalPixels = tile1.width * tile1.height;
  
  for (let i = 0; i < tile1.data.length; i += 4) {
    const diff = Math.abs(tile1.data[i] - tile2.data[i]) +
                 Math.abs(tile1.data[i + 1] - tile2.data[i + 1]) +
                 Math.abs(tile1.data[i + 2] - tile2.data[i + 2]);
    
    // Consider pixels matching if difference is small (tolerance for compression)
    if (diff < 30) { // ~10 per channel
      matchingPixels++;
    }
  }

  return (matchingPixels / totalPixels) >= threshold;
}

/**
 * Extract all tiles from an 8x8 grid
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @returns {ImageData[]} Array of 64 tiles
 */
function extractTiles8x8(canvas) {
  const tileWidth = Math.floor(canvas.width / 8);
  const tileHeight = Math.floor(canvas.height / 8);
  const tiles = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const tile = extractTile(canvas, col * tileWidth, row * tileHeight, tileWidth, tileHeight);
      tiles.push(tile);
    }
  }

  return tiles;
}

/**
 * Create canvas from tiles in a grid
 * @param {ImageData[]} tiles - Array of tile data
 * @param {number} cols - Number of columns
 * @param {number} rows - Number of rows
 * @returns {HTMLCanvasElement}
 */
function assembleTiles(tiles, cols, rows) {
  if (tiles.length === 0) {
    throw new Error('No tiles to assemble');
  }

  const tileWidth = tiles[0].width;
  const tileHeight = tiles[0].height;
  
  const canvas = document.createElement('canvas');
  canvas.width = cols * tileWidth;
  canvas.height = rows * tileHeight;

  let tileIndex = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (tileIndex < tiles.length) {
        putTile(canvas, tiles[tileIndex], col * tileWidth, row * tileHeight);
        tileIndex++;
      }
    }
  }

  return canvas;
}

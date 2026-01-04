/**
 * Popup script for Image Scrambler extension
 * Depends on: prng.js, canvas-utils.js, scrambler.js (loaded via script tags)
 */

let originalImage = null;
let scrambledResult = null;

// DOM elements
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const originalCanvas = document.getElementById('originalCanvas');
const scrambledCanvas = document.getElementById('scrambledCanvas');
const scrambleBtn = document.getElementById('scrambleBtn');
const downloadBtn = document.getElementById('downloadBtn');
const infoSection = document.getElementById('infoSection');
const columnPosEl = document.getElementById('columnPos');
const negativePosEl = document.getElementById('negativePos');
const seedEl = document.getElementById('seed');

// File input change handler
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    // Load and display original image
    const img = await loadImageFile(file);
    originalImage = img;
    
    // Draw original on canvas
    drawImageToCanvas(img, originalCanvas);
    
    // Show preview section and reset state
    previewSection.style.display = 'block';
    scrambledCanvas.style.display = 'none';
    downloadBtn.style.display = 'none';
    infoSection.style.display = 'none';
    scrambleBtn.disabled = false;
    
  } catch (error) {
    console.error('Error loading image:', error);
    alert('Error loading image. Please try again.');
  }
});

// Scramble button handler
scrambleBtn.addEventListener('click', async () => {
  if (!originalImage) return;

  try {
    scrambleBtn.disabled = true;
    scrambleBtn.textContent = '🔄 Scrambling...';
    
    // Try to detect face first
    let faceBbox = null;
    try {
      faceBbox = await detectFaceInImage(originalImage);
    } catch (error) {
      console.log('[FACE DETECTION] Failed, will scramble entire image:', error.message);
    }
    
    // If face detected, scramble only face area, otherwise scramble entire image
    if (faceBbox) {
      console.log('[SCRAMBLE] Face detected, scrambling face region only');
      scrambledResult = await scrambleImageBbox(originalImage, faceBbox);
    } else {
      console.log('[SCRAMBLE] No face detected, scrambling entire image');
      scrambledResult = await scrambleImage(originalImage);
    }
    
    // Display scrambled image
    scrambledCanvas.width = scrambledResult.canvas.width;
    scrambledCanvas.height = scrambledResult.canvas.height;
    const ctx = scrambledCanvas.getContext('2d');
    ctx.drawImage(scrambledResult.canvas, 0, 0);
    scrambledCanvas.style.display = 'block';
    
    // Display encoding info
    columnPosEl.textContent = scrambledResult.columnPosition;
    negativePosEl.textContent = scrambledResult.negativePosition;
    seedEl.textContent = scrambledResult.seed;
    infoSection.style.display = 'block';
    
    // Show download button
    downloadBtn.style.display = 'inline-flex';
    
    scrambleBtn.textContent = '✅ Scrambled!';
    
  } catch (error) {
    console.error('Error scrambling image:', error);
    alert('Error: ' + error.message);
    scrambleBtn.disabled = false;
    scrambleBtn.innerHTML = '<span class="btn-icon">🔀</span>Scramble Image';
  }
});

// Download button handler
downloadBtn.addEventListener('click', () => {
  if (!scrambledResult) return;

  try {
    scrambledResult.canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrambled-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');

  } catch (error) {
    console.error('Error downloading image:', error);
    alert('Error downloading image. Please try again.');
  }
});

/**
 * Load image from file
 * @param {File} file - Image file
 * @returns {Promise<HTMLImageElement>}
 */
function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Draw image to canvas with proper sizing
 * @param {HTMLImageElement} img - Image to draw
 * @param {HTMLCanvasElement} canvas - Target canvas
 */
function drawImageToCanvas(img, canvas) {
  // Set canvas size to match image
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
}

// Drag and drop support
const fileInputLabel = document.querySelector('.file-input-label');

fileInputLabel.addEventListener('dragover', (e) => {
  e.preventDefault();
  fileInputLabel.style.background = '#eef0ff';
});

fileInputLabel.addEventListener('dragleave', (e) => {
  e.preventDefault();
  fileInputLabel.style.background = '#f8f9ff';
});

fileInputLabel.addEventListener('drop', (e) => {
  e.preventDefault();
  fileInputLabel.style.background = '#f8f9ff';
  
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    fileInput.files = e.dataTransfer.files;
    fileInput.dispatchEvent(new Event('change'));
  }
});

/**
 * Detect face in image using API
 * @param {HTMLImageElement} img - Image to detect face in
 * @returns {Promise<{x: number, y: number, width: number, height: number}|null>}
 */
async function detectFaceInImage(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
  const formData = new FormData();
  formData.append('file', blob, 'image.jpg');
  
  const response = await fetch('https://face-detection-test-1.onrender.com/detect-face', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.faces && data.faces.length > 0) {
    const bbox = data.faces[0].bbox;
    return {
      x: Math.round(bbox[0] * data.imageWidth),
      y: Math.round(bbox[1] * data.imageHeight),
      width: Math.round(bbox[2] * data.imageWidth),
      height: Math.round(bbox[3] * data.imageHeight)
    };
  }
  
  return null;
}

/**
 * Scramble only the face region
 * @param {HTMLImageElement} img - Original image
 * @param {Object} bbox - Face bounding box
 * @returns {Promise<Object>}
 */
async function scrambleImageBbox(img, bbox) {
  // Create canvas with original image
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  // Extract face region
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = bbox.width;
  faceCanvas.height = bbox.height;
  const faceCtx = faceCanvas.getContext('2d');
  faceCtx.drawImage(canvas, bbox.x, bbox.y, bbox.width, bbox.height, 0, 0, bbox.width, bbox.height);
  
  // Convert to image
  const faceImg = new Image();
  faceImg.src = faceCanvas.toDataURL();
  await new Promise((resolve, reject) => {
    faceImg.onload = resolve;
    faceImg.onerror = reject;
  });
  
  // Scramble face
  const scrambledFace = await scrambleImage(faceImg);
  
  // Composite scrambled face back onto original
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = canvas.width;
  finalCanvas.height = canvas.height;
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.drawImage(canvas, 0, 0);
  finalCtx.drawImage(scrambledFace.canvas, 0, 0, bbox.width, bbox.height, bbox.x, bbox.y, bbox.width, bbox.height);
  
  return {
    canvas: finalCanvas,
    columnPosition: scrambledFace.columnPosition,
    negativePosition: scrambledFace.negativePosition,
    seed: scrambledFace.seed
  };
}

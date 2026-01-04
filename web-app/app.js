/**
 * Web App logic for Image Scrambler
 * Depends on: prng.js, canvas-utils.js, scrambler.js, detector.js, unscrambler.js (loaded via script tags)
 */

// Tab switching
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Update active tab
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Show corresponding content
    tabContents.forEach(content => {
      content.style.display = 'none';
    });
    document.getElementById(`${tabName}-tab`).style.display = 'block';
  });
});

// ==================== SCRAMBLE TAB ====================

const scrambleFileInput = document.getElementById('scrambleFileInput');
const scramblePreview = document.getElementById('scramblePreview');
const originalCanvas = document.getElementById('originalCanvas');
const scrambledCanvas = document.getElementById('scrambledCanvas');
const scrambleBtn = document.getElementById('scrambleBtn');
const downloadScrambledBtn = document.getElementById('downloadScrambledBtn');
const scrambleInfo = document.getElementById('scrambleInfo');

let originalImage = null;
let scrambledResult = null;
let detectedFaceBbox = null; // Store bbox from face detection API

// File input for scrambling
scrambleFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    originalImage = await loadImageFile(file);
    drawImageToCanvas(originalImage, originalCanvas);
    
    scramblePreview.style.display = 'block';
    scrambledCanvas.style.display = 'none';
    downloadScrambledBtn.style.display = 'none';
    scrambleInfo.style.display = 'none';
    scrambleBtn.disabled = false;
    scrambleBtn.innerHTML = '<span class="btn-icon">�</span>Detecting face...';
    
    // Auto-detect face on upload
    detectedFaceBbox = await detectFaceInImage(originalImage);
    
    if (detectedFaceBbox) {
      console.log('[AUTO DETECT] Face found:', detectedFaceBbox);
      scrambleBtn.innerHTML = '<span class="btn-icon">🔀</span>Scramble Image';
      scrambleBtn.disabled = false;
    } else {
      console.log('[AUTO DETECT] No face detected');
      scrambleBtn.innerHTML = '<span class="btn-icon">⚠️</span>No Face Detected';
      scrambleBtn.disabled = true;
    }
    
  } catch (error) {
    console.error('Error loading image:', error);
    console.error('[AUTO DETECT] Error:', error.message);
    alert('Error: ' + error.message);
    scrambleBtn.innerHTML = '<span class="btn-icon">🔀</span>Scramble Image';
    scrambleBtn.disabled = true;
  }
});

// Scramble button
scrambleBtn.addEventListener('click', async () => {
  if (!originalImage) return;

  try {
    scrambleBtn.disabled = true;
    scrambleBtn.innerHTML = '<span class="btn-icon">🔄</span>Scrambling...';
    
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
    
    scrambledCanvas.width = scrambledResult.canvas.width;
    scrambledCanvas.height = scrambledResult.canvas.height;
    const ctx = scrambledCanvas.getContext('2d');
    ctx.drawImage(scrambledResult.canvas, 0, 0);
    scrambledCanvas.style.display = 'block';
    
    document.getElementById('scrambleColumnPos').textContent = scrambledResult.columnPosition;
    document.getElementById('scrambleNegativePos').textContent = scrambledResult.negativePosition;
    document.getElementById('scrambleSeed').textContent = scrambledResult.seed;
    scrambleInfo.style.display = 'block';
    
    downloadScrambledBtn.style.display = 'inline-flex';
    scrambleBtn.innerHTML = '<span class="btn-icon">✅</span>Scrambled!';
    
  } catch (error) {
    console.error('Error scrambling image:', error);
    alert('Error: ' + error.message);
    scrambleBtn.disabled = false;
    scrambleBtn.innerHTML = '<span class="btn-icon">🔀</span>Scramble Image';
  }
});

// Download scrambled
downloadScrambledBtn.addEventListener('click', () => {
  if (!scrambledResult) return;

  scrambledResult.canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scrambled-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
});

// ==================== UNSCRAMBLE TAB ====================

const unscrambleFileInput = document.getElementById('unscrambleFileInput');
const unscramblePreview = document.getElementById('unscramblePreview');
const scrambledInputCanvas = document.getElementById('scrambledInputCanvas');
const unscrambledCanvas = document.getElementById('unscrambledCanvas');
const unscrambleBtn = document.getElementById('unscrambleBtn');
const downloadUnscrambledBtn = document.getElementById('downloadUnscrambledBtn');
const unscrambleInfo = document.getElementById('unscrambleInfo');

let scrambledInputImage = null;
let unscrambledResult = null;

// File input for unscrambling
unscrambleFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    scrambledInputImage = await loadImageFile(file);
    drawImageToCanvas(scrambledInputImage, scrambledInputCanvas);
    
    // Try to detect if it's scrambled
    const detection = await detectScrambledImage(scrambledInputImage);
    
    unscramblePreview.style.display = 'block';
    unscrambledCanvas.style.display = 'none';
    downloadUnscrambledBtn.style.display = 'none';
    unscrambleInfo.style.display = 'none';
    unscrambleBtn.disabled = false;
    
    if (detection.detected) {
      unscrambleBtn.innerHTML = '<span class="btn-icon">🔓</span>Unscramble Image';
    } else {
      unscrambleBtn.innerHTML = '<span class="btn-icon">⚠️</span>Try Unscramble (Not Detected)';
    }
    
  } catch (error) {
    console.error('Error loading image:', error);
    alert('Error loading image. Please try again.');
  }
});

// Unscramble button
unscrambleBtn.addEventListener('click', async () => {
  if (!scrambledInputImage) return;

  try {
    unscrambleBtn.disabled = true;
    unscrambleBtn.innerHTML = '<span class="btn-icon">🔄</span>Unscrambling...';
    
    unscrambledResult = await unscrambleImage(scrambledInputImage);
    
    unscrambledCanvas.width = unscrambledResult.canvas.width;
    unscrambledCanvas.height = unscrambledResult.canvas.height;
    const ctx = unscrambledCanvas.getContext('2d');
    ctx.drawImage(unscrambledResult.canvas, 0, 0);
    unscrambledCanvas.style.display = 'block';
    
    document.getElementById('detected').textContent = '✅ Yes';
    document.getElementById('unscrambleSeed').textContent = unscrambledResult.seed;
    document.getElementById('verified').textContent = unscrambledResult.verified ? '✅ Yes' : '⚠️ No';
    unscrambleInfo.style.display = 'block';
    
    downloadUnscrambledBtn.style.display = 'inline-flex';
    unscrambleBtn.innerHTML = '<span class="btn-icon">✅</span>Unscrambled!';
    
  } catch (error) {
    console.error('Error unscrambling image:', error);
    alert('Error unscrambling image: ' + error.message);
    unscrambleBtn.disabled = false;
    unscrambleBtn.innerHTML = '<span class="btn-icon">🔓</span>Unscramble Image';
  }
});

// Download unscrambled
downloadUnscrambledBtn.addEventListener('click', () => {
  if (!unscrambledResult) return;

  unscrambledResult.canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unscrambled-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
});

// ==================== UTILITY FUNCTIONS ====================

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

function drawImageToCanvas(img, canvas) {
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
}

// Drag and drop support for scramble
setupDragAndDrop('scrambleFileInput');

// Drag and drop support for unscramble
setupDragAndDrop('unscrambleFileInput');

function setupDragAndDrop(inputId) {
  const input = document.getElementById(inputId);
  const label = input.nextElementSibling;

  label.addEventListener('dragover', (e) => {
    e.preventDefault();
    label.style.background = '#eef0ff';
  });

  label.addEventListener('dragleave', (e) => {
    e.preventDefault();
    label.style.background = '#f8f9ff';
  });

  label.addEventListener('drop', (e) => {
    e.preventDefault();
    label.style.background = '#f8f9ff';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      input.files = e.dataTransfer.files;
      input.dispatchEvent(new Event('change'));
    }
  });
}
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


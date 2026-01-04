/**
 * Content script for automatic detection and unscrambling of images
 * Depends on: prng.js, canvas-utils.js, scrambler.js, detector.js, unscrambler.js (loaded via manifest.json)
 */

// Track processed images to avoid re-processing
const processedImages = new WeakSet();

/**
 * Check if we can process an image (not cross-origin)
 * @param {HTMLImageElement} img - Image element to check
 * @returns {boolean}
 */
function canProcessImage(img) {
  // Check if image is from same origin or has CORS enabled
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 1, 1);
    canvas.toDataURL(); // This will throw if CORS blocked
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Process image with forced detection (bypassing size checks)
 * @param {HTMLImageElement} img - Image element to check
 */
async function processImageForced(img) {
  console.log(`🔒 Starting FORCED processImage for: ${img.src}`);
  console.log(`🔒 Image dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
  
  // Skip if already processed
  if (processedImages.has(img)) {
    console.log('🔒 Image already processed, skipping');
    return;
  }
  
  // Check if we can process this image (CORS check)
  if (!canProcessImage(img)) {
    console.log('🔒 Cannot process cross-origin image:', img.src);

    // Attempt to fetch via background worker
    try {
      console.log('🔒 Attempting background fetch via service worker (forced)...');
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'fetchImageAsDataUrl', url: img.src }, (res) => resolve(res));
      });

      if (response && response.dataUrl) {
        console.log('🔒 Background fetch succeeded (forced), retrying detection with data URL');
        const detection = await detectScrambledImage(response.dataUrl);
        console.log(`🔍 Detection result (background forced): ${JSON.stringify(detection)}`);
        if (detection.detected) {
          processedImages.add(img);
          console.log('🔓 Detected via background-fetched data URL (forced), attempting unscrambling...');
          const result = await unscrambleImage(response.dataUrl);
          const dataUrl = result.canvas.toDataURL('image/png');
          img.src = dataUrl;
          addUnscrambledBadge(img, result.verified);
          console.log(`✅ Unscrambled image (seed: ${result.seed}, verified: ${result.verified})`);
          return;
        } else {
          console.log('❌ Background-fetched image not detected as scrambled (forced)');
          return;
        }
      } else {
        console.log('❌ Background fetch failed (forced):', response && response.error);
        return;
      }
    } catch (err) {
      console.log('❌ Background fetch error (forced):', err);
      return;
    }
  }
  
  console.log('🔒 FORCED processing - attempting detection...');

  try {
    // Detect if scrambled (skip ratio check for forced processing)
    const detection = await detectScrambledImage(img);
    
    if (detection.detected) {
      // Mark as processed
      processedImages.add(img);
      
      // Unscramble the image
      const result = await unscrambleImage(img);
      
      // Replace image with unscrambled version
      const dataUrl = result.canvas.toDataURL('image/png');
      const setResult = await setImageToDataUrl(img, dataUrl);
      if (setResult.success) {
        processedImages.add(setResult.img);
        addUnscrambledBadge(setResult.img, result.verified);
        console.log(`✅ Unscrambled image (seed: ${result.seed}, verified: ${result.verified})`);
      } else {
        console.log('❌ Failed to apply unscrambled image to page, base64 logged for debugging');
        console.log(dataUrl);
      }
    } else {
      console.debug('Image not detected as scrambled');
    }
  } catch (error) {
    // Handle specific CORS errors
    if (error.message.includes('Canvas drawing failed') || error.message.includes('cross-origin')) {
      console.debug('CORS error - cannot process cross-origin image:', img.src);
    } else {
      console.debug('Image processing error:', error);
    }
  }
}

/**
 * Check and unscramble an image if it's scrambled
 * @param {HTMLImageElement} img - Image element to check
 */
async function processImage(img) {
  console.log(`🔒 Starting processImage for: ${img.src}`);

  // Skip if already processed
  if (processedImages.has(img)) {
    console.log('🔒 Image already processed, skipping');
    return;
  }

  // Skip very small images (likely icons)
  if (img.width < 100 || img.height < 100) {
    console.log(`🔒 Image too small (${img.width}x${img.height}), skipping`);
    return;
  }

  // Check if we can process this image (CORS check)
  if (!canProcessImage(img)) {
    console.log('🔒 Cannot process cross-origin image:', img.src);

    // Attempt to fetch image via background service worker as a data URL
    try {
      console.log('🔒 Attempting background fetch via service worker...');
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'fetchImageAsDataUrl', url: img.src }, (res) => resolve(res));
      });

      if (response && response.dataUrl) {
        console.log('🔒 Background fetch succeeded, retrying detection with data URL');
        const detection = await detectScrambledImage(response.dataUrl);
        console.log(`🔍 Detection result (background): ${JSON.stringify(detection)}`);
        if (detection.detected) {
          processedImages.add(img);
          console.log('🔓 Detected via background-fetched data URL, attempting unscrambling...');
          const result = await unscrambleImage(response.dataUrl);
          const dataUrl = result.canvas.toDataURL('image/png');
          const setResult = await setImageToDataUrl(img, dataUrl);
          if (setResult.success) {
            processedImages.add(setResult.img);
            addUnscrambledBadge(setResult.img, result.verified);
            console.log(`✅ Unscrambled image (seed: ${result.seed}, verified: ${result.verified})`);

            // Notify background for UX (optional)
            chrome.runtime.sendMessage({ action: 'imageUnscrambled', data: { seed: result.seed, verified: result.verified } });
          } else {
            console.log('❌ Failed to apply unscrambled image to page (background), base64 logged');
            console.log(dataUrl);
          }
          return;
        } else {
          console.log('❌ Background-fetched image not detected as scrambled');
          return;
        }
      } else {
        console.log('❌ Background fetch failed:', response && response.error);
        return;
      }
    } catch (err) {
      console.log('❌ Background fetch error:', err);
      return;
    }
  }

  console.log('🔒 Image passed all checks, attempting detection...');
  
  try {
    // Detect if scrambled
    const detection = await detectScrambledImage(img);
    console.log(`🔍 Detection result: ${JSON.stringify(detection)}`);

    if (detection.detected) {
      // Mark as processed
      processedImages.add(img);

      // Unscramble the image
      console.log('🔓 Scrambled image detected, attempting unscrambling...');
      const result = await unscrambleImage(img);

      // Replace image with unscrambled version
      const dataUrl = result.canvas.toDataURL('image/png');
      img.src = dataUrl;

      // Add visual indicator
      addUnscrambledBadge(img, result.verified);

      console.log(`✅ Unscrambled image (seed: ${result.seed}, verified: ${result.verified})`);
    } else {
      console.log('❌ Image not detected as scrambled');
    }
  } catch (error) {
    // Handle specific CORS errors
    if (error.message.includes('Canvas drawing failed') || error.message.includes('cross-origin')) {
      console.debug('CORS error - cannot process cross-origin image:', img.src);
    } else {
      console.debug('Image processing error:', error);
    }
  }
}

/**
 * Add visual indicator badge to unscrambled images
 * @param {HTMLImageElement} img - Image element
 * @param {boolean} verified - Whether unscrambling was verified
 */
function addUnscrambledBadge(img, verified) {
  // Skip if already has badge
  if (img.parentElement?.classList.contains('image-scrambler-wrapper')) {
    return;
  }
  
  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'image-scrambler-wrapper';
  wrapper.style.position = 'relative';
  wrapper.style.display = 'inline-block';
  
  // Create badge
  const badge = document.createElement('div');
  badge.className = 'image-scrambler-badge';
  badge.textContent = '🔓';
  badge.title = verified 
    ? 'Image unscrambled by Image Scrambler (verified)' 
    : 'Image unscrambled by Image Scrambler';
  
  // Wrap image
  img.parentNode?.insertBefore(wrapper, img);
  wrapper.appendChild(img);
  wrapper.appendChild(badge);
}

/**
 * Safely set an image element's source to a data URL, with fallback replacement
 * @param {HTMLImageElement} img - Original image element
 * @param {string} dataUrl - Data URL to set
 * @returns {Promise<{success:boolean,img:HTMLImageElement}>}
 */
function setImageToDataUrl(img, dataUrl) {
  return new Promise((resolve) => {
    let settled = false;

    function finish(success, newImg) {
      if (settled) return;
      settled = true;
      resolve({ success, img: newImg || img });
    }

    // Try simple assignment first
    try {
      img.removeAttribute('srcset');
    } catch (e) {}

    const onLoad = () => finish(true, img);
    const onError = () => {
      // Replace with a cloned image
      try {
        const newImg = img.cloneNode(false);
        newImg.addEventListener('load', () => {
          if (img.parentNode) img.parentNode.replaceChild(newImg, img);
          finish(true, newImg);
        }, { once: true });
        newImg.addEventListener('error', () => finish(false, img), { once: true });
        newImg.src = dataUrl;
      } catch (e) {
        finish(false, img);
      }
    };

    img.addEventListener('load', onLoad, { once: true });
    img.addEventListener('error', onError, { once: true });
    img.src = dataUrl;

    // Timeout fallback: if no load/error within 2s, attempt replacement
    setTimeout(() => {
      if (settled) return;
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
      try {
        const newImg = img.cloneNode(false);
        newImg.addEventListener('load', () => {
          if (img.parentNode) img.parentNode.replaceChild(newImg, img);
          finish(true, newImg);
        }, { once: true });
        newImg.addEventListener('error', () => finish(false, img), { once: true });
        newImg.src = dataUrl;
      } catch (e) {
        finish(false, img);
      }
    }, 2000);
  });
}

/**
 * Process all images on the page
 */
function processAllImages() {
  const images = document.querySelectorAll('img');
  console.log(`🔒 Found ${images.length} images on page`);
  
  images.forEach((img, index) => {
    console.log(`🔒 Processing image ${index + 1}: ${img.src} (${img.naturalWidth}x${img.naturalHeight})`);
    if (img.complete && img.naturalWidth > 0) {
      processImage(img);
    } else {
      console.log(`🔒 Image ${index + 1} not loaded yet, waiting for load event`);
      img.addEventListener('load', () => processImage(img), { once: true });
    }
  });
  
  // Special handling for direct image viewing (when only one img is the whole page)
  if (images.length === 1 && document.body.children.length === 1) {
    const img = images[0];
    console.log('🔒 Single image page detected, using forced processing');
    // Force processing even if dimensions don't match our normal criteria
    setTimeout(() => {
      if (img.complete && img.naturalWidth > 0) {
        processImageForced(img);
      }
    }, 100);
  }
}

/**
 * Set up MutationObserver for dynamically loaded images
 */
function observeNewImages() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'IMG') {
          const img = node;
          if (img.complete && img.naturalWidth > 0) {
            processImage(img);
          } else {
            img.addEventListener('load', () => processImage(img), { once: true });
          }
        } else if (node.querySelectorAll) {
          const images = node.querySelectorAll('img');
          images.forEach(img => {
            if (img.complete && img.naturalWidth > 0) {
              processImage(img);
            } else {
              img.addEventListener('load', () => processImage(img), { once: true });
            }
          });
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize when DOM is ready
console.log('🔒 Image Scrambler extension loaded');

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🔒 DOM loaded, starting image processing');
    processAllImages();
    observeNewImages();
  });
} else {
  console.log('🔒 DOM already ready, starting image processing');
  processAllImages();
  observeNewImages();
}

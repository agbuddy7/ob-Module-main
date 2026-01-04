/**
 * Background service worker for Image Scrambler extension
 */

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Image Scrambler extension installed');
    
    // Set default options
    chrome.storage.sync.set({
      autoUnscramble: true,
      showBadges: true
    });
  } else if (details.reason === 'update') {
    console.log('Image Scrambler extension updated');
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'imageUnscrambled') {
    console.log('Image unscrambled:', request.data);
    
    // Could add badge or notification here
    if (sender.tab) {
      chrome.action.setBadgeText({
        text: '✓',
        tabId: sender.tab.id
      });
      
      chrome.action.setBadgeBackgroundColor({
        color: '#4caf50',
        tabId: sender.tab.id
      });
      
      // Clear badge after 3 seconds
      setTimeout(() => {
        chrome.action.setBadgeText({
          text: '',
          tabId: sender.tab.id
        });
      }, 3000);
    }
  }

  if (request.action === 'fetchImageAsDataUrl' && request.url) {
    // Fetch image as blob and convert to data URL to bypass page CORS restrictions
    (async () => {
      try {
        const resp = await fetch(request.url);
        if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
        const blob = await resp.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          sendResponse({ dataUrl: reader.result });
        };
        reader.onerror = () => sendResponse({ error: 'Failed to read blob' });
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Background fetch error:', err);
        sendResponse({ error: err.message });
      }
    })();

    // Indicate that we'll respond asynchronously
    return true;
  }
  
  return true;
});

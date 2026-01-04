/**
 * Options page logic
 */

const autoUnscrambleCheckbox = document.getElementById('autoUnscramble');
const showBadgesCheckbox = document.getElementById('showBadges');
const saveBtn = document.getElementById('saveBtn');
const statusMessage = document.getElementById('statusMessage');

// Load saved options
chrome.storage.sync.get(['autoUnscramble', 'showBadges'], (result) => {
  autoUnscrambleCheckbox.checked = result.autoUnscramble !== false;
  showBadgesCheckbox.checked = result.showBadges !== false;
});

// Save options
saveBtn.addEventListener('click', () => {
  const options = {
    autoUnscramble: autoUnscrambleCheckbox.checked,
    showBadges: showBadgesCheckbox.checked
  };

  chrome.storage.sync.set(options, () => {
    // Show success message
    statusMessage.classList.add('success');
    
    // Hide after 2 seconds
    setTimeout(() => {
      statusMessage.classList.remove('success');
    }, 2000);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const togglePageNav = document.getElementById('toggle-page-nav');
  const toggleCodeNav = document.getElementById('toggle-code-nav');

  // Load current settings
  chrome.storage.sync.get({
    showPageNav: true,
    showCodeNav: true
  }, (items) => {
    togglePageNav.checked = items.showPageNav;
    toggleCodeNav.checked = items.showCodeNav;
  });

  // Save settings on toggle
  togglePageNav.addEventListener('change', () => {
    chrome.storage.sync.set({ showPageNav: togglePageNav.checked });
  });

  toggleCodeNav.addEventListener('change', () => {
    chrome.storage.sync.set({ showCodeNav: toggleCodeNav.checked });
  });
});

// latest-news-dismiss.js
// Handles dismissing the Latest News floating CTA and persists state in localStorage

(function() {
  const DISMISS_KEY = 'passEE_latestNewsDismissed';
  const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

  function init() {
    const newsBtn = document.querySelector('.floating-news-button');
    const closeBtn = document.querySelector('.floating-news-close');

    if (!newsBtn || !closeBtn) return;

    // Check if previously dismissed and still within duration
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      if (now - dismissedTime < DISMISS_DURATION_MS) {
        // Still within 7 days, hide the button
        newsBtn.style.display = 'none';
        return;
      } else {
        // Expired, remove key
        localStorage.removeItem(DISMISS_KEY);
      }
    }

    // Attach close handler
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      newsBtn.style.display = 'none';
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    });
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

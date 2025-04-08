document.addEventListener('DOMContentLoaded', function() {
  // Track CTA button clicks
  const ctaButtons = document.querySelectorAll('.cta-button');
  ctaButtons.forEach(button => {
    button.addEventListener('click', function() {
      gtag('event', 'click', {
        'event_category': 'engagement',
        'event_label': this.textContent.trim()
      });
      console.log('CTA button click tracked:', this.textContent.trim());
    });
  });
  
  // Track App Store links with more detailed information
  const appStoreLinks = document.querySelectorAll('a[href*="apps.apple.com"]');
  appStoreLinks.forEach(link => {
    link.addEventListener('click', function() {
      // Get the page location and link context
      const pagePath = window.location.pathname;
      const linkLocation = this.closest('section')?.querySelector('h2, h3')?.textContent || 'Unknown section';
      const linkText = this.textContent.trim();
      
      gtag('event', 'app_store_click', {
        'event_category': 'conversion',
        'event_label': linkText || 'App Store Download',
        'page_path': pagePath,
        'link_context': linkLocation
      });
      
      console.log('App Store link click tracked:', {
        text: linkText,
        page: pagePath,
        section: linkLocation
      });
    });
  });
  
  // Track navigation menu clicks
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      gtag('event', 'navigation', {
        'event_category': 'engagement',
        'event_label': this.textContent.trim()
      });
      console.log('Navigation click tracked:', this.textContent.trim());
    });
  });
  
  // Track floating MCQ button clicks
  const mcqButton = document.querySelector('.floating-mcq-button');
  if (mcqButton) {
    mcqButton.addEventListener('click', function() {
      gtag('event', 'click', {
        'event_category': 'conversion',
        'event_label': 'passMCQ Button'
      });
      console.log('passMCQ button click tracked');
    });
  }
}); 
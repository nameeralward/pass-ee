// Enhanced Analytics Events for passEE - Comprehensive User Behavior Tracking
document.addEventListener('DOMContentLoaded', function() {
  
  // ===========================================
  // SCROLL BEHAVIOR TRACKING
  // ===========================================
  let scrollDepths = [25, 50, 75, 90, 100];
  let scrollDepthsReached = [];
  let maxScrollDepth = 0;
  
  function trackScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / documentHeight) * 100);
    
    if (scrollPercent > maxScrollDepth) {
      maxScrollDepth = scrollPercent;
    }
    
    scrollDepths.forEach(depth => {
      if (scrollPercent >= depth && !scrollDepthsReached.includes(depth)) {
        scrollDepthsReached.push(depth);
        gtag('event', 'scroll_depth', {
          'event_category': 'engagement',
          'event_label': `${depth}%`,
          'value': depth,
          'page_path': window.location.pathname
        });
        console.log(`Scroll depth tracked: ${depth}%`);
      }
    });
  }
  
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(trackScrollDepth, 100);
  });
  
  // ===========================================
  // TIME ON PAGE TRACKING
  // ===========================================
  let startTime = Date.now();
  let engagementTime = 0;
  let isVisible = true;
  let lastActiveTime = Date.now();
  
  // Track visibility changes
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      isVisible = false;
      engagementTime += Date.now() - lastActiveTime;
    } else {
      isVisible = true;
      lastActiveTime = Date.now();
    }
  });
  
  // Track mouse movement and clicks to determine active engagement
  let userActive = true;
  let inactivityTimer;
  
  function resetInactivityTimer() {
    userActive = true;
    lastActiveTime = Date.now();
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      userActive = false;
    }, 30000); // 30 seconds of inactivity
  }
  
  document.addEventListener('mousemove', resetInactivityTimer);
  document.addEventListener('click', resetInactivityTimer);
  document.addEventListener('keypress', resetInactivityTimer);
  document.addEventListener('scroll', resetInactivityTimer);
  
  // Send engagement time every 30 seconds and on page unload
  function sendEngagementTime() {
    if (isVisible && userActive) {
      engagementTime += Date.now() - lastActiveTime;
      lastActiveTime = Date.now();
    }
    
    const totalTime = Math.round(engagementTime / 1000); // Convert to seconds
    if (totalTime > 0) {
      gtag('event', 'engagement_time', {
        'event_category': 'engagement',
        'value': totalTime,
        'page_path': window.location.pathname,
        'max_scroll_depth': maxScrollDepth
      });
      console.log(`Engagement time: ${totalTime} seconds, Max scroll: ${maxScrollDepth}%`);
    }
  }
  
  setInterval(sendEngagementTime, 30000); // Every 30 seconds
  window.addEventListener('beforeunload', sendEngagementTime);
  
  // ===========================================
  // CONTENT INTERACTION TRACKING
  // ===========================================
  
  // Track all button clicks with detailed context
  const allButtons = document.querySelectorAll('button, .btn, .cta-button, [role="button"]');
  allButtons.forEach(button => {
    button.addEventListener('click', function() {
      const buttonText = this.textContent.trim();
      const buttonClass = this.className;
      const section = this.closest('section')?.querySelector('h1, h2, h3')?.textContent || 'Unknown section';
      
      gtag('event', 'button_click', {
        'event_category': 'engagement',
        'event_label': buttonText,
        'button_class': buttonClass,
        'section_context': section,
        'page_path': window.location.pathname
      });
      console.log('Button click tracked:', buttonText, 'in section:', section);
    });
  });
  
  // Track all link clicks with detailed information
  const allLinks = document.querySelectorAll('a');
  allLinks.forEach(link => {
    link.addEventListener('click', function() {
      const linkText = this.textContent.trim();
      const linkUrl = this.href;
      const isExternal = !linkUrl.includes(window.location.hostname);
      const section = this.closest('section')?.querySelector('h1, h2, h3')?.textContent || 'Unknown section';
      
      gtag('event', 'link_click', {
        'event_category': isExternal ? 'outbound_link' : 'internal_link',
        'event_label': linkText,
        'link_url': linkUrl,
        'section_context': section,
        'page_path': window.location.pathname
      });
      console.log('Link click tracked:', linkText, 'URL:', linkUrl);
    });
  });
  
  // Track App Store/Download links specifically
  const downloadLinks = document.querySelectorAll('a[href*="apps.apple.com"], a[href*="play.google.com"], a[href*="download"]');
  downloadLinks.forEach(link => {
    link.addEventListener('click', function() {
      const platform = this.href.includes('apple.com') ? 'iOS' : 
                      this.href.includes('play.google.com') ? 'Android' : 'Other';
      const section = this.closest('section')?.querySelector('h1, h2, h3')?.textContent || 'Unknown section';
      
      gtag('event', 'download_attempt', {
        'event_category': 'conversion',
        'event_label': platform,
        'platform': platform,
        'section_context': section,
        'page_path': window.location.pathname
      });
      console.log('Download attempt tracked:', platform, 'from section:', section);
    });
  });
  
  // ===========================================
  // FORM INTERACTION TRACKING
  // ===========================================
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    // Track form starts
    const formInputs = form.querySelectorAll('input, textarea, select');
    let formStarted = false;
    
    formInputs.forEach(input => {
      input.addEventListener('focus', function() {
        if (!formStarted) {
          formStarted = true;
          gtag('event', 'form_start', {
            'event_category': 'engagement',
            'form_id': form.id || 'unnamed_form',
            'page_path': window.location.pathname
          });
          console.log('Form interaction started:', form.id);
        }
      });
    });
    
    // Track form submissions
    form.addEventListener('submit', function() {
      gtag('event', 'form_submit', {
        'event_category': 'conversion',
        'form_id': form.id || 'unnamed_form',
        'page_path': window.location.pathname
      });
      console.log('Form submission tracked:', form.id);
    });
  });
  
  // ===========================================
  // CONTENT ENGAGEMENT TRACKING
  // ===========================================
  
  // Track when users read specific sections (based on time spent viewing)
  const contentSections = document.querySelectorAll('section, article, .content-block');
  const sectionViewTimes = new Map();
  
  function trackSectionViewing() {
    contentSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      const sectionId = section.id || section.querySelector('h1, h2, h3')?.textContent?.slice(0, 30) || 'unnamed_section';
      
      if (isVisible) {
        if (!sectionViewTimes.has(sectionId)) {
          sectionViewTimes.set(sectionId, Date.now());
        }
      } else if (sectionViewTimes.has(sectionId)) {
        const viewTime = Date.now() - sectionViewTimes.get(sectionId);
        if (viewTime > 3000) { // Only track if viewed for more than 3 seconds
          gtag('event', 'content_engagement', {
            'event_category': 'engagement',
            'event_label': sectionId,
            'value': Math.round(viewTime / 1000),
            'page_path': window.location.pathname
          });
          console.log('Section engagement tracked:', sectionId, Math.round(viewTime / 1000) + 's');
        }
        sectionViewTimes.delete(sectionId);
      }
    });
  }
  
  let sectionTrackingTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(sectionTrackingTimeout);
    sectionTrackingTimeout = setTimeout(trackSectionViewing, 200);
  });
  
  // ===========================================
  // SEARCH BEHAVIOR TRACKING
  // ===========================================
  const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search" i], .search-input');
  searchInputs.forEach(input => {
    let searchStartTime;
    
    input.addEventListener('focus', function() {
      searchStartTime = Date.now();
    });
    
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim()) {
        gtag('event', 'search', {
          'event_category': 'engagement',
          'search_term': this.value.trim(),
          'page_path': window.location.pathname
        });
        console.log('Search tracked:', this.value.trim());
      }
    });
  });
  
  // ===========================================
  // ERROR TRACKING
  // ===========================================
  window.addEventListener('error', function(e) {
    gtag('event', 'javascript_error', {
      'event_category': 'error',
      'event_label': e.message,
      'error_file': e.filename,
      'error_line': e.lineno,
      'page_path': window.location.pathname
    });
    console.log('JavaScript error tracked:', e.message);
  });
  
  // ===========================================
  // MOBILE-SPECIFIC TRACKING
  // ===========================================
  if ('ontouchstart' in window) {
    // Track touch interactions
    let touchStartTime;
    
    document.addEventListener('touchstart', function() {
      touchStartTime = Date.now();
    });
    
    document.addEventListener('touchend', function() {
      const touchDuration = Date.now() - touchStartTime;
      if (touchDuration > 500) { // Long press
        gtag('event', 'long_press', {
          'event_category': 'mobile_interaction',
          'value': touchDuration,
          'page_path': window.location.pathname
        });
      }
    });
    
    // Track device orientation changes
    window.addEventListener('orientationchange', function() {
      gtag('event', 'orientation_change', {
        'event_category': 'mobile_interaction',
        'orientation': screen.orientation ? screen.orientation.angle : window.orientation,
        'page_path': window.location.pathname
      });
    });
  }
  
  // ===========================================
  // PAGE PERFORMANCE TRACKING
  // ===========================================
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
        
        gtag('event', 'page_performance', {
          'event_category': 'performance',
          'page_load_time': loadTime,
          'dom_ready_time': domReadyTime,
          'page_path': window.location.pathname
        });
        console.log('Page performance tracked - Load time:', loadTime + 'ms');
      }
    }, 0);
  });
  
  // ===========================================
  // CUSTOM PEBC/PHARMACY SPECIFIC TRACKING
  // ===========================================
  
  // Track exam-related interactions
  const examElements = document.querySelectorAll('[data-exam-type], .pebc-content, .exam-prep');
  examElements.forEach(element => {
    element.addEventListener('click', function() {
      const examType = this.dataset.examType || 'PEBC_EE';
      const contentType = this.className.includes('practice') ? 'practice_questions' :
                         this.className.includes('guide') ? 'study_guide' :
                         this.className.includes('tips') ? 'study_tips' : 'general_content';
      
      gtag('event', 'exam_content_interaction', {
        'event_category': 'education',
        'exam_type': examType,
        'content_type': contentType,
        'page_path': window.location.pathname
      });
      console.log('Exam content interaction:', examType, contentType);
    });
  });
  
  // Track subscription-related interactions
  const subscriptionElements = document.querySelectorAll('.subscription, .pricing, .plan');
  subscriptionElements.forEach(element => {
    element.addEventListener('click', function() {
      const planType = this.dataset.plan || this.textContent.toLowerCase().includes('premium') ? 'premium' : 'basic';
      
      gtag('event', 'subscription_interest', {
        'event_category': 'conversion',
        'plan_type': planType,
        'page_path': window.location.pathname
      });
      console.log('Subscription interest tracked:', planType);
    });
  });
  
  console.log('Enhanced passEE Analytics initialized - Tracking comprehensive user behavior');
}); 
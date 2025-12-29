/**
 * Language Switcher with Google Translate Integration
 * Provides automatic translation between English and French using Google Translate
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        defaultLanguage: 'en',
        supportedLanguages: {
            'en': { code: 'en', name: 'English', displayName: 'English' },
            'fr': { code: 'fr', name: 'Français', displayName: 'Français' }
        },
        googleTranslateElementId: 'google_translate_element',
        cookieName: 'googtrans',
        cookieExpiry: 365 // days
    };

    /**
     * Initialize Google Translate
     */
    function initGoogleTranslate() {
        // Check if Google Translate script is already loaded
        if (window.google && window.google.translate) {
            createTranslateElement();
            return;
        }

        // Load Google Translate script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        
        // Set callback function
        window.googleTranslateElementInit = function() {
            createTranslateElement();
        };

        document.head.appendChild(script);
    }

    /**
     * Create the Google Translate element
     */
    function createTranslateElement() {
        if (!window.google || !window.google.translate) {
            console.error('Google Translate not loaded');
            return;
        }

        // Create container if it doesn't exist
        let container = document.getElementById(CONFIG.googleTranslateElementId);
        if (!container) {
            container = document.createElement('div');
            container.id = CONFIG.googleTranslateElementId;
            container.style.display = 'none'; // Hide default Google Translate UI
            container.style.visibility = 'hidden';
            container.style.height = '0';
            container.style.width = '0';
            container.style.overflow = 'hidden';
            container.className = 'skiptranslate'; // Add skiptranslate class
            document.body.appendChild(container);
        }
        
        // Hide any Google Translate UI that appears
        setTimeout(() => {
            const translateElements = document.querySelectorAll('.goog-te-banner-frame, .goog-te-menu-frame, .goog-te-banner, .goog-te-ftab, .skiptranslate');
            translateElements.forEach(el => {
                if (el.id !== CONFIG.googleTranslateElementId) {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.height = '0';
                    el.style.width = '0';
                    el.style.overflow = 'hidden';
                }
            });
        }, 100);

        // Initialize Google Translate
        new window.google.translate.TranslateElement({
            pageLanguage: CONFIG.defaultLanguage,
            includedLanguages: 'en,fr',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            gaTrack: true,
            gaId: 'G-V9P033BFER' // passEE Google Analytics ID
        }, CONFIG.googleTranslateElementId);
    }

    /**
     * Get current language from cookie
     */
    function getCurrentLanguage() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === CONFIG.cookieName && value) {
                // Cookie format: /en/fr means translating from en to fr
                const parts = value.split('/');
                if (parts.length >= 3) {
                    return parts[2]; // Target language
                }
            }
        }
        return CONFIG.defaultLanguage;
    }

    /**
     * Set language via Google Translate
     */
    function setLanguage(langCode) {
        if (!window.google || !window.google.translate) {
            console.error('Google Translate not loaded');
            return;
        }

        const selectElement = document.querySelector('.goog-te-combo');
        if (selectElement) {
            selectElement.value = langCode;
            selectElement.dispatchEvent(new Event('change'));
        } else {
            // Fallback: set cookie directly
            const targetLang = langCode === CONFIG.defaultLanguage ? CONFIG.defaultLanguage : langCode;
            const cookieValue = `/${CONFIG.defaultLanguage}/${targetLang}`;
            document.cookie = `${CONFIG.cookieName}=${cookieValue}; path=/; max-age=${CONFIG.cookieExpiry * 24 * 60 * 60}`;
            location.reload();
        }
    }

    /**
     * Create custom language switcher UI
     * Shows only the opposite language button
     */
    function createLanguageSwitcher() {
        // Remove existing switcher if any
        const existing = document.getElementById('custom-language-switcher');
        if (existing) {
            existing.remove();
        }

        // Get current language
        const currentLang = getCurrentLanguage();
        
        // Find the opposite language
        const oppositeLang = currentLang === 'en' 
            ? CONFIG.supportedLanguages['fr']
            : CONFIG.supportedLanguages['en'];

        // Create switcher container
        const switcher = document.createElement('div');
        switcher.id = 'custom-language-switcher';
        switcher.className = 'language-switcher';
        
        // Create single button for opposite language
        const button = document.createElement('button');
        button.className = 'lang-btn notranslate'; // notranslate prevents Google Translate from translating the button
        button.setAttribute('data-lang', oppositeLang.code);
        button.setAttribute('aria-label', `Switch to ${oppositeLang.displayName}`);
        button.textContent = oppositeLang.displayName;
        
        // Add click handler
        button.addEventListener('click', function(e) {
            e.preventDefault();
            setLanguage(oppositeLang.code);
        });
        
        switcher.appendChild(button);

        return switcher;
    }

    /**
     * Insert language switcher into header
     */
    function insertLanguageSwitcher() {
        // Try to find Portal button first (support both class names)
        const questionsPortalBtn = document.querySelector('.questions-portal-btn, .portal-btn');
        if (questionsPortalBtn) {
            // Insert right after Portal button
            const switcher = createLanguageSwitcher();
            questionsPortalBtn.parentNode.insertBefore(switcher, questionsPortalBtn.nextSibling);
            return;
        }

        // Fallback: Try to find header nav area
        const header = document.querySelector('header');
        if (!header) {
            console.warn('Header not found, appending to body');
            document.body.appendChild(createLanguageSwitcher());
            return;
        }

        // Try to find nav element
        const nav = header.querySelector('nav');
        if (nav) {
            // Insert at end of nav
            nav.appendChild(createLanguageSwitcher());
        } else {
            // Insert at end of header
            header.appendChild(createLanguageSwitcher());
        }

        // Also insert into mobile navigation menu
        insertMobileLanguageSwitcher();
    }

    /**
     * Insert language switcher into mobile navigation menu
     */
    function insertMobileLanguageSwitcher() {
        const mobileNavMenu = document.querySelector('.mobile-nav-menu');
        if (!mobileNavMenu) {
            // Retry after a short delay if mobile nav isn't ready
            setTimeout(insertMobileLanguageSwitcher, 100);
            return;
        }

        // Check if mobile switcher already exists (either placeholder or actual)
        const existing = document.getElementById('mobile-language-switcher');
        
        // Get current language
        const currentLang = getCurrentLanguage();
        const oppositeLang = currentLang === 'en' 
            ? CONFIG.supportedLanguages['fr']
            : CONFIG.supportedLanguages['en'];

        // Create button for mobile
        const button = document.createElement('button');
        button.className = 'mobile-lang-btn notranslate';
        button.setAttribute('data-lang', oppositeLang.code);
        button.setAttribute('aria-label', `Switch to ${oppositeLang.displayName}`);
        button.innerHTML = `<i class="fas fa-language"></i> ${oppositeLang.displayName}`;
        
        // Add click handler
        button.addEventListener('click', function(e) {
            e.preventDefault();
            setLanguage(oppositeLang.code);
        });
        
        if (existing) {
            // Check if button already exists to avoid duplicates
            const existingButton = existing.querySelector('.mobile-lang-btn');
            if (existingButton) {
                // Just update the existing button
                existingButton.setAttribute('data-lang', oppositeLang.code);
                existingButton.setAttribute('aria-label', `Switch to ${oppositeLang.displayName}`);
                existingButton.innerHTML = `<i class="fas fa-language"></i> ${oppositeLang.displayName}`;
                return;
            }
            // Replace placeholder or update existing
            existing.className = 'mobile-nav-item mobile-nav-language-switcher';
            existing.innerHTML = ''; // Clear any placeholder content
            existing.appendChild(button);
        } else {
            // Create new mobile language switcher
            const mobileSwitcher = document.createElement('div');
            mobileSwitcher.id = 'mobile-language-switcher';
            mobileSwitcher.className = 'mobile-nav-item mobile-nav-language-switcher';
            mobileSwitcher.appendChild(button);
            
            // Insert at the end of mobile nav menu
            mobileNavMenu.appendChild(mobileSwitcher);
        }
    }

    /**
     * Update language switcher when language changes
     * Recreates the switcher to show the opposite language
     */
    function updateLanguageSwitcher() {
        const questionsPortalBtn = document.querySelector('.questions-portal-btn, .portal-btn');
        if (questionsPortalBtn) {
            // Remove old switcher
            const existing = document.getElementById('custom-language-switcher');
            if (existing) {
                existing.remove();
            }
            // Create and insert new switcher
            const switcher = createLanguageSwitcher();
            questionsPortalBtn.parentNode.insertBefore(switcher, questionsPortalBtn.nextSibling);
        }
        
        // Also update mobile language switcher
        insertMobileLanguageSwitcher();
    }

    /**
     * Prevent passEE brand name from being translated
     * Only protects specific elements containing passEE, not entire paragraphs
     */
    function preventPassEETranslation() {
        // Only protect .site-name elements (the main brand name in header)
        const siteNameElements = document.querySelectorAll('.site-name');
        siteNameElements.forEach(el => {
            if (el.textContent && el.textContent.trim().match(/^passEE$/i)) {
                el.classList.add('notranslate');
            }
        });

        // Protect title tag if it starts with passEE
        const titleElement = document.querySelector('title');
        if (titleElement && titleElement.textContent.includes('passEE')) {
            // Only protect if passEE is at the start (brand name)
            if (titleElement.textContent.trim().startsWith('passEE')) {
                titleElement.classList.add('notranslate');
            }
        }

        // Protect elements that contain ONLY "passEE" (like brand mentions)
        // This is more selective - only elements where passEE is the main/only content
        const selectiveSelectors = ['.site-name', 'h1.site-name', 'h2.site-name'];
        selectiveSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const text = el.textContent.trim();
                    // Only protect if the element contains primarily "passEE"
                    if (text && (text === 'passEE' || text.match(/^passEE\s*$/i))) {
                        el.classList.add('notranslate');
                    }
                });
            } catch (e) {
                // Ignore invalid selectors
            }
        });
    }

    /**
     * Initialize everything
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Insert language switcher IMMEDIATELY - don't wait for anything
        // This ensures the button is always visible from the start
        insertLanguageSwitcher();

        // Prevent passEE from being translated
        preventPassEETranslation();

        // Initialize Google Translate (in background, doesn't block button display)
        initGoogleTranslate();

        /**
         * Aggressively hide Google Translate UI elements
         */
        function hideGoogleTranslateUI() {
            const selectors = [
                '.goog-te-banner-frame',
                '.goog-te-menu-frame',
                '.goog-te-banner',
                '.goog-te-ftab',
                '.goog-te-gadget',
                '.goog-te-gadget-simple',
                '.skiptranslate',
                'iframe[src*="translate.googleapis.com"]',
                'body > .goog-te-banner-frame',
                'body > .skiptranslate'
            ];

            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (el.id !== CONFIG.googleTranslateElementId) {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.style.height = '0';
                        el.style.width = '0';
                        el.style.overflow = 'hidden';
                        el.style.position = 'absolute';
                        el.style.left = '-9999px';
                    }
                });
            });
        }

        // Hide Google Translate UI immediately and continuously
        hideGoogleTranslateUI();
        setInterval(hideGoogleTranslateUI, 500);

        // Continuously prevent passEE translation (in case Google Translate modifies DOM)
        setInterval(preventPassEETranslation, 500);

        // Update language switcher after a short delay to reflect actual language
        // This updates the button text if language was already set
        setTimeout(() => {
            updateLanguageSwitcher();
            // Also ensure mobile switcher is inserted
            insertMobileLanguageSwitcher();
            hideGoogleTranslateUI();
        }, 100);
        
        // Also try inserting mobile switcher after a longer delay to ensure DOM is ready
        setTimeout(() => {
            insertMobileLanguageSwitcher();
        }, 500);

        // Listen for language changes and update switcher
        let lastLanguage = getCurrentLanguage();
        setInterval(() => {
            const currentLanguage = getCurrentLanguage();
            if (currentLanguage !== lastLanguage) {
                lastLanguage = currentLanguage;
                updateLanguageSwitcher();
                hideGoogleTranslateUI();
                preventPassEETranslation(); // Re-apply after language change
            }
            hideGoogleTranslateUI(); // Continuously hide UI
            preventPassEETranslation(); // Continuously prevent translation
        }, 1000);
    }

    // Start initialization
    init();

    // Export functions for external use if needed
    window.LanguageSwitcher = {
        setLanguage: setLanguage,
        getCurrentLanguage: getCurrentLanguage,
        updateLanguageSwitcher: updateLanguageSwitcher
    };

})();


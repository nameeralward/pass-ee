/**
 * Sale Popup Controller - Minimizable Version
 * 
 * TO ENABLE/DISABLE THE POPUP:
 * Set SALE_POPUP_ENABLED to true to show the popup, false to hide it
 */
const SALE_POPUP_ENABLED = true; // Change this to false to disable the popup

// Configuration
const POPUP_MINIMIZED_KEY = 'passEE_sale_popup_minimized';

/**
 * Initialize the sale popup
 */
function initSalePopup() {
    // Check if popup is enabled
    if (!SALE_POPUP_ENABLED) {
        return;
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showSalePopupMinimized);
    } else {
        // Small delay to ensure smooth page load
        setTimeout(showSalePopupMinimized, 500);
    }
}

/**
 * Show the sale popup (minimized by default)
 */
function showSalePopupMinimized() {
    const overlay = document.getElementById('sale-popup-overlay');
    if (overlay) {
        overlay.classList.add('show');
        overlay.classList.add('minimized'); // Start minimized
        document.body.style.overflow = ''; // Allow scrolling when minimized
        localStorage.setItem(POPUP_MINIMIZED_KEY, 'true');
    }
}

/**
 * Show the sale popup (expanded) - for manual expansion
 */
function showSalePopup() {
    const overlay = document.getElementById('sale-popup-overlay');
    if (overlay) {
        overlay.classList.add('show');
        overlay.classList.remove('minimized');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        localStorage.setItem(POPUP_MINIMIZED_KEY, 'false');
    }
}

/**
 * Minimize the sale popup
 */
function minimizeSalePopup() {
    const overlay = document.getElementById('sale-popup-overlay');
    if (overlay) {
        overlay.classList.add('minimized');
        document.body.style.overflow = ''; // Restore scrolling
        localStorage.setItem(POPUP_MINIMIZED_KEY, 'true');
    }
}

/**
 * Expand the sale popup from minimized state
 */
function expandSalePopup() {
    const overlay = document.getElementById('sale-popup-overlay');
    if (overlay) {
        overlay.classList.remove('minimized');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        localStorage.setItem(POPUP_MINIMIZED_KEY, 'false');
    }
}

/**
 * Toggle between minimized and expanded states
 */
function toggleSalePopup() {
    const overlay = document.getElementById('sale-popup-overlay');
    if (overlay) {
        if (overlay.classList.contains('minimized')) {
            expandSalePopup();
        } else {
            minimizeSalePopup();
        }
    }
}

// Initialize event listeners when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setupEventListeners();
    });
} else {
    setupEventListeners();
}

function setupEventListeners() {
    // Minimize button
    const minimizeButton = document.querySelector('.sale-popup-minimize');
    if (minimizeButton) {
        minimizeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            minimizeSalePopup();
        });
    }
    
    // Click on minimized container to expand
    const overlay = document.getElementById('sale-popup-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            // Only expand if clicking on the container when minimized
            if (overlay.classList.contains('minimized')) {
                const container = overlay.querySelector('.sale-popup-container');
                if (container && (e.target === container || container.contains(e.target))) {
                    expandSalePopup();
                }
            }
        });
    }
    
    // Click on minimized content to expand
    const minimizedContent = document.querySelector('.sale-minimized-content');
    if (minimizedContent) {
        minimizedContent.addEventListener('click', function(e) {
            e.stopPropagation();
            if (overlay && overlay.classList.contains('minimized')) {
                expandSalePopup();
            }
        });
    }
}

// Initialize the popup
initSalePopup();


document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavClose = document.querySelector('.mobile-nav-close');
    const dropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    const body = document.body;
    
    // Open mobile menu
    hamburgerMenu.addEventListener('click', function() {
        mobileNav.classList.add('active');
        body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    });
    
    // Close mobile menu
    function closeMenu() {
        mobileNav.classList.remove('active');
        body.style.overflow = '';
    }
    
    mobileNavClose.addEventListener('click', closeMenu);
    
    // Toggle dropdown menus
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(event) {
            // Prevent the click from bubbling up to the document
            event.stopPropagation();
            
            const parent = this.closest('.mobile-nav-item');
            const submenu = parent.querySelector('.mobile-nav-submenu');
            
            this.classList.toggle('active');
            
            if (submenu.classList.contains('active')) {
                submenu.classList.remove('active');
            } else {
                // Close any open submenus first
                document.querySelectorAll('.mobile-nav-submenu.active').forEach(menu => {
                    menu.classList.remove('active');
                    menu.previousElementSibling.querySelector('.mobile-dropdown-toggle').classList.remove('active');
                });
                
                submenu.classList.add('active');
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mobileNav.classList.contains('active') && 
            !mobileNav.contains(event.target) && 
            !hamburgerMenu.contains(event.target)) {
            closeMenu();
        }
    });
}); 
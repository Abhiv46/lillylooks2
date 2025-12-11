// Mobile Menu Toggle and Smooth Scrolling
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or a modal link
            if (href === '#' || href.includes('modal')) return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Modal functionality for Privacy Policy, Disclaimer, etc.
    const modalLinks = document.querySelectorAll('a[href*="modal"]');
    const modals = document.querySelectorAll('.modal');
    const body = document.body;
    
    modalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('href');
            const modal = document.querySelector(modalId);
            
            if (modal) {
                modal.style.display = 'flex';
                body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        });
    });
    
    // Close modal when clicking close button or outside modal
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            // Close if clicking the background (outside modal-content) or the close button
            if (e.target === this || e.target.classList.contains('modal-close')) {
                this.style.display = 'none';
                body.style.overflow = 'auto'; // Restore scrolling
            }
        });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                modal.style.display = 'none';
                body.style.overflow = 'auto';
            });
        }
    });
    
    // Highlight active nav link based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');
    
    function highlightNavLink() {
        let scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navItems.forEach(item => item.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavLink);
    
    // Product card hover effect enhancement
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '';
        });
    });
    
    // Console welcome message
    console.log('%c🌟 Lilly Looks UK - Website Loaded Successfully! 🌟', 'color: #ff4d8d; font-size: 16px; font-weight: bold;');
    console.log('%cAll systems go! Your beautiful UK-focused beauty site is ready.', 'color: #333;');
});

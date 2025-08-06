// About Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeAboutPage();
    
    // Add scroll animations
    initializeScrollAnimations();
    
    // Initialize authentication modals
    if (typeof createAuthModals === 'function') {
        createAuthModals();
    }
    
    // Render user actions in navbar
    if (typeof renderUserActions === 'function') {
        renderUserActions();
    }
});

function initializeAboutPage() {
    console.log('About page loaded successfully');
    
    // Set active nav link
    const currentPage = 'about.html';
    document.querySelectorAll('#main-navbar .nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initializeScrollAnimations() {
    // Create intersection observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        // Set initial state
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        observer.observe(card);
    });
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add click effect to feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
});

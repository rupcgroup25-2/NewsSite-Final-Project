// Dark Mode Manager - Professional Implementation with localStorage sync
class DarkModeManager {
    constructor() {
        this.storageKey = 'newsHubTheme';
        // Load theme IMMEDIATELY to prevent flash
        this.loadSavedThemeSync();
        this.init();
    }

    // Synchronous theme loading to prevent flash
    loadSavedThemeSync() {
        const savedTheme = localStorage.getItem(this.storageKey) || 'light';
        this.applyThemeSync(savedTheme);
    }

    // Apply theme synchronously without waiting for DOM
    applyThemeSync(theme) {
        // Add preload class to prevent transition flash
        document.documentElement.classList.add('preload');
        
        document.documentElement.setAttribute('data-bs-theme', theme);
        if (document.body) {
            document.body.setAttribute('data-bs-theme', theme);
            if (theme === 'dark') {
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
            } else {
                document.body.classList.add('light-theme');
                document.body.classList.remove('dark-theme');
            }
        }
        
        // Remove preload class after a brief delay
        setTimeout(() => {
            document.documentElement.classList.remove('preload');
        }, 100);
    }

    init() {
        this.bindEvents();
        this.listenToStorageChanges();
    }

    bindEvents() {
        // Bind to all toggle buttons across all pages
        $(document).on('click', '#toggle-dark', (e) => {
            e.preventDefault();
            this.toggleTheme();
        });

        // Apply theme when DOM is ready to update buttons
        $(document).ready(() => {
            const currentTheme = this.getCurrentTheme();
            this.updateToggleButtons(currentTheme);
        });
    }

    listenToStorageChanges() {
        // Listen for theme changes in other tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey && e.newValue) {
                this.applyTheme(e.newValue);
            }
        });
    }

    applyTheme(theme) {
        // Set theme on both html and body for maximum compatibility
        document.documentElement.setAttribute('data-bs-theme', theme);
        document.body.setAttribute('data-bs-theme', theme);
        
        // Update body class as well for legacy support
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
        
        // Update toggle buttons if they exist
        this.updateToggleButtons(theme);
        
        // Fire custom event for other components to listen
        $(document).trigger('themeChanged', [theme]);
        
        console.log(`Theme applied: ${theme}`); // For debugging
    }

    setTheme(theme) {
        // Save to localStorage first
        localStorage.setItem(this.storageKey, theme);
        
        // Apply the theme
        this.applyTheme(theme);
        
        console.log(`Theme changed to: ${theme}`); // For debugging
    }

    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    updateToggleButtons(theme) {
        const $buttons = $('#toggle-dark');
        const $icons = $buttons.find('i');
        
        if (theme === 'dark') {
            $icons.removeClass('bi-moon-stars-fill').addClass('bi-sun-fill');
            $buttons.attr('aria-label', 'Switch to light mode').attr('title', 'Switch to light mode');
        } else {
            $icons.removeClass('bi-sun-fill').addClass('bi-moon-stars-fill');
            $buttons.attr('aria-label', 'Switch to dark mode').attr('title', 'Switch to dark mode');
        }
    }

    getCurrentTheme() {
        return localStorage.getItem(this.storageKey) || 
               document.documentElement.getAttribute('data-bs-theme') || 
               'light';
    }

    // Force refresh theme from localStorage (useful for debugging)
    refreshTheme() {
        const savedTheme = localStorage.getItem(this.storageKey) || 'light';
        this.applyTheme(savedTheme);
    }
}

// Initialize immediately, before DOM ready to prevent flash
window.darkModeManager = new DarkModeManager();

// Also initialize when DOM is ready for safety
$(document).ready(function() {
    if (!window.darkModeManager) {
        window.darkModeManager = new DarkModeManager();
    }
});

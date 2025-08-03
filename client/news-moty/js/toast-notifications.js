/**
 * Toast Notification System
 * Modern, beautiful notifications that appear from top
 * Can be used across the entire project
 */

class ToastNotification {
    constructor() {
        this.toastContainer = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
            this.toastContainer = container;
        } else {
            this.toastContainer = document.getElementById('toast-container');
        }
    }

    show(message, type = 'info', title = '', duration = 4000) {
        const toast = this.createToast(message, type, title);
        this.toastContainer.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);

        // Auto remove
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        // Manual close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.removeToast(toast));
        }

        return toast;
    }

    createToast(message, type, title) {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        
        const config = this.getTypeConfig(type);
        
        toast.style.cssText = `
            background: ${config.background};
            color: ${config.color};
            border-left: 4px solid ${config.borderColor};
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2);
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: auto;
            position: relative;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255,255,255,0.2);
            min-width: 300px;
            max-width: 400px;
            word-wrap: break-word;
            z-index: 10000;
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="flex-shrink: 0; font-size: 20px; margin-top: 2px;">
                    ${config.icon}
                </div>
                <div style="flex: 1; min-width: 0;">
                    ${title ? `<div style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">${title}</div>` : ''}
                    <div style="font-size: 13px; line-height: 1.4; opacity: 0.95;">${message}</div>
                </div>
                <button class="toast-close" style="
                    background: none;
                    border: none;
                    color: inherit;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 8px;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                    flex-shrink: 0;
                " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
                    ×
                </button>
            </div>
            <div class="toast-progress" style="
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: ${config.borderColor};
                border-radius: 0 0 8px 8px;
                animation: toast-progress 4s linear forwards;
                opacity: 0.6;
            "></div>
        `;

        return toast;
    }

    getTypeConfig(type) {
        // Check if dark mode is active
        const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark' || 
                          document.body.getAttribute('data-bs-theme') === 'dark' ||
                          document.body.classList.contains('dark-mode');

        const configs = {
            success: {
                background: isDarkMode ? 
                    'linear-gradient(135deg, #1a4d2b 0%, #2d5a3d 100%)' : 
                    'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                color: isDarkMode ? '#a7f3d0' : '#155724',
                borderColor: '#28a745',
                icon: '✅'
            },
            error: {
                background: isDarkMode ? 
                    'linear-gradient(135deg, #4a1e20 0%, #5a2d30 100%)' : 
                    'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                color: isDarkMode ? '#fca5a5' : '#721c24',
                borderColor: '#dc3545',
                icon: '❌'
            },
            warning: {
                background: isDarkMode ? 
                    'linear-gradient(135deg, #4a3a1e 0%, #5a4a2d 100%)' : 
                    'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                color: isDarkMode ? '#fcd34d' : '#856404',
                borderColor: '#ffc107',
                icon: '⚠️'
            },
            info: {
                background: isDarkMode ? 
                    'linear-gradient(135deg, #1e3a4a 0%, #2d4a5a 100%)' : 
                    'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
                color: isDarkMode ? '#7dd3fc' : '#0c5460',
                borderColor: '#17a2b8',
                icon: 'ℹ️'
            }
        };
        return configs[type] || configs.info;
    }

    removeToast(toast) {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // Convenience methods
    success(message, title = 'Success', duration = 4000) {
        return this.show(message, 'success', title, duration);
    }

    error(message, title = 'Error', duration = 5000) {
        return this.show(message, 'error', title, duration);
    }

    warning(message, title = 'Warning', duration = 4500) {
        return this.show(message, 'warning', title, duration);
    }

    info(message, title = 'Info', duration = 4000) {
        return this.show(message, 'info', title, duration);
    }
}

// Add CSS animation for progress bar
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes toast-progress {
            from { width: 100%; }
            to { width: 0%; }
        }
        
        .toast-notification:hover .toast-progress {
            animation-play-state: paused;
        }
        
        /* Enhanced shadows and borders for better visibility */
        .toast-notification {
            box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2) !important;
            border: 2px solid rgba(255,255,255,0.2) !important;
        }
        
        /* Dark mode specific overrides */
        [data-bs-theme="dark"] .toast-notification,
        .dark-mode .toast-notification,
        body.dark-mode .toast-notification {
            box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4) !important;
            border: 2px solid rgba(255,255,255,0.3) !important;
        }
        
        /* Media query fallback for dark mode */
        @media (prefers-color-scheme: dark) {
            .toast-notification {
                box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4) !important;
                border: 2px solid rgba(255,255,255,0.3) !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Create global instance
window.Toast = new ToastNotification();

// Global convenience functions
window.showToast = (message, type, title, duration) => window.Toast.show(message, type, title, duration);
window.showSuccessToast = (message, title, duration) => window.Toast.success(message, title, duration);
window.showErrorToast = (message, title, duration) => window.Toast.error(message, title, duration);
window.showWarningToast = (message, title, duration) => window.Toast.warning(message, title, duration);
window.showInfoToast = (message, title, duration) => window.Toast.info(message, title, duration);

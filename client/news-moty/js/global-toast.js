/**
 * Global Toast Integration
 * Add this to any HTML page to enable beautiful toast notifications
 * 
 * Usage:
 * 1. Include this file: <script src="js/global-toast.js"></script>
 * 2. Use anywhere: showSuccessToast("Message!"), showErrorToast("Error!"), etc.
 */

// Replace all alert() calls with beautiful toasts
window.alert = function(message) {
    if (typeof message === 'string') {
        // Try to determine the type based on message content
        const msg = message.toLowerCase();
        if (msg.includes('success') || msg.includes('saved') || msg.includes('updated') || msg.includes('added') || msg.includes('sent')) {
            showSuccessToast(message);
        } else if (msg.includes('error') || msg.includes('failed') || msg.includes('wrong')) {
            showErrorToast(message);
        } else if (msg.includes('warning') || msg.includes('required') || msg.includes('invalid')) {
            showWarningToast(message);
        } else {
            showInfoToast(message);
        }
    }
};

// Override confirm() with a toast-based version (optional)
window.confirmToast = function(message, callback) {
    // For now, fall back to regular confirm, but could be enhanced with a modal
    const result = confirm(message);
    if (callback) callback(result);
    return result;
};

// Enhanced versions with better UX
window.showSuccess = (message, title) => showSuccessToast(message, title);
window.showError = (message, title) => showErrorToast(message, title);
window.showWarning = (message, title) => showWarningToast(message, title);
window.showInfo = (message, title) => showInfoToast(message, title);

// Auto-load toast system when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize toast system
    if (!window.Toast) {
        console.warn('Toast notification system not found. Make sure to include toast-notifications.js first.');
    } else {
        console.log('🎉 Toast notification system loaded and ready!');
    }
});

// ========================================
// News Site Push Notifications Manager
// Clean & Efficient Implementation
// ========================================

// Global variables for compatibility with original system
if (typeof messaging === 'undefined') {
    var messaging;
}

if (typeof currentFCMToken === 'undefined') {
    var currentFCMToken = null;
}

if (typeof notificationsInitialized === 'undefined') {
    var notificationsInitialized = false;
}

if (typeof subscribedUserId === 'undefined') {
    var subscribedUserId = null;
}

class NotificationManager {
    constructor() {
        this.messaging = null;
        this.currentFCMToken = null;
        this.isInitialized = false;
        this.subscribedUserId = null;
        this.isTokenSaving = false;
        // Use the correct VAPID key from firebaseConfig.js
        this.vapidKey = null; // Will be set from window.vapidKey in checkDependencies
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    async init() {
        if (this.isInitialized) return true;

        if (!this.checkDependencies()) return false;
        if (!this.checkBrowserSupport()) return false;


        try {
            await this.initFirebase();
            await this.setupMessaging();
            this.isInitialized = true;

            // Update global variables for compatibility
            window.notificationsInitialized = true;
            notificationsInitialized = true;

            this.loadUserStatus();
            return true;
        } catch (error) {

            // Even if Firebase fails, we can still do basic notifications
            this.isInitialized = true;

            // Update global variables for compatibility
            window.notificationsInitialized = true;
            notificationsInitialized = true;

            this.loadUserStatus();
            return true; // Return true to continue with basic functionality
        }
    }

    checkBrowserSupport() {
        if (!('Notification' in window)) {
            this.showStatus('Your browser does not support notifications', 'warning');
            return false;
        }
        if (!('serviceWorker' in navigator)) {
            this.showStatus('Your browser does not support push notifications', 'warning');
            return false;
        }
        return true;
    }

    checkDependencies() {
        // Check for global variables
        if (typeof serverUrl === 'undefined') {
            setTimeout(() => this.init(), 200);
            return false;
        }
        if (typeof ajaxCall === 'undefined') {
            setTimeout(() => this.init(), 200);
            return false;
        }
        if (typeof firebaseConfig === 'undefined') {
            setTimeout(() => this.init(), 200);
            return false;
        }

        // Set the VAPID key from global variable if available
        if (typeof vapidKey !== 'undefined') {
            this.vapidKey = window.vapidKey;
        }

        return true;
    }

    async initFirebase() {
        try {
            if (!window.app) {
                const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js');
                window.app = initializeApp(firebaseConfig);
            }

            // --- Manual Service Worker registration from your path ---
            const swPath = '/cgroup2/test2/tar5/client/news-moty/firebase-messaging-sw.js';
            if ('serviceWorker' in navigator) {
                await navigator.serviceWorker.register(swPath);
            }
            // ---------------------------------------------------

            const messagingModule = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js');
            if (!window.messaging) {
                window.messaging = messagingModule.getMessaging(window.app);
            }
            messaging = window.messaging;
            this.messaging = window.messaging;
            this.messagingModule = messagingModule;
        } catch (error) {
            throw error;
        }
    }

    async setupMessaging() {
        // Handle foreground messages
        this.messagingModule.onMessage(this.messaging, (payload) => {
            this.displayInAppNotification(payload);
        });

        // Request permission if needed, but don't fail if FCM doesn't work
        if (Notification.permission === 'default') {
            await this.requestPermission();
        } else if (Notification.permission === 'granted') {
            // Try to get token, but continue even if it fails
            try {
                await this.getToken();
            } catch (error) {
                // Silent fail for token generation
            }
        }
    }

    // ========================================
    // PERMISSION & TOKEN MANAGEMENT
    // ========================================

    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                try {
                    await this.getToken();
                } catch (error) {
                    // Silent fail for token generation
                }
            } else {
                this.showStatus('Please enable notifications in your browser settings', 'warning');
            }
        } catch (error) {
            console.error('❌ Error requesting permission:', error);
        }
    }

    async getToken() {
        try {
            if (this.currentFCMToken) return this.currentFCMToken;
            if (!this.messaging || !this.messagingModule) return null;

            // --- Addition: Get registration from your path ---
            const swRegistration = await navigator.serviceWorker.getRegistration('/cgroup2/test2/tar5/client/news-moty/firebase-messaging-sw.js');
            // ------------------------------------------------

            let token;
            if (this.vapidKey) {
                token = await this.messagingModule.getToken(this.messaging, {
                    vapidKey: this.vapidKey,
                    serviceWorkerRegistration: swRegistration 
                });
            } else {
                token = await this.messagingModule.getToken(this.messaging, {
                    serviceWorkerRegistration: swRegistration 
                });
            }

            if (token) {
                this.currentFCMToken = token;
                // Update global variable for compatibility
                window.currentFCMToken = token;
                currentFCMToken = token;

               if (currentUser?.id) {
                const status = localStorage.getItem(`notificationStatus_${currentUser.id}`);
                if (status === 'enabled') {
                    this.saveTokenToServer(currentUser.id, token);
                }
            }
            return token;
            } else {
                // Try to handle service worker registration
                await this.handleServiceWorkerRegistration();
            }
        } catch (error) {
            console.error('❌ Error getting FCM token:', error);

            // Check if it's a specific Firebase error
            if (error.code === 'messaging/token-subscribe-failed') {
                // Don't retry if it's an auth error
                return null;
            }

            // For other errors, try service worker fix
            await this.handleServiceWorkerRegistration();
        }
        return null;
    }


    async handleServiceWorkerRegistration() {
        if ('serviceWorker' in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                if (registrations.length === 0) {
                    try {
                        // Try different paths for service worker
                        const possiblePaths = [
                            '/firebase-messaging-sw.js',
                            './firebase-messaging-sw.js',
                            '../firebase-messaging-sw.js',
                            'cgroup2/test2/tar5/client/news-moty/firebase-messaging-sw.js'
                        ];

                        let registered = false;
                        for (const path of possiblePaths) {
                            try {
                                await navigator.serviceWorker.register(path);
                                registered = true;
                                break;
                            } catch (swError) {
                                // Silent fail and try next path
                            }
                        }

                        if (registered) {
                            // Wait a bit and retry token generation only if no auth error
                            setTimeout(() => {
                                if (!this.currentFCMToken) {
                                    this.getToken();
                                }
                            }, 2000);
                        }
                    } catch (swError) {
                        // Silent fail
                    }
                }
            } catch (error) {
                // Silent fail
            }
        }
    }

    saveTokenToServer(userId, token) {
        if (this.isTokenSaving) return;

        // Check if serverUrl is available
        if (typeof serverUrl === 'undefined' || typeof ajaxCall === 'undefined') {
            setTimeout(() => this.saveTokenToServer(userId, token), 1000);
            return;
        }

        this.isTokenSaving = true;

        ajaxCall(
            "POST",
            serverUrl + `Notifications/SaveFCMToken?userId=${userId}&fcmToken=${encodeURIComponent(token)}`,
            null,
            (response) => {
                this.updateUserStatus(userId, true);
                this.isTokenSaving = false;
            },
            (xhr) => {
                console.error('❌ Error saving token:', xhr.responseText);
                this.showStatus('Error saving notification settings', 'danger');
                this.isTokenSaving = false;
            }
        );
    }

    // ========================================
    // USER MANAGEMENT
    // ========================================

    subscribeUser(userId) {
        if (this.subscribedUserId === userId) return;

        this.subscribedUserId = userId;

        // Update global variables for compatibility
        window.subscribedUserId = userId;
        subscribedUserId = userId;

        const status = localStorage.getItem(`notificationStatus_${userId}`);
        if (this.currentFCMToken && status === 'enabled') {
            this.saveTokenToServer(userId, this.currentFCMToken);
        } else if (this.messaging) {
            // Try to get token, but don't wait for it
            this.getToken().catch(() => {
                // Silent fail
            });
        }

        this.showButton();
        this.loadUserStatus();
    }

    unsubscribeUser() {
        if (this.subscribedUserId && this.currentFCMToken && typeof serverUrl !== 'undefined' && typeof ajaxCall !== 'undefined') {
            ajaxCall(
                "DELETE",
                serverUrl + `Notifications/ClearFCMToken?userId=${this.subscribedUserId}`,
                null,
                () => { }, // Silent success
                (xhr) => { } // Silent fail
            );
        }

        this.subscribedUserId = null;
        this.hideButton();
    }

    updateUserStatus(userId, isEnabled) {
        localStorage.setItem(`notificationStatus_${userId}`, isEnabled ? 'enabled' : 'disabled');
        this.updateIcon(isEnabled);
    }

    loadUserStatus() {
        if (!currentUser?.id) {
            this.updateIcon(false);
            return;
        }

        const userId = currentUser.id;
        const savedStatus = localStorage.getItem(`notificationStatus_${userId}`) || 'disabled';
        this.updateIcon(savedStatus === 'enabled');

    }


    // ========================================
    // NOTIFICATION CONTROL
    // ========================================

    async enable(userId) {
        // Check if serverUrl is available
        if (typeof serverUrl === 'undefined' || typeof ajaxCall === 'undefined') {
            this.showStatus('Server not ready, please try again in a moment', 'warning');
            return;
        }

        try {
            await new Promise((resolve, reject) => {
                ajaxCall(
                    "PUT",
                    serverUrl + `Notifications/EnableFCMToken?userId=${userId}`,
                    null,
                    resolve,
                    reject
                );
            });

            this.updateUserStatus(userId, true);
            this.showStatus('Notifications enabled successfully', 'success');
        } catch (error) {
            this.showStatus('Error enabling notifications', 'danger');
        }
    }

    async disable(userId) {
        // Check if serverUrl is available
        if (typeof serverUrl === 'undefined' || typeof ajaxCall === 'undefined') {
            this.showStatus('Server not ready, please try again in a moment', 'warning');
            return;
        }

        try {
            await new Promise((resolve, reject) => {
                ajaxCall(
                    "PUT",
                    serverUrl + `Notifications/DisableFCMToken?userId=${userId}`,
                    null,
                    resolve,
                    reject
                );
            });

            this.updateUserStatus(userId, false);
            this.showStatus('Notifications disabled successfully', 'success');
        } catch (error) {
            this.showStatus('Error disabling notifications', 'danger');
        }
    }


    // ========================================
    // NOTIFICATION DISPLAY
    // ========================================

    displayInAppNotification(payload) {
        const { notification, data } = payload;
        this.showBadge();
        this.playSound();
        const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));

        const html = `
            <div class="alert alert-info alert-dismissible fade show notification-popup animate__animated animate__slideInRight" 
                 style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 350px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div class="d-flex align-items-start">
                    <i class="bi bi-bell-fill me-2 mt-1"></i>
                    <div class="flex-grow-1">
                        <strong>${notification.title}</strong><br>
                        <small>${notification.body}</small>
                        ${data && data.url && data.type !== "new_follower" && data.type !== "new_comment" ? `
                        <div class="mt-2">
                            <button class="btn btn-sm btn-primary me-2" onclick="window.open('${baseUrl + data.url}', '_blank'); $(this).closest('.notification-popup').remove();">
                                <i class="bi bi-eye"></i> View
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="$(this).closest('.notification-popup').remove()">
                                <i class="bi bi-x"></i> Dismiss
                            </button>
                        </div>
                        ` : ``}
                    </div>
                    <button type="button" class="btn-close ms-2" onclick="$(this).closest('.notification-popup').remove()"></button>
                </div>
            </div>
        `;

        $('body').append(html);
        setTimeout(() => $('.notification-popup').remove(), 8000);
    }

    // ========================================
    // UI HELPERS
    // ========================================

    showButton() {
        const btn = document.getElementById('notifications-btn');
        if (btn) {
            btn.style.display = 'block';
            if (!btn.onclick) {
                btn.onclick = () => this.toggleNotifications();
            }
        }
    }

    hideButton() {
        const btn = document.getElementById('notifications-btn');
        if (btn) btn.style.display = 'none';
    }

    updateIcon(isEnabled) {
        const btn = document.getElementById('notifications-btn');
        if (btn) {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isEnabled ? 'bi bi-bell-fill' : 'bi bi-bell-slash';
                btn.title = isEnabled ? 'Notifications enabled' : 'Notifications disabled';
            }
        }
    }

    showBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) badge.style.display = 'block';
    }

    hideBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) badge.style.display = 'none';
    }

    playSound() {
        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => { });
        } catch (error) {
            // Sound not available, ignore
        }
    }

    showStatus(message, type = 'info') {
        // Show toast notification if available
        if (typeof showInfoToast === 'function' && type === 'info') {
            showInfoToast(message, 'Notifications');
        } else if (typeof showSuccessToast === 'function' && type === 'success') {
            showSuccessToast(message, 'Notifications');
        } else if (typeof showWarningToast === 'function' && type === 'warning') {
            showWarningToast(message, 'Notifications');
        } else if (typeof showDangerToast === 'function' && type === 'danger') {
            showDangerToast(message, 'Notifications');
        }
    }

    async toggleNotifications() {
        if (!currentUser?.id) {
            this.showStatus('Please log in first', 'warning');
            return;
        }

        const userId = currentUser.id;
        const currentStatus = localStorage.getItem(`notificationStatus_${userId}`) || 'disabled';

        if (currentStatus === 'enabled') {
            await this.disable(userId);
        } else {
            await this.enable(userId);
        }
    }
}


// Create global instance
const notificationManager = new NotificationManager();

// Legacy function compatibility
window.initNotificationsOnPageLoad = function () {
    notificationManager.showButton();

    if (!notificationManager.isInitialized) {
        notificationManager.init();
    }

    if (currentUser?.id) {
        notificationManager.subscribeUser(currentUser.id);
    }
};

window.onUserLogin = function (user) {
    if (user?.id) {
        if (localStorage.getItem("notificationStatus_" + user.id) == null)
            localStorage.setItem("notificationStatus_" + user.id, 'enabled')
        notificationManager.subscribeUser(user.id);
    }
};

window.onUserLogout = function () {
    notificationManager.unsubscribeUser();
    clearFCMTokenOnLogout();
};

// Function to clean up FCM token when user logs out
window.clearFCMTokenOnLogout = function () {
    if (currentFCMToken && subscribedUserId) {
        // שלח בקשה לשרת להסיר את הטוקן הזה מהמשתמש הישן
        if (typeof ajaxCall !== 'undefined' && typeof serverUrl !== 'undefined') {
            ajaxCall(
                "DELETE",
                `${serverUrl}Notifications/ClearSpecificFCMToken?userId=${subscribedUserId}&fcmToken=${encodeURIComponent(currentFCMToken)}`,
                null,
                function (response) {
                    // Token cleared successfully
                },
                function (xhr) {
                    console.error('⚠️ Failed to clear FCM token:', xhr.responseText);
                }
            );
        }
    }

    // נקה משתנים מקומיים
    subscribedUserId = null;
    // אל תנקה את currentFCMToken כי זה עדיין רלוונטי למכשיר
};

// פונקציה משופרת להחלפת משתמש שמנקה טוקן ישן
window.switchUserNotifications = function (newUserId) {
    // נקה טוקן מהמשתמש הקודם
    if (subscribedUserId && subscribedUserId !== newUserId) {
        clearFCMTokenOnLogout();
    }

    // הרשם למשתמש החדש
    if (newUserId && notificationManager) {
        notificationManager.subscribeUser(newUserId);
    }
};

// פונקציה לביטול הרשמה למשתמש
window.unsubscribeUserFromNotifications = function () {
    // נקה את הטוקן מהשרת לפני התנתקות
    clearFCMTokenOnLogout();

    // נקה משתנים גלובליים
    subscribedUserId = null;
    notificationsInitialized = false;

    // עדכן UI
    if (notificationManager && notificationManager.hideButton) {
        notificationManager.hideButton();
    }
};

// פונקציה להחלפת סגנון התראות בקלות

window.subscribeUserToNotifications = function (userId) {
    if (notificationManager && notificationManager.subscribeUser) {
        notificationManager.subscribeUser(userId);
    } else {
        setTimeout(() => window.subscribeUserToNotifications(userId), 1000);
    }
};

window.initializeNotifications = async function () {
    if (notificationManager && notificationManager.init) {
        return await notificationManager.init();
    } else {
        return false;
    }
};


// ========================================
// AUTO-INITIALIZATION
// ========================================

// Initialize when DOM is ready
$(document).ready(function () {
    // Give more time for all dependencies to load
    setTimeout(() => notificationManager.init(), 500);
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    function waitForNavbar() {
        const navbar = document.querySelector('.navbar') || document.getElementById('navbar');
        if (navbar) {
            // Wait a bit more for serverUrl to be ready
            setTimeout(() => {
                window.initNotificationsOnPageLoad();
            }, 300);
        } else {
            setTimeout(waitForNavbar, 100);
        }
    }
    waitForNavbar();
});

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

        if (!this.checkBrowserSupport()) return false;
        if (!this.checkDependencies()) return false;

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
            console.error('❌ NotificationManager initialization failed:', error);
            
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
            console.error('❌ Browser does not support notifications');
            this.showStatus('Your browser does not support notifications', 'warning');
            return false;
        }
        if (!('serviceWorker' in navigator)) {
            console.error('❌ Browser does not support service workers');
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

            // --- הוספה: רישום Service Worker ידני מהנתיב שלך ---
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
            console.error('❌ Firebase initialization failed:', error);
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

            // --- הוספה: קבל את ה-registration מהנתיב שלך ---
            const swRegistration = await navigator.serviceWorker.getRegistration('/cgroup2/test2/tar5/client/news-moty/firebase-messaging-sw.js');
            // ------------------------------------------------

            let token;
            if (this.vapidKey) {
                token = await this.messagingModule.getToken(this.messaging, {
                    vapidKey: this.vapidKey,
                    serviceWorkerRegistration: swRegistration // הוסף את זה
                });
            } else {
                token = await this.messagingModule.getToken(this.messaging, {
                    serviceWorkerRegistration: swRegistration // הוסף את זה
                });
            }

            if (token) {
                this.currentFCMToken = token;
                // Update global variable for compatibility
                window.currentFCMToken = token;
                currentFCMToken = token;
                
                if (currentUser?.id) {
                    this.saveTokenToServer(currentUser.id, token);
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
        
        if (this.currentFCMToken) {
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
                () => {}, // Silent success
                (xhr) => {} // Silent fail
            );
        }
        
        this.subscribedUserId = null;
        this.hideButton();
    }

    updateUserStatus(userId, isEnabled) {
        localStorage.setItem(`notificationStatus_${userId}`, isEnabled ? 'enabled' : 'disabled');
        localStorage.setItem(`lastNotificationUpdate_${userId}`, Date.now().toString());
        this.updateIcon(isEnabled);
    }

    loadUserStatus() {
        if (!currentUser?.id) {
            this.updateIcon(false);
            return;
        }

        const userId = currentUser.id;
        const savedStatus = localStorage.getItem(`notificationStatus_${userId}`) || 'disabled';
        const lastUpdate = localStorage.getItem(`lastNotificationUpdate_${userId}`);
        
        this.updateIcon(savedStatus === 'enabled');
        
        // Check server if data is old (30 seconds)
        if (!lastUpdate || (Date.now() - parseInt(lastUpdate)) > 30000) {
            this.checkServerStatus(userId);
        }
    }

    async checkServerStatus(userId) {
        try {
            // Double check serverUrl is available
            if (typeof serverUrl === 'undefined') {
                return;
            }

            const response = await new Promise((resolve, reject) => {
                ajaxCall(
                    "GET",
                    serverUrl + `Notifications/NotificationStatus?userId=${userId}`,
                    null,
                    resolve,
                    reject
                );
            });
            
            const isEnabled = response?.notificationsEnabled === true;
            this.updateUserStatus(userId, isEnabled);
        } catch (error) {
            // Silent fail
        }
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
            console.error('❌ Error enabling notifications:', error);
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
            console.error('❌ Error disabling notifications:', error);
            this.showStatus('Error disabling notifications', 'danger');
        }
    }

    async sendTest(userId) {
        if (!userId) {
            this.showStatus('Please log in first', 'warning');
            return;
        }

        // Check if serverUrl is available
        if (typeof serverUrl === 'undefined' || typeof ajaxCall === 'undefined') {
            this.showStatus('Server not ready, please try again in a moment', 'warning');
            return;
        }
        
        try {
            // If we have a token, save it first
            if (this.currentFCMToken) {
                await new Promise((resolve, reject) => {
                    ajaxCall(
                        "POST",
                        serverUrl + `Notifications/SaveFCMToken?userId=${userId}&fcmToken=${encodeURIComponent(this.currentFCMToken)}`,
                        null,
                        resolve,
                        reject
                    );
                });
            }

            // Send test
            await new Promise((resolve, reject) => {
                ajaxCall(
                    "POST",
                    serverUrl + `Notifications/TestNotification?userId=${userId}`,
                    null,
                    resolve,
                    reject
                );
            });

            this.showStatus('Test notification sent! Check your device.', 'success');
            
            // Show local test notification
            setTimeout(() => {
                this.showCustomNotification(
                    "Test Notification", 
                    "This is a test notification to verify your settings!"
                );
            }, 1000);
        } catch (error) {
            console.error('❌ Test notification failed:', error);
            
            // Still show local notification as fallback
            this.showCustomNotification(
                "Test Notification", 
                "This is a test notification (local only - server test failed)"
            );
            this.showStatus('Test notification failed on server, but local notification works', 'warning');
        }
    }

    // ========================================
    // NOTIFICATION DISPLAY
    // ========================================

    displayInAppNotification(payload) {
        const { notification, data } = payload;
        this.showBadge();
        this.playSound();

        const html = `
            <div class="alert alert-info alert-dismissible fade show notification-popup animate__animated animate__slideInRight" 
                 style="position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 350px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div class="d-flex align-items-start">
                    <i class="bi bi-bell-fill me-2 mt-1"></i>
                    <div class="flex-grow-1">
                        <strong>${notification.title}</strong><br>
                        <small>${notification.body}</small>
                        ${data?.url ? `
                        <div class="mt-2">
                            <button class="btn btn-sm btn-primary me-2" onclick="window.open('${data.url}', '_blank'); $(this).closest('.notification-popup').remove();">
                                <i class="bi bi-eye"></i> View
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="$(this).closest('.notification-popup').remove()">
                                <i class="bi bi-x"></i> Dismiss
                            </button>
                        </div>
                        ` : `
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-secondary" onclick="$(this).closest('.notification-popup').remove()">
                                <i class="bi bi-x"></i> Dismiss
                            </button>
                        </div>
                        `}
                    </div>
                    <button type="button" class="btn-close ms-2" onclick="$(this).closest('.notification-popup').remove()"></button>
                </div>
            </div>
        `;

        $('body').append(html);
        setTimeout(() => $('.notification-popup').remove(), 8000);
    }

    showCustomNotification(title, body, data = null) {
        const userId = currentUser?.id || 'global';
        const style = localStorage.getItem(`notificationStyle_${userId}`) || 'auto';
        const isVisible = !document.hidden && document.visibilityState === 'visible';
        
        let useSystem = false;
        switch(style) {
            case 'system': useSystem = true; break;
            case 'inpage': useSystem = false; break;
            case 'auto': useSystem = !isVisible; break;
        }

        if (useSystem && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                tag: 'custom-notification'
            });
        }

        // Always show in-page notification
        const html = `
            <div class="custom-notification alert alert-info alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; max-width: 350px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div class="d-flex align-items-start">
                    <span style="font-size: 20px; margin-right: 10px;">🔔</span>
                    <div class="flex-grow-1">
                        <strong>${title}</strong><br>
                        <small>${body}</small>
                        ${data?.url ? `
                        <div class="mt-2">
                            <button class="btn btn-sm btn-primary me-2" onclick="window.open('${data.url}', '_blank'); this.closest('.custom-notification').remove();">
                                👁️ View
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="this.closest('.custom-notification').remove();">
                                ✅ OK
                            </button>
                        </div>
                        ` : `
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-secondary" onclick="this.closest('.custom-notification').remove();">
                                ✅ OK
                            </button>
                        </div>
                        `}
                    </div>
                    <button type="button" class="btn-close" onclick="this.closest('.custom-notification').remove();">✖️</button>
                </div>
            </div>
        `;

        if (typeof $ !== 'undefined') {
            $('body').append(html);
        } else {
            document.body.insertAdjacentHTML('beforeend', html);
        }

        setTimeout(() => {
            const notification = document.querySelector('.custom-notification');
            if (notification) notification.remove();
        }, 10000);
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
            audio.play().catch(() => {});
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

window.checkNotificationCapabilities = function() {
    console.log('🔍 === NOTIFICATION CAPABILITIES CHECK ===');
    console.log('📱 Notification permission:', Notification.permission);
    console.log('🔧 Service Worker support:', 'serviceWorker' in navigator);
    console.log('🌐 Browser notifications API:', 'Notification' in window);
    console.log('🔑 Current FCM Token (Manager):', notificationManager.currentFCMToken ? 'Available' : 'None');
    console.log('� Current FCM Token (Global):', currentFCMToken ? 'Available' : 'None');
    console.log('�🚀 Manager initialized:', notificationManager.isInitialized);
    console.log('� Global initialized:', notificationsInitialized);
    console.log('�👤 Current user:', currentUser ? currentUser.email : 'Not logged in');
};

// Create global instance
const notificationManager = new NotificationManager();

// Legacy function compatibility
window.initNotificationsOnPageLoad = function() {
    notificationManager.showButton();
    
    if (!notificationManager.isInitialized) {
        notificationManager.init();
    }
    
    if (currentUser?.id) {
        notificationManager.subscribeUser(currentUser.id);
    }
};

window.onUserLogin = function(user) {
    if (user?.id) {
        notificationManager.subscribeUser(user.id);
    }
};

window.onUserLogout = function() {
    notificationManager.unsubscribeUser();
    clearFCMTokenOnLogout();
};

// פונקציה לניקוי טוקן FCM כשמשתמש מתנתק
window.clearFCMTokenOnLogout = function() {
    if (currentFCMToken && subscribedUserId) {
        // שלח בקשה לשרת להסיר את הטוקן הזה מהמשתמש הישן
        if (typeof ajaxCall !== 'undefined' && typeof serverUrl !== 'undefined') {
            ajaxCall(
                "DELETE",
                `${serverUrl}Notifications/ClearSpecificFCMToken?userId=${subscribedUserId}&fcmToken=${encodeURIComponent(currentFCMToken)}`,
                null,
                function(response) {
                    // Token cleared successfully
                },
                function(xhr) {
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
window.switchUserNotifications = function(newUserId) {
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
window.unsubscribeUserFromNotifications = function() {
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

// Alias for backward compatibility
window.hideNotificationButton = function() {
    if (notificationManager && notificationManager.hideButton) {
        notificationManager.hideButton();
    }
};

window.sendTestNotification = function(userId) {
    notificationManager.sendTest(userId || currentUser?.id);
};

window.enableNotifications = function(userId) {
    notificationManager.enable(userId || currentUser?.id);
};

window.disableNotifications = function(userId) {
    notificationManager.disable(userId || currentUser?.id);
};

// פונקציה להחלפת סגנון התראות בקלות
window.switchNotificationStyle = function(style) {
    const validStyles = ['system', 'inpage', 'auto'];
    if (!validStyles.includes(style)) {
        console.error('❌ Invalid style. Use: system, inpage, or auto');
        return;
    }
    
    // שמור לפי משתמש נוכחי אם יש
    const userId = currentUser && currentUser.id ? currentUser.id : 'global';
    localStorage.setItem(`notificationStyle_${userId}`, style);
};

// פונקציה לסימולציה של דף לא פעיל (לבדיקת auto mode)
window.simulatePageHidden = function() {
    // שמור מצב מקורי
    const originalVisibilityState = document.visibilityState;
    const originalHidden = document.hidden;
    
    // סמלט מצב hidden
    Object.defineProperty(document, 'visibilityState', { 
        value: 'hidden', 
        writable: true 
    });
    Object.defineProperty(document, 'hidden', { 
        value: true, 
        writable: true 
    });
    
    console.log('📱 Page simulated as hidden - testing notification...');
    
    // שלח התראת בדיקה
    if (notificationManager) {
        notificationManager.displayInAppNotification({
            notification: {
                title: 'Hidden Page Test',
                body: 'This should show as system notification'
            }
        });
    }
    
    // החזר למצב מקורי אחרי 3 שניות
    setTimeout(() => {
        Object.defineProperty(document, 'visibilityState', { 
            value: originalVisibilityState, 
            writable: true 
        });
        Object.defineProperty(document, 'hidden', { 
            value: originalHidden, 
            writable: true 
        });
        console.log('👁️ Page visibility restored');
    }, 3000);
};

window.manuallyUnsubscribeFromNotifications = function(userId) {
    if (notificationManager.currentFCMToken && confirm('Are you sure you want to stop receiving notifications?')) {
        notificationManager.disable(userId || currentUser?.id);
    }
};

window.refreshFCMToken = async function(userId) {
    if (notificationManager && notificationManager.getToken) {
        try {
            // Clear current token and get new one
            notificationManager.currentFCMToken = null;
            currentFCMToken = null;
            window.currentFCMToken = null;
            
            const newToken = await notificationManager.getToken();
            if (newToken && userId) {
                notificationManager.saveTokenToServer(userId, newToken);
            }
            return !!newToken;
        } catch (error) {
            console.error('❌ Error refreshing FCM token:', error);
            return false;
        }
    }
    return false;
};

window.validateAndRefreshTokenIfNeeded = async function(userId) {
    if (!userId || !notificationManager) return false;
    
    try {
        // If no token exists, try to get one
        if (!notificationManager.currentFCMToken) {
            return await window.refreshFCMToken(userId);
        }
        
        // Token exists, assume it's valid
        return true;
    } catch (error) {
        console.error('❌ Error validating token:', error);
        return false;
    }
};

window.loadNotificationStatus = function(retryCount = 0) {
    if (notificationManager && notificationManager.loadUserStatus) {
        notificationManager.loadUserStatus();
    } else if (retryCount < 5) {
        // Retry if manager not ready
        setTimeout(() => window.loadNotificationStatus(retryCount + 1), 1000 + (retryCount * 500));
    }
};

window.subscribeUserToNotifications = function(userId) {
    if (notificationManager && notificationManager.subscribeUser) {
        notificationManager.subscribeUser(userId);
    } else {
        console.log('⚠️ Notification manager not ready, will retry...');
        setTimeout(() => window.subscribeUserToNotifications(userId), 1000);
    }
};

window.initializeNotifications = async function() {
    if (notificationManager && notificationManager.init) {
        return await notificationManager.init();
    } else {
        console.log('⚠️ Notification manager not available');
        return false;
    }
};

window.checkNotificationStatus = function(userId) {
    return notificationManager.checkServerStatus(userId || currentUser?.id);
};

window.showCustomNotification = function(title, body, data) {
    notificationManager.showCustomNotification(title, body, data);
};

// Also provide it as global function
window.showCustomNotification = function(title, body, data) {
    if (notificationManager && notificationManager.showCustomNotification) {
        notificationManager.showCustomNotification(title, body, data);
    } else {
        // Fallback if manager not ready
        console.log('Notification:', title, body);
    }
};

// Debug function to check notification status
window.checkNotificationCapabilities = function() {
    console.log('🔍 === NOTIFICATION CAPABILITIES CHECK ===');
    console.log('Browser Notification API:', 'Notification' in window ? '✅' : '❌');
    console.log('Service Worker API:', 'serviceWorker' in navigator ? '✅' : '❌');
    console.log('Notification Permission:', Notification.permission);
    console.log('Firebase Initialized:', notificationManager.isInitialized ? '✅' : '❌');
    console.log('FCM Token Available:', notificationManager.currentFCMToken ? '✅' : '❌');
    console.log('User Subscribed:', notificationManager.subscribedUserId ? `✅ (${notificationManager.subscribedUserId})` : '❌');
    
    if (notificationManager.currentFCMToken) {
        console.log('🚀 Full push notification support');
    } else {
        console.log('🔔 Local notification support only');
        console.log('💡 You can still receive:');
        console.log('  • In-app notifications when browsing');
        console.log('  • Browser notifications when page is open');
    }
    
    console.log('=====================================');
    
    return {
        browserSupport: 'Notification' in window && 'serviceWorker' in navigator,
        permission: Notification.permission,
        fcmToken: !!notificationManager.currentFCMToken,
        initialized: notificationManager.isInitialized,
        userSubscribed: !!notificationManager.subscribedUserId
    };
};

// ========================================
// AUTO-INITIALIZATION
// ========================================

// Initialize when DOM is ready
$(document).ready(function() {
    console.log('📱 DOM ready, initializing notifications...');
    // Give more time for all dependencies to load
    setTimeout(() => notificationManager.init(), 500);
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
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

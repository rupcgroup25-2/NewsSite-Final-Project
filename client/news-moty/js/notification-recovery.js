// This file contained experimental recovery code - no longer needed
// Main notification functionality is in notifications.js
// File kept empty to prevent 404 errors - will be deleted manually
//            if (typeof firebase !== 'undefined' && firebase.initializeApp) {
//                window.app = firebase.initializeApp(firebaseConfig);
//                console.log('✅ Firebase initialized with compat API');
//            } else {
//                // נסה עם modern API
//                const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js');
//                window.app = initializeApp(firebaseConfig);
//                console.log('✅ Firebase initialized with modern API');
//            }
//        }
        
//        return true;
//    } catch (error) {
//        console.error('❌ Error initializing Firebase:', error);
//        throw error;
//    }
//}

//// הגדרת listeners
//function setupNotificationListeners() {
//    console.log('👂 Setting up notification listeners...');
    
//    // listener לhentראות נכנסות
//    if (typeof firebase !== 'undefined' && firebase.messaging) {
//        try {
//            const messaging = firebase.messaging();
            
//            messaging.onMessage((payload) => {
//                console.log('🔔 Message received while app is open:', payload);
//                showInAppNotification(payload);
//            });
            
//            console.log('✅ Message listener set up');
//        } catch (error) {
//            console.log('⚠️ Could not set up message listener:', error);
//        }
//    }
//}

//// הגדרת התראות למשתמש
//async function setupUserNotifications(userId) {
//    console.log('👤 Setting up notifications for user:', userId);
    
//    try {
//        // וודא שיש הרשאה
//        if (Notification.permission !== 'granted') {
//            throw new Error('Notification permission not granted');
//        }
        
//        // קבל FCM token
//        const token = await getFCMTokenSimple();
//        if (token) {
//            currentFCMToken = token;
//            console.log('📧 FCM Token obtained:', token.substring(0, 20) + '...');
            
//            // שמור בשרת
//            await saveFCMTokenToServer(userId, token);
//            subscribedUserId = userId;
            
//            console.log('✅ User notifications setup completed');
//        } else {
//            throw new Error('Could not obtain FCM token');
//        }
        
//    } catch (error) {
//        console.error('❌ Error setting up user notifications:', error);
//        throw error;
//    }
//}

//// קבלת FCM token פשוטה
//async function getFCMTokenSimple() {
//    console.log('🔐 Getting FCM token...');
    
//    try {
//        // רישום Service Worker מותאם ל-v12
//        console.log('🔧 Registering service worker...');
//        const registration = await navigator.serviceWorker.register('./firebase-messaging-sw-v12.js', {
//            scope: '/firebase-cloud-messaging-push-scope'
//        });
        
//        console.log('✅ Service worker registered successfully');
        
//        // ודא שה-service worker פעיל
//        await navigator.serviceWorker.ready;
//        console.log('🟢 Service worker is ready');
        
//        // השתמש ב-modern API
//        const { getMessaging, getToken } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js');
//        const messaging = getMessaging(window.app);
        
//        console.log('📨 Getting token with VAPID key...');
//        let token;
        
//        if (typeof vapidKey !== 'undefined') {
//            token = await getToken(messaging, { 
//                vapidKey: vapidKey,
//                serviceWorkerRegistration: registration
//            });
//        } else {
//            console.warn('⚠️ No VAPID key found, getting token without it');
//            token = await getToken(messaging, {
//                serviceWorkerRegistration: registration
//            });
//        }
        
//        if (token) {
//            console.log('✅ FCM Token received:', token.substring(0, 30) + '...');
            
//            // שמור בזיכרון גלובלי
//            window.currentFCMToken = token;
            
//            return token;
//        } else {
//            throw new Error('No FCM token received');
//        }
        
//    } catch (error) {
//        console.error('❌ Error getting FCM token:', error);
//        throw error;
//    }
//}

//// שמירת טוקן בשרת
//async function saveFCMTokenToServer(userId, token) {
//    console.log('💾 Saving FCM token to server...');
    
//    return new Promise((resolve, reject) => {
//        ajaxCall(
//            "POST",
//            serverUrl + `Notifications/SaveFCMToken?userId=${userId}&fcmToken=${encodeURIComponent(token)}`,
//            "",
//            function (response) {
//                console.log('✅ FCM token saved successfully');
//                resolve(response);
//            },
//            function (xhr) {
//                console.error('❌ Error saving FCM token:', xhr.responseText);
//                reject(new Error('Failed to save token: ' + xhr.responseText));
//            }
//        );
//    });
//}

//// שליחת התראת בדיקה
//async function sendTestNotification(userId) {
//    console.log('🧪 Sending test notification...');
    
//    return new Promise((resolve, reject) => {
//        ajaxCall(
//            "POST",
//            serverUrl + `Notifications/TestNotification?userId=${userId}`,
//            "",
//            function (response) {
//                console.log('✅ Test notification sent');
//                alert('Test notification sent! Check your device.');
//                resolve(response);
//            },
//            function (xhr) {
//                console.error('❌ Error sending test notification:', xhr.responseText);
//                alert('Error sending test notification: ' + xhr.responseText);
//                reject(new Error('Failed to send test: ' + xhr.responseText));
//            }
//        );
//    });
//}

//// הצגת התראה באפליקציה
//function showInAppNotification(payload) {
//    const notification = payload.notification;
    
//    if (!notification) return;
    
//    // יצירת התראה ויזואלית
//    const notificationHtml = `
//        <div class="alert alert-info alert-dismissible fade show position-fixed" 
//             style="top: 20px; right: 20px; z-index: 9999; max-width: 350px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" role="alert">
//            <div class="d-flex align-items-start">
//                <i class="bi bi-bell-fill me-2 mt-1 text-primary"></i>
//                <div class="flex-grow-1">
//                    <strong>${notification.title}</strong><br>
//                    <small class="text-muted">${notification.body}</small>
//                </div>
//                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
//            </div>
//        </div>
//    `;
    
//    document.body.insertAdjacentHTML('beforeend', notificationHtml);
    
//    // הסר אחרי 5 שניות
//    setTimeout(() => {
//        const alertElement = document.querySelector('.alert:last-of-type');
//        if (alertElement) {
//            alertElement.remove();
//        }
//    }, 5000);
//}

//// הצגת סטטוס
//function showNotificationStatus(message, type = 'info') {
//    const statusHtml = `
//        <div class="alert alert-${type} alert-dismissible fade show position-fixed" 
//             style="top: 80px; right: 20px; z-index: 9999; max-width: 300px;" role="alert">
//            ${message}
//            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
//        </div>
//    `;
    
//    document.body.insertAdjacentHTML('beforeend', statusHtml);
    
//    setTimeout(() => {
//        const alertElement = document.querySelector('.alert:last-of-type');
//        if (alertElement) {
//            alertElement.remove();
//        }
//    }, 4000);
//}

//// הפונקציות גלובליות
//window.recoverNotificationSystem = recoverNotificationSystem;
//window.showNotificationButtonImmediate = showNotificationButtonImmediate;
//window.sendTestNotification = sendTestNotification;
//window.notificationSystemReady = () => notificationSystemReady;

//// התחל שחזור מיד
//document.addEventListener('DOMContentLoaded', function() {
//    console.log('📄 DOM ready, starting notification recovery...');
//    setTimeout(recoverNotificationSystem, 100);
//});

//// גם אם DOM כבר מוכן
//if (document.readyState !== 'loading') {
//    setTimeout(recoverNotificationSystem, 100);
//}

//console.log('🔄 Notification recovery system loaded!');

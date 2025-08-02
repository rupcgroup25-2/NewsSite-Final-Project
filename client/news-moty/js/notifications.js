// ניהול push notifications עם Firebase

// פונקציה לבדיקת מצב התראות מפורט
function debugNotificationStatus() {
    console.log('🔍 === NOTIFICATION DEBUG STATUS ===');
    console.log('📱 Notification permission:', Notification.permission);
    console.log('🔧 Notification style:', localStorage.getItem('notificationStyle') || 'auto');
    console.log('👁️ Page visible:', !document.hidden && document.visibilityState === 'visible');
    console.log('🔥 Firebase initialized:', typeof messaging !== 'undefined' && !!messaging);
    console.log('⚙️ Service Worker registered:', navigator.serviceWorker?.controller ? 'Yes' : 'No');
    console.log('🔑 Current FCM Token:', currentFCMToken ? 'Available (' + currentFCMToken.length + ' chars)' : 'None');
    console.log('✅ Notifications initialized:', notificationsInitialized);
    console.log('👤 Current user:', typeof currentUser !== 'undefined' && currentUser ? currentUser.email : 'Not logged in');
    console.log('🔗 Subscribed user ID:', subscribedUserId || 'None');
    
    // בדוק אם יש FCM token רק אם messaging מוכן
    if (typeof messaging !== 'undefined' && messaging && messaging.getToken) {
        console.log('🔄 Checking FCM token from Firebase...');
        import('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js')
            .then(messagingModule => {
                return messagingModule.getToken(messaging, { vapidKey: 'BLQJzYUECwCieCgz4kPIpKs8wF5fNB8k6PZu8W7Q4V9tN7vNhA5TKnUzBvBXFJ3YxrJKDQ2vWnP4M5k3uT1Qr8M' });
            })
            .then((currentToken) => {
                if (currentToken) {
                    console.log('🔑 FCM Token from Firebase (length):', currentToken.length);
                    console.log('🔑 Token match:', currentToken === currentFCMToken ? 'Yes' : 'No');
                } else {
                    console.log('❌ No FCM token available from Firebase');
                }
            })
            .catch((err) => {
                console.log('❌ Error getting FCM token from Firebase:', err.message);
            });
    } else {
        console.log('⚠️ Firebase messaging not ready for token check');
    }
    
    console.log('==============================');
}

// הוסף את הפונקציה לglobal scope לשימוש בconsole
window.debugNotificationStatus = debugNotificationStatus;

// פונקציית debug מהירה
window.quickNotificationCheck = function() {
    console.log('⚡ QUICK NOTIFICATION CHECK');
    console.log('Permission:', Notification.permission);
    console.log('Style:', localStorage.getItem('notificationStyle') || 'auto');
    console.log('FCM Token:', currentFCMToken ? 'Yes' : 'No');
    console.log('User:', currentUser ? currentUser.email : 'None');
    console.log('Initialized:', notificationsInitialized);
    
    // בדוק Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            console.log('Service Workers found:', registrations.length);
            if (registrations.length === 0) {
                console.log('⚠️ No Service Worker registered! Attempting to register...');
                registerServiceWorker();
            }
        });
    }
    
    // טסט התראה לפי ההגדרה הנוכחית (לא תמיד system)
    const notificationStyle = localStorage.getItem('notificationStyle') || 'auto';
    const isPageVisible = !document.hidden && document.visibilityState === 'visible';
    
    let useSystemNotification = false;
    switch(notificationStyle) {
        case 'system':
            useSystemNotification = true;
            break;
        case 'inpage':
            useSystemNotification = false;
            break;
        case 'auto':
        default:
            useSystemNotification = !isPageVisible;
            break;
    }
    
    console.log('🔔 Will use system notification:', useSystemNotification);
    
    if (useSystemNotification) {
        if (Notification.permission === 'granted') {
            const testNotif = new Notification('Quick Test - System', {
                body: 'System notifications are working!',
                icon: '/favicon.ico',
                tag: 'quick-test'
            });
            setTimeout(() => testNotif.close(), 3000);
            console.log('✅ Test system notification sent');
        } else {
            console.log('❌ No notification permission for system notification');
        }
    } else {
        // הצג התראת in-page
        showCustomNotification('Quick Test - In-Page', 'In-page notifications are working!');
        console.log('✅ Test in-page notification sent');
    }
};

// הוסף הוראות debug לconsole
console.log(`
🔧 === NOTIFICATION DEBUG COMMANDS ===
Use these commands in the browser console:

1. quickNotificationCheck() - Quick status check + test
2. debugNotificationStatus() - Detailed status report  
3. localStorage.setItem('notificationStyle', 'system') - Force system notifications
4. localStorage.setItem('notificationStyle', 'inpage') - Force in-page notifications
5. localStorage.setItem('notificationStyle', 'auto') - Auto mode (default)
6. registerServiceWorker() - Manually register Service Worker
7. switchNotificationStyle('system'|'inpage'|'auto') - Quick style switch

Test buttons in profile page:
- Click notification bell button to toggle notifications
- Click test notification button to send test message

Current status: ${notificationsInitialized ? 'Ready' : 'Loading...'}
=====================================
`);

// פונקציה לרישום Service Worker ידני
window.registerServiceWorker = async function() {
    if ('serviceWorker' in navigator) {
        try {
            console.log('🔄 Manually registering Service Worker...');
            
            // נסה נתיבים שונים
            const possiblePaths = [
                './firebase-messaging-sw.js',
                '/firebase-messaging-sw.js',
                '../firebase-messaging-sw.js',
                '/client/news-moty/firebase-messaging-sw.js'
            ];
            
            let registration = null;
            let lastError = null;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`🔄 Trying path: ${path}`);
                    registration = await navigator.serviceWorker.register(path);
                    console.log('✅ Service Worker registered successfully with path:', path, registration.scope);
                    break;
                } catch (error) {
                    console.log(`❌ Failed with path ${path}:`, error.message);
                    lastError = error;
                }
            }
            
            if (!registration) {
                throw lastError || new Error('All Service Worker paths failed');
            }
            
            // חכה שיהיה active
            if (registration.installing) {
                console.log('⏳ Service Worker installing...');
                registration.installing.addEventListener('statechange', function() {
                    if (this.state === 'activated') {
                        console.log('✅ Service Worker activated!');
                        location.reload(); // רענן דף כדי שהSW יעבוד
                    }
                });
            } else if (registration.active) {
                console.log('✅ Service Worker already active');
            }
            
            return registration;
        } catch (error) {
            console.error('❌ Error registering Service Worker:', error);
            console.log('💡 Make sure firebase-messaging-sw.js exists in the root directory');
            console.log('🔍 Available Service Worker files found:');
            console.log('- ./firebase-messaging-sw.js');
            console.log('- /firebase-messaging-sw.js');
            console.log('- ../firebase-messaging-sw.js');
        }
    } else {
        console.log('❌ Service Workers not supported in this browser');
    }
};

// פונקציה להחלפת סגנון התראות בקלות
window.switchNotificationStyle = function(style) {
    const validStyles = ['system', 'inpage', 'auto'];
    if (!validStyles.includes(style)) {
        console.log('❌ Invalid style. Use: system, inpage, or auto');
        return;
    }
    
    localStorage.setItem('notificationStyle', style);
    console.log(`✅ Notification style changed to: ${style}`);
    
    // בצע בדיקה מיידית
    setTimeout(() => {
        console.log('🔄 Testing new style...');
        quickNotificationCheck();
    }, 500);
};

// פונקציה לסימולציה של דף לא פעיל (לבדיקת auto mode)
window.simulatePageHidden = function() {
    console.log('🙈 Simulating page hidden for auto mode test...');
    
    // שמור מצב מקורי
    const originalVisibilityState = document.visibilityState;
    const originalHidden = document.hidden;
    
    // דמה דף מוסתר
    Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true
    });
    Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true
    });
    
    console.log('📋 Page now appears hidden. Testing notification...');
    showCustomNotification('Auto Mode Test', 'This should show as system notification because page appears hidden');
    
    // החזר מצב מקורי אחרי 3 שניות
    setTimeout(() => {
        Object.defineProperty(document, 'visibilityState', {
            value: originalVisibilityState,
            writable: true
        });
        Object.defineProperty(document, 'hidden', {
            value: originalHidden,
            writable: true
        });
        console.log('👁️ Page visibility restored to normal');
    }, 3000);
};

// בדיקת התאמת VAPID Key לפרויקט
async function validateVAPIDKeyAndProject() {
    try {
        console.log('🔍 Validating VAPID key compatibility...');
        
        // בדוק שהפרויקט והמפתחות תואמים
        const projectInfo = {
            projectId: firebaseConfig.projectId,
            messagingSenderId: firebaseConfig.messagingSenderId,
            apiKey: firebaseConfig.apiKey,
            vapidKey: typeof vapidKey !== 'undefined' ? vapidKey : 'undefined'
        };
        
        console.log('📋 Project Configuration:');
        console.log('- Project ID:', projectInfo.projectId);
        console.log('- Messaging Sender ID:', projectInfo.messagingSenderId);
        console.log('- API Key:', projectInfo.apiKey.substring(0, 20) + '...');
        console.log('- VAPID Key:', projectInfo.vapidKey !== 'undefined' ? projectInfo.vapidKey.substring(0, 20) + '...' : 'Not defined');
        
        // בדוק אם Service Worker מוגדר נכון
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log('🔧 Service Worker registrations found:', registrations.length);
            
            registrations.forEach((registration, index) => {
                console.log(`📱 SW ${index + 1}: ${registration.scope}`);
                console.log(`📱 SW ${index + 1} active:`, registration.active ? 'Yes' : 'No');
            });
        }
        
        return true;
    } catch (error) {
        console.error('❌ VAPID validation error:', error);
        return false;
    }
}

// פונקציה לטיפול בבעיות VAPID Key
async function fixVAPIDKeyIssues() {
    try {
        console.log('🔧 Attempting to fix VAPID key issues...');
        
        // 1. נסה לאפס Service Worker
        if ('serviceWorker' in navigator) {
            console.log('🔄 Unregistering all service workers...');
            const registrations = await navigator.serviceWorker.getRegistrations();
            
            for (const registration of registrations) {
                await registration.unregister();
                console.log('✅ Service worker unregistered:', registration.scope);
            }
            
            // חכה רגע ואז רשום מחדש
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('🔄 Re-registering service worker...');
            const newRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('✅ Service worker re-registered:', newRegistration.scope);
        }
        
        // 2. נקה את הטוקן הנוכחי
        currentFCMToken = null;
        console.log('🗑️ Cleared current FCM token');
        
        // 3. נסה ליצור טוקן חדש
        console.log('🔄 Will retry token generation...');
        
        return true;
    } catch (error) {
        console.error('❌ Error fixing VAPID issues:', error);
        return false;
    }
}

// Firebase messaging functions - need to be imported globally
if (typeof messaging === 'undefined') {
    var messaging;
}
if (typeof currentFCMToken === 'undefined') {
    var currentFCMToken = null;
}
if (typeof notificationsInitialized === 'undefined') {
    var notificationsInitialized = false; // דגל למניעת אתחול כפול
}
if (typeof subscribedUserId === 'undefined') {
    var subscribedUserId = null; // דגל לזכירת מי מנוי כבר להתראות
}

// אתחול FCM - תיקרא מ-articlePage.js אחרי שFirebase מאותחל
async function initializeNotifications() {
    console.log('🔔 Starting notification initialization...');
    
    // מנע אתחול כפול
    if (notificationsInitialized) {
        console.log('⚠️ Notifications already initialized, skipping...');
        return true;
    }
    
    // בדוק הגדרות VAPID
    await validateVAPIDKeyAndProject();
    
    // בדוק אם הדפדפן תומך בהתראות
    if (!('Notification' in window)) {
        console.error('❌ This browser does not support notifications');
        showNotificationStatus('This browser does not support notifications', 'danger');
        return false;
    }

    // בדוק אם הדפדפן תומך ב-Service Workers
    if (!('serviceWorker' in navigator)) {
        console.error('❌ This browser does not support service workers');
        showNotificationStatus('Your browser does not support push notifications', 'danger');
        return false;
    }

    // רענן service worker אם יש בעיה
    try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
            console.log('🔄 Checking existing service worker...');
            for (const registration of registrations) {
                if (registration.scope.includes('firebase-messaging-sw')) {
                    console.log('🔄 Updating Firebase service worker...');
                    await registration.update();
                }
            }
        }
    } catch (error) {
        console.log('⚠️ Could not update service worker:', error);
    }

    // אתחל Firebase אם עדיין לא מאותחל
    if (!window.app) {
        console.log('🔥 Firebase app not found, initializing...');
        await initializeFirebaseApp();
    }

    // טען את Firebase messaging
    console.log('🔄 Loading Firebase messaging module...');
    try {
        const messagingModule = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js');
        console.log('✅ Firebase messaging module loaded');
        messaging = messagingModule.getMessaging(window.app);
        await setupMessaging(messagingModule);
        
        // סמן שהאתחול הושלם
        notificationsInitialized = true;
        console.log('✅ Notifications initialization completed');
        
        // טען את סטטוס התראות מיד לאחר האתחול
        setTimeout(() => {
            loadNotificationStatus();
        }, 500);
    } catch (error) {
        console.error('❌ Error loading Firebase messaging:', error);
        showNotificationStatus('Error loading notification system', 'danger');
    }
}

// אתחול Firebase App
async function initializeFirebaseApp() {
    try {
        // וודא שיש firebaseConfig
        if (typeof firebaseConfig === 'undefined') {
            console.error('❌ Firebase config not found');
            showNotificationStatus('Firebase configuration missing', 'danger');
            return false;
        }

        // ייבא Firebase App
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js');
        
        // אתחל Firebase
        const app = initializeApp(firebaseConfig);
        window.app = app; // הפוך זמין גלובלית
        
        console.log('✅ Firebase app initialized successfully');
        return true;

    } catch (error) {
        console.error('❌ Error initializing Firebase app:', error);
        showNotificationStatus('Error initializing Firebase', 'danger');
        return false;
    }
}

async function setupMessaging(messagingModule) {
    console.log('⚙️ Setting up Firebase messaging...');
    
    try {
        // וודא שהמסרים מאותחל
        if (!messaging) {
            messaging = messagingModule.getMessaging(window.app);
        }
        console.log('📱 Firebase messaging initialized');
        
        // בקש הרשאה להתראות רק אם עדיין לא ניתנה
        if (Notification.permission === 'default') {
            await requestNotificationPermission(messagingModule);
        } else if (Notification.permission === 'granted') {
            console.log('✅ Notification permission already granted');
            // קבל FCM token רק אם עדיין אין
            if (!currentFCMToken) {
                await getFCMToken(messagingModule);
            }
        }
        
        // הגדר מאזין להתראות שמגיעות כשהאפליקציה פתוחה
        messagingModule.onMessage(messaging, (payload) => {
            console.log('🔔 Message received while app is open:', payload);
            console.log('📱 Current notification style:', localStorage.getItem('notificationStyle') || 'auto');
            console.log('👁️ Page visible:', !document.hidden && document.visibilityState === 'visible');
            
            // בדוק אם זה התראה עבור המשתמש הנוכחי (למנוע התראות על פעולות שלו)
            if (payload.data && payload.data.excludeUserId && currentUser && 
                payload.data.excludeUserId === currentUser.id.toString()) {
                console.log('🚫 Skipping notification - user is the action performer');
                return;
            }
            
            // הצג התראה מותאמת בתוך האתר
            if (payload.notification) {
                showCustomNotification(
                    payload.notification.title, 
                    payload.notification.body, 
                    payload.data
                );
            }
            
            // הצג badge על כפתור התראות
            showNotificationBadge();
            
            // נגן צליל (אופציונלי)
            playNotificationSound();
        });
        
        console.log('✅ Messaging setup completed');
    } catch (error) {
        console.error('❌ Error setting up messaging:', error);
        showNotificationStatus('Error setting up notifications', 'danger');
    }
}

// בקש הרשאה והשג טוקן
async function requestNotificationPermission(messagingModule) {
    try {
        console.log('🔑 Requesting notification permission...');
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            console.log('✅ Notification permission granted');
            await getFCMToken(messagingModule);
        } else if (permission === 'denied') {
            console.log('❌ Notification permission denied');
            showNotificationStatus('Notifications are blocked. To enable: Click the 🔒 lock icon in address bar → Allow notifications → Refresh page', 'warning');
        } else {
            console.log('⚠️ Notification permission dismissed');
            showNotificationStatus('Notifications not enabled. You can enable them by clicking the notification button.', 'info');
        }
    } catch (error) {
        console.error('❌ Error requesting notification permission:', error);
        showNotificationStatus('Error requesting notification permission', 'danger');
    }
}

// קבל FCM token
async function getFCMToken(messagingModule) {
    try {
        console.log('🔐 Getting FCM token...');
        
        // אם כבר יש טוקן, החזר אותו
        if (currentFCMToken) {
            console.log('📧 Using existing FCM token:', currentFCMToken);
            return currentFCMToken;
        }
        
        // וודא שהמסרים מאותחל
        if (!messaging) {
            messaging = messagingModule.getMessaging(window.app);
        }
        
        let token;
        
        // Try to get FCM token with VAPID key if available
        if (typeof vapidKey !== 'undefined') {
            try {
                console.log('🔐 Trying to get token with VAPID key...');
                token = await messagingModule.getToken(messaging, {
                    vapidKey: vapidKey
                });
                console.log('📧 FCM Token received with VAPID key:', token);
            } catch (vapidError) {
                console.log('⚠️ Failed with VAPID key, trying without:', vapidError.message);
                try {
                    token = await messagingModule.getToken(messaging);
                    console.log('📧 FCM Token received without VAPID key:', token);
                } catch (finalError) {
                    console.error('❌ All token generation methods failed:', finalError);
                    throw finalError;
                }
            }
        } else {
            // אם אין VAPID key, נסה בלעדיו
            try {
                token = await messagingModule.getToken(messaging);
                console.log('📧 FCM Token received without VAPID key:', token);
            } catch (error) {
                console.error('❌ Failed to get token:', error.message);
                throw error;
            }
        }

        if (token) {
            currentFCMToken = token;
            console.log('✅ FCM Token successfully obtained');

            // שמור את הטוקן בשרת רק אם זה לא נעשה כבר עבור המשתמש הנוכחי
            if (typeof currentUser !== 'undefined' && currentUser && subscribedUserId !== currentUser.id && !tokenSaveInProgress) {
                saveFCMTokenToServer(currentUser.id, token);
            }

            return token;
        } else {
            console.log('⚠️ No registration token available');
            showNotificationStatus('Unable to get notification token', 'warning');
            return null;
        }
    } catch (error) {
        console.error('❌ Error getting FCM token:', error);
        showNotificationStatus('Error setting up notifications: ' + error.message, 'danger');
        return null;
    }
}


// שמירת FCM Token בשרת - עם ה-endpoint הנכון
let tokenSaveInProgress = false; // דגל למניעת שליחות כפולות

function saveFCMTokenToServer(userId, token) {
    console.log('💾 Saving FCM token to server for user:', userId);
    
    // מנע שליחות כפולות
    if (tokenSaveInProgress) {
        console.log('⚠️ Token save already in progress, skipping...');
        return;
    }
    
    // בדוק אם serverUrl זמין
    if (typeof serverUrl === 'undefined') {
        console.error('serverUrl is not defined. Make sure initServerUrl.js is loaded.');
        showNotificationStatus('Server configuration error', 'danger');
        return;
    }
    
    // בדוק אם ajaxCall זמין
    if (typeof ajaxCall === 'undefined') {
        console.error('ajaxCall is not defined. Make sure ajaxCalls.js is loaded.');
        showNotificationStatus('Ajax configuration error', 'danger');
        return;
    }

    tokenSaveInProgress = true;
    
    // אם הקונטרולר שלך מקבל פרמטרים בשורת הכתובת
    ajaxCall(
        "POST",
        serverUrl + `Notifications/SaveFCMToken?userId=${userId}&fcmToken=${encodeURIComponent(token)}`,
        null, // או "" אם זה מה שאתה משתמש
        function (response) {
            console.log('✅ FCM token saved to server successfully');
            // הראה התראה רק אם זה השמירה הראשונה
            if (subscribedUserId !== userId) {
                showNotificationStatus('Notifications enabled successfully!', 'success');
            }
            subscribedUserId = userId; // סמן שהמשתמש מנוי - הזז את זה לתוך הפונקציה המוצלחת
            tokenSaveInProgress = false;
        },
        function (xhr) {
            console.error('❌ Error saving FCM token to server:', xhr.responseText);
            showNotificationStatus('Error saving notification settings', 'warning');
            tokenSaveInProgress = false;
        }
    );
}



// הצג התראה באפליקציה
function showInAppNotification(payload) {
    const notification = payload.notification;
    const data = payload.data;

    // הצג badge על כפתור ההתראות
    showNotificationBadge();
    
    // נסה להשמיע צליל התראה
    playNotificationSound();

    // יצירת התראה visual באפליקציה עם כפתורי אישור/דחייה
    const notificationHtml = `
        <div class="alert alert-info alert-dismissible fade show notification-popup animate__animated animate__slideInRight" role="alert" 
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
                    ` : ''}
                </div>
                <button type="button" class="btn-close ms-2" onclick="$(this).closest('.notification-popup').remove()"></button>
            </div>
        </div>
    `;

    $('body').append(notificationHtml);

    // הסר אחרי 8 שניות אם לא נסגר ידנית
    setTimeout(() => {
        $('.notification-popup').fadeOut(500, function() {
            $(this).remove();
        });
    }, 8000);
}

// הצגת סטטוס notifications למשתמש
function showNotificationStatus(message, type = 'info') {
    // ביטול הצגת כל ההתראות כדי לא להפריע למשתמש
    console.log(`Notification Status (${type}):`, message);
    return;
    
    // אל תציג התראות success אם הן עלולות להפריע ל-system notifications
    if (type === 'success' && localStorage.getItem('notificationStyle') === 'system') {
        console.log('✅ Notification Success (hidden for system notifications):', message);
        return;
    }
    
    const statusHtml = `
        <div class="alert alert-${type} alert-dismissible fade show position-fixed" 
             style="top: 80px; right: 20px; z-index: 9999; max-width: 300px;" role="alert">
            <i class="bi bi-info-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    $('body').append(statusHtml);
    
    // זמן ארוך יותר לקריאה
    setTimeout(() => {
        $('.alert').fadeOut();
    }, 5000);
}

// פונקציה לוידוא שהטוקן תקין
async function validateAndRefreshTokenIfNeeded(userId) {
    console.log('🔍 Validating FCM token for user:', userId);
    
    if (!currentFCMToken) {
        console.log('⚠️ No FCM token to validate');
        return false;
    }
    
    try {
        // בדוק את סטטוס ההתראות בשרת
        const isEnabled = await checkNotificationStatus(userId);
        console.log('📊 Server notification status:', isEnabled);
        
        if (!isEnabled) {
            console.log('⚠️ Notifications disabled on server, token might be invalid');
            showNotificationStatus('Refreshing notification settings...', 'info');
            
            // נסה לרענן הטוקן אוטומטית
            const refreshed = await refreshFCMToken(userId);
            if (refreshed) {
                console.log('✅ Token refreshed successfully');
                showNotificationStatus('Notification settings updated!', 'success');
                return true;
            } else {
                console.log('❌ Failed to refresh token');
                showNotificationStatus('Could not update notification settings', 'warning');
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error validating token:', error);
        return false;
    }
}

// פונקציה להרשמה להתראות כשמשתמש מתחבר
function subscribeUserToNotifications(userId) {
    console.log('🔗 Subscribing user to notifications:', userId);
    
    // בדוק אם המשתמש כבר מנוי
    if (subscribedUserId === userId) {
        console.log('⚠️ User already subscribed to notifications, validating token...');
        
        // אבל עדיין וודא שהטוקן תקין
        validateAndRefreshTokenIfNeeded(userId).then(isValid => {
            if (!isValid) {
                console.log('⚠️ Token validation failed, will try to get new one');
                subscribedUserId = null; // אפס כדי לכפות קבלת טוקן חדש
                subscribeUserToNotifications(userId); // נסה שוב
            }
        });
        
        showNotificationButton();
        return;
    }
    
    console.log(`🔍 Current state: subscribedUserId=${subscribedUserId}, userId=${userId}, currentFCMToken=${currentFCMToken ? 'exists' : 'null'}, tokenSaveInProgress=${tokenSaveInProgress}`);
    
    // בדוק אם כבר יש טוקן זמין
    if (currentFCMToken) {
        console.log('📧 Using existing FCM token for user:', userId);
        // רק אם עדיין לא מנוי עבור המשתמש הזה
        if (subscribedUserId !== userId) {
            saveFCMTokenToServer(userId, currentFCMToken);
            subscribedUserId = userId; // סמן שהמשתמש מנוי
        }
    } else {
        // נסה לקבל טוקן רק אם Firebase מוכן ועדיין לא קיבלנו טוקן
        if (messaging && !currentFCMToken) {
            console.log('🔄 No token available, trying to get new one...');
            import('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js')
                .then(messagingModule => {
                    getFCMToken(messagingModule).then(() => {
                        if (currentFCMToken && subscribedUserId !== userId) {
                            saveFCMTokenToServer(userId, currentFCMToken);
                            subscribedUserId = userId; // סמן שהמשתמש מנוי
                        }
                    });
                })
                .catch(error => console.error('Error loading messaging module:', error));
        } else {
            console.log('⚠️ Firebase messaging not ready or token already being processed');
        }
    }
    
    // הצג כפתור התראות
    showNotificationButton();
}

// טעינת סטטוס התראות מיד כשהדף נטען
function loadNotificationStatus() {
    console.log('🔍 Loading notification status on page load...');
    
    const notificationBtn = document.getElementById('notifications-btn');
    if (!notificationBtn) {
        console.log('⚠️ Notification button not found, retrying in 1 second...');
        setTimeout(loadNotificationStatus, 1000);
        return;
    }
    
    // קרא מ-localStorage כברירת מחדל
    const savedStatus = localStorage.getItem('notificationStatus') || 'disabled';
    const lastUpdate = localStorage.getItem('lastNotificationUpdate');
    
    console.log(`📊 Saved status: ${savedStatus}, Last update: ${lastUpdate}`);
    
    // הצג הודעה מיידית על הסטטוס הנוכחי
    if (savedStatus === 'enabled') {
        showNotificationStatus('🔔 Notifications are ENABLED', 'success');
    } else {
        showNotificationStatus('🔕 Notifications are DISABLED', 'warning');
    }
    
    if (currentUser && currentUser.id) {
        // אם יש משתמש מחובר, בדוק בשרת רק אם עבר זמן מהעדכון האחרון
        const shouldCheckServer = !lastUpdate || (Date.now() - parseInt(lastUpdate)) > 30000; // 30 שניות
        
        if (shouldCheckServer) {
            console.log('🌐 Checking server for latest status...');
            checkNotificationStatus(currentUser.id).then(isEnabled => {
                console.log(`📊 Server status for user ${currentUser.id}: ${isEnabled}`);
                updateNotificationIcon(isEnabled);
                localStorage.setItem('notificationStatus', isEnabled ? 'enabled' : 'disabled');
                localStorage.setItem('lastNotificationUpdate', Date.now().toString());
                
                // עדכן הודעה אם השתנה
                if ((isEnabled ? 'enabled' : 'disabled') !== savedStatus) {
                    if (isEnabled) {
                        showNotificationStatus('🔔 Notifications are ENABLED (updated from server)', 'success');
                    } else {
                        showNotificationStatus('🔕 Notifications are DISABLED (updated from server)', 'warning');
                    }
                }
            }).catch(error => {
                console.error('Error checking server status:', error);
                // אם יש שגיאה בשרת, השתמש ב-localStorage
                updateNotificationIcon(savedStatus === 'enabled');
            });
        } else {
            console.log('📱 Using cached status (updated recently)');
            updateNotificationIcon(savedStatus === 'enabled');
        }
    } else {
        // אם אין משתמש מחובר, השתמש ב-localStorage
        updateNotificationIcon(savedStatus === 'enabled');
        console.log(`📊 No user logged in, using localStorage: ${savedStatus}`);
    }
}

// פונקציה חדשה לאתחול סטטוס התראות בכל עמוד
function initializeNotificationStatusGlobally() {
    console.log('🌐 Initializing notification status globally...');
    
    // בדוק אם יש כפתור התראות בעמוד הנוכחי
    const notificationBtn = document.getElementById('notifications-btn');
    
    if (notificationBtn) {
        console.log('📍 Notification button found - loading full status');
        loadNotificationStatus();
    } else {
        console.log('📍 No notification button on this page - checking cached status');
        
        // גם בעמודים ללא כפתור, נבדוק את הסטטוס השמור
        const savedStatus = localStorage.getItem('notificationStatus');
        const savedTimestamp = localStorage.getItem('lastNotificationUpdate');
        
        if (savedStatus) {
            console.log(`📱 Found cached notification status: ${savedStatus} (updated: ${new Date(parseInt(savedTimestamp || 0)).toLocaleString()})`);
            
            // אם הסטטוס ישן מדי (יותר מיום), נסמן לבדיקה בעמוד הבא
            const isOld = !savedTimestamp || (Date.now() - parseInt(savedTimestamp)) > 24 * 60 * 60 * 1000;
            if (isOld) {
                console.log('⏰ Cached status is old, will refresh on next page with notification button');
                localStorage.removeItem('lastNotificationUpdate'); // כך נבדק בשרת בעמוד הבא
            }
        } else {
            console.log('📭 No cached notification status found');
        }
    }
}

// הצגת כפתור התראות
function showNotificationButton() {
    const notificationBtn = document.getElementById('notifications-btn');
    if (notificationBtn) {
        // הצג כפתור גם אם אין משתמש (לבדיקה)
        notificationBtn.style.display = 'inline-block';
        
        // טען סטטוס התראות
        loadNotificationStatus();
        
        // הוסף event listener לכפתור רק אם אין כבר
        if (!notificationBtn.onclick) {
            notificationBtn.onclick = async function() {
                // הסתר badge כשלוחצים על הכפתור
                hideNotificationBadge();
                
                // בדוק אם יש משתמש מחובר
                if (!currentUser || !currentUser.id) {
                    showNotificationStatus('Please login first to manage notifications', 'warning');
                    return;
                }
                
                try {
                    // בדוק מצב התראות נוכחי מהשרת
                    console.log('🔍 Checking notification status from server...');
                    const serverStatus = await checkNotificationStatus(currentUser.id);
                    const hasPermission = Notification.permission === 'granted';
                    const hasToken = !!currentFCMToken;
                    
                    console.log(`📊 Status check: serverStatus=${serverStatus}, hasPermission=${hasPermission}, hasToken=${hasToken}`);
                    
                    // הסטטוס האמיתי הוא שילוב של כל התנאים
                    const isEnabled = hasPermission && hasToken && serverStatus;
                    
                    console.log(`📊 Final status: isEnabled=${isEnabled}`);
                    
                    const status = isEnabled ? 'enabled' : 'disabled';
                    const action = isEnabled ? 'disable' : 'enable';
                    const message = `Notifications are currently ${status}. Would you like to ${action} them?`;
                    
                    if (confirm(message)) {
                        const userId = currentUser.id;
                        
                        if (isEnabled) {
                            console.log('⏹️ Disabling notifications...');
                            disableNotifications(userId);
                        } else {
                            console.log('▶️ Enabling notifications...');
                            enableNotifications(userId);
                        }
                    }
                } catch (error) {
                    console.error('Error checking notification status:', error);
                    showNotificationStatus('Error checking notification status', 'danger');
                }
            };
        }
    }
}

// הסתרת כפתור התראות
function hideNotificationButton() {
    const notificationBtn = document.getElementById('notifications-btn');
    if (notificationBtn) {
        notificationBtn.style.display = 'none';
    }
}

// עדכון מראה כפתור התראות בהתאם לסטטוס
function updateNotificationIcon(isEnabled) {
    const notificationBtn = document.getElementById('notifications-btn');
    if (notificationBtn) {
        const icon = notificationBtn.querySelector('i');
        if (icon) {
            // הסר קלאסים קיימים
            notificationBtn.classList.remove('notifications-enabled', 'notifications-disabled');
            
            // עדכן את האייקון בהתאם לסטטוס
            if (isEnabled) {
                icon.className = 'bi bi-bell-fill';
                notificationBtn.classList.add('notifications-enabled');
                notificationBtn.title = '🔔 Notifications ENABLED - Click to disable';
                console.log('🔔 Notification icon updated: ENABLED');
            } else {
                icon.className = 'bi bi-bell-slash';
                notificationBtn.classList.add('notifications-disabled');
                notificationBtn.title = '🔕 Notifications DISABLED - Click to enable';
                console.log('🔕 Notification icon updated: DISABLED');
            }
            
            // שמור גם בכותרת העמוד
            document.title = document.title.replace(/ - (Enabled|Disabled)$/, '') + ` - ${isEnabled ? 'Enabled' : 'Disabled'}`;
        }
    }
}

// הצגת badge על כפתור התראות
function showNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.style.display = 'inline-block';
    }
}

// הסתרת badge על כפתור התראות
function hideNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.style.display = 'none';
    }
}

// השמעת צליל התראה
function playNotificationSound() {
    try {
        // צור audio context לצליל קצר
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // הגדרת צליל פעמון קצר
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Could not play notification sound:', error);
    }
}

// פונקציה לבדיקת debug של המערכת
function debugNotificationSystem() {
    console.log('🔍 NOTIFICATION SYSTEM DEBUG');
    console.log('============================');
    
    // בדוק תמיכת דפדפן
    console.log('Browser Support:');
    console.log('- Notifications API:', 'Notification' in window);
    console.log('- Service Worker:', 'serviceWorker' in navigator);
    console.log('- Push Manager:', 'PushManager' in window);
    console.log('- Permission:', Notification ? Notification.permission : 'not available');
    
    // בדוק Firebase
    console.log('\nFirebase Status:');
    console.log('- Firebase App:', typeof window.app !== 'undefined' && window.app);
    console.log('- Messaging Object:', typeof messaging !== 'undefined' && messaging);
    console.log('- FCM Token:', currentFCMToken ? 'Available' : 'Not available');
    
    // בדוק dependencies
    console.log('\nDependencies:');
    console.log('- Server URL:', typeof serverUrl !== 'undefined' ? serverUrl : 'not defined');
    console.log('- Ajax Function:', typeof ajaxCall !== 'undefined');
    console.log('- Current User:', typeof currentUser !== 'undefined' && currentUser ? currentUser.email : 'not logged in');
    
    // בדוק UI elements
    console.log('\nUI Elements:');
    const notificationBtn = document.getElementById('notifications-btn');
    const notificationBadge = document.getElementById('notification-badge');
    console.log('- Notification Button:', notificationBtn ? 'Found' : 'Not found');
    console.log('- Notification Badge:', notificationBadge ? 'Found' : 'Not found');
    
    // בדוק service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            console.log('\nService Workers:');
            console.log('- Registrations count:', registrations.length);
            registrations.forEach((registration, index) => {
                console.log(`- SW ${index + 1}:`, registration.scope);
            });
        });
    }
    
    return {
        browserSupport: 'Notification' in window && 'serviceWorker' in navigator,
        firebaseReady: typeof window.app !== 'undefined' && window.app,
        hasToken: !!currentFCMToken,
        hasUser: typeof currentUser !== 'undefined' && currentUser,
        uiReady: !!document.getElementById('notifications-btn')
    };
}

// פונקציה לביטול הרשמה כשמשתמש מתנתק
function manuallyUnsubscribeFromNotifications(userId) {
    if (currentFCMToken && confirm('Are you sure you want to stop receiving notifications?')) {
        ajaxCall(
            "PUT",
            serverUrl + `Notifications/DisableFCMToken?userId=${userId}`,
            null,
            function (response) {
                console.log('Notifications disabled successfully');
                alert('You will no longer receive notifications. You can re-enable them in settings.');
            },
            function (xhr) {
                console.error('Error disabling notifications:', xhr.responseText);
            }
        );
    }
}

// ביטול התראות
function disableNotifications(userId) {
    console.log('🔇 Disabling notifications for user:', userId);
    
    ajaxCall(
        "PUT",
        serverUrl + `Notifications/DisableFCMToken?userId=${userId}`,
        null,
        function(response) {
            console.log('✅ Notifications disabled successfully:', response);
            
            // הודעה ברורה למשתמש
            alert('🔕 Notifications DISABLED\nYou will no longer receive notifications.');
            showNotificationStatus('🔕 Notifications disabled successfully', 'info');
            
            // עדכן מצב מקומי
            subscribedUserId = null;
            
            // עדכן אייקון
            updateNotificationIcon(false);
            
            // שמור סטטוס ב-localStorage
            localStorage.setItem('notificationStatus', 'disabled');
            localStorage.setItem('lastNotificationUpdate', Date.now().toString());
        },
        function(xhr) {
            console.error('❌ Error disabling notifications:', xhr.responseText);
            showNotificationStatus('❌ Error disabling notifications', 'danger');
        }
    );
}

// הפעלת התראות
function enableNotifications(userId) {
    console.log('🔔 Enabling notifications for user:', userId);
    
    ajaxCall(
        "PUT",
        serverUrl + `Notifications/EnableFCMToken?userId=${userId}`,
        null,
        function(response) {
            console.log('✅ Notifications enabled successfully:', response);
            
            // הודעה ברורה למשתמש
            alert('🔔 Notifications ENABLED\nYou will now receive notifications about new articles and updates.');
            showNotificationStatus('🔔 Notifications enabled successfully!', 'success');
            
            // עדכן מצב מקומי
            subscribedUserId = userId;
            
            // עדכן אייקון
            updateNotificationIcon(true);
            
            // שמור סטטוס ב-localStorage
            localStorage.setItem('notificationStatus', 'enabled');
            localStorage.setItem('lastNotificationUpdate', Date.now().toString());
        },
        function(xhr) {
            console.error('❌ Error enabling notifications:', xhr.responseText);
            showNotificationStatus('❌ Error enabling notifications', 'danger');
        }
    );
}

// בדיקת סטטוס התראות
function checkNotificationStatus(userId) {
    console.log('🔍 Checking notification status for user:', userId);
    
    return new Promise((resolve, reject) => {
        ajaxCall(
            "GET",
            serverUrl + `Notifications/NotificationStatus?userId=${userId}`,
            null,
            function(response) {
                console.log('✅ Notification status received:', response);
                console.log('📊 Response type:', typeof response);
                console.log('📊 Response notificationsEnabled:', response.notificationsEnabled);
                
                // וודא שהתשובה נכונה
                const isEnabled = response && response.notificationsEnabled === true;
                console.log('📊 Parsed isEnabled:', isEnabled);
                resolve(isEnabled);
            },
            function(xhr) {
                console.error('❌ Error checking notification status:', xhr);
                reject(xhr);
            }
        );
    });
}

// ריענון טוקן FCM (במקרה של טוקן לא תקין)
async function refreshFCMToken(userId) {
    console.log('🔄 Refreshing FCM token for user:', userId);
    
    try {
        if (!messaging) {
            console.log('❌ Firebase messaging not initialized');
            return false;
        }
        
        // נקה טוקן ישן
        currentFCMToken = null;
        
        // קבל טוקן חדש
        const messagingModule = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js');
        await getFCMToken(messagingModule);
        
        if (currentFCMToken) {
            // שמור טוקן חדש לשרת
            saveFCMTokenToServer(userId, currentFCMToken);
            console.log('✅ FCM token refreshed successfully');
            showNotificationStatus('Notification token refreshed successfully!', 'success');
            return true;
        } else {
            console.log('❌ Failed to get new FCM token');
            return false;
        }
    } catch (error) {
        console.error('❌ Error refreshing FCM token:', error);
        showNotificationStatus('Error refreshing notification token', 'danger');
        return false;
    }
}

// שליחת התראת בדיקה
function sendTestNotification(userId) {
    console.log('🧪 Sending test notification to user:', userId);
    
    if (!userId) {
        const currentUserId = currentUser ? currentUser.id : null;
        if (!currentUserId) {
            showNotificationStatus('Please login first to test notifications', 'warning');
            return;
        }
        userId = currentUserId;
    }
    
    // בדוק אם יש טוקן תקין לפני שליחת הבדיקה
    if (!currentFCMToken) {
        console.log('⚠️ No FCM token available, trying to get one...');
        showNotificationStatus('Getting notification token, please wait...', 'info');
        
        // נסה לקבל טוקן חדש
        if (messaging) {
            import('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js')
                .then(messagingModule => getFCMToken(messagingModule))
                .then(() => {
                    if (currentFCMToken) {
                        console.log('✅ Got new FCM token, retrying test notification...');
                        sendTestNotification(userId); // קריאה רקורסיבית
                    } else {
                        showNotificationStatus('Could not get notification token. Please refresh the page.', 'warning');
                    }
                })
                .catch(error => {
                    console.error('❌ Error getting FCM token:', error);
                    showNotificationStatus('Error getting notification token. Please refresh the page.', 'danger');
                });
        } else {
            showNotificationStatus('Notifications not initialized. Please refresh the page.', 'warning');
        }
        return;
    }
    
    // קודם שמור את הטוקן החדש לשרת
    console.log('💾 Ensuring current FCM token is saved to server before testing...');
    showNotificationStatus('Saving current token to server...', 'info');
    
    ajaxCall(
        "POST",
        serverUrl + `Notifications/SaveFCMToken?userId=${userId}&fcmToken=${encodeURIComponent(currentFCMToken)}`,
        null,
        function (saveResponse) {
            console.log('✅ FCM token saved successfully:', saveResponse);
            
            // בדוק אם השמירה באמת הצליחה
            if (saveResponse && saveResponse.notificationsEnabled !== undefined) {
                console.log('📊 Server confirms notifications enabled:', saveResponse.notificationsEnabled);
            }
            
            // המתן זמן ארוך יותר לפני שליחת הבדיקה כדי לוודא שה-DB עודכן
            console.log('⏳ Waiting for database to update...');
            setTimeout(() => {
                console.log('🚀 Now sending test notification...');
                
                // עכשיו שלח את הבדיקה
                ajaxCall(
                    "POST",
                    serverUrl + `Notifications/TestNotification?userId=${userId}`,
                    null,
                    function (response) {
                        console.log('✅ Test notification sent successfully:', response);
                        showNotificationStatus('Test notification sent! Check your device.', 'success');
                        
                        // הצג גם התראה מקומית לבדיקה
                        setTimeout(() => {
                            showCustomNotification(
                                "Test Notification", 
                                "This is a test notification to verify your settings!",
                                { url: window.location.href }
                            );
                        }, 1000);
                    },
                    function (xhr) {
                        console.error('❌ Error sending test notification:', xhr.status, xhr.responseText);
                        
                        // בדוק אם השגיאה קשורה לטוקן לא תקין
                        const isTokenError = xhr.status === 500 && 
                            (xhr.responseText.includes('no tokens') || 
                             xhr.responseText.includes('invalid') ||
                             xhr.responseText.includes('UNAUTHENTICATED') ||
                             xhr.responseText.includes('refresh page') ||
                             xhr.responseText.includes('THIRD_PARTY_AUTH_ERROR'));
                        
                        if (isTokenError) {
                            console.log('🔄 Token issue detected, trying alternative approach...');
                            showNotificationStatus('Database not updated yet. Trying direct test...', 'info');
                            
                            // אם עדיין לא עובד, נסה direct token
                            setTimeout(() => {
                                console.log('🎯 Falling back to direct token test...');
                                testDirectToken("Test via Direct", "This test bypasses the database");
                            }, 1000);
                        } else {
                            showNotificationStatus(`Error sending test notification: ${xhr.status} - ${xhr.responseText}`, 'danger');
                        }
                    }
                );
            }, 1500); // המתן 1.5 שניות לפני שליחת הבדיקה
        },
        function (xhr) {
            console.error('❌ Error saving FCM token before test:', xhr.responseText);
            showNotificationStatus('Error saving token before test', 'warning');
            
            // גם אם השמירה נכשלה, נסה לשלוח בדיקה בכל זאת
            console.log('⚠️ Proceeding with test despite save error...');
            ajaxCall(
                "POST",
                serverUrl + `Notifications/TestNotification?userId=${userId}`,
                null,
                function (response) {
                    console.log('✅ Test notification sent successfully (despite save error):', response);
                    showNotificationStatus('Test notification sent! Check your device.', 'success');
                },
                function (xhr) {
                    console.error('❌ Error sending test notification after save failure:', xhr.status, xhr.responseText);
                    showNotificationStatus(`Test failed: ${xhr.status} - ${xhr.responseText}`, 'danger');
                }
            );
        }
    );
}

// בדיקת סטטוס Firebase APIs
async function checkFirebaseStatus() {
    console.log('🔍 Checking Firebase API status...');
    
    try {
        const response = await ajaxCall('GET', `${serverUrl}/api/Notifications/firebase-status`, '', 'json');
        
        if (response.status === 'fcm-api-enabled') {
            console.log('✅ Firebase APIs are enabled and working');
            showNotificationStatus('Firebase APIs are working properly', 'success');
            return true;
        } else {
            console.log('❌ Firebase FCM API is not enabled');
            showNotificationStatus('Firebase FCM API needs to be enabled. Check console for instructions.', 'warning');
            
            if (response.instructions) {
                console.log('🔧 Instructions to fix Firebase API issues:');
                console.log('1.', response.instructions.step1);
                console.log('2.', response.instructions.step2);
                console.log('3.', response.instructions.step3);
                console.log('4.', response.instructions.step4);
                console.log('5.', response.instructions.step5);
            }
            return false;
        }
    } catch (error) {
        console.error('❌ Error checking Firebase status:', error);
        showNotificationStatus('Error checking Firebase status', 'danger');
        return false;
    }
}

// הצגת התראה מותאמת אישית כשהאפליקציה פתוחה
function showCustomNotification(title, body, data) {
    console.log('📢 Custom notification called:', title, body);
    
    // קבל הגדרת סוג התראה מהמשתמש
    const notificationStyle = localStorage.getItem('notificationStyle') || 'auto';
    console.log('🔧 Notification style:', notificationStyle);
    
    // החלט איזה סוג התראה להציג
    const isPageVisible = !document.hidden && document.visibilityState === 'visible';
    let useSystemNotification = false;
    
    switch(notificationStyle) {
        case 'system':
            useSystemNotification = true;
            break;
        case 'inpage':
            useSystemNotification = false;
            break;
        case 'auto':
        default:
            useSystemNotification = !isPageVisible;
            break;
    }
    
    console.log('🔔 Use system notification:', useSystemNotification);
    
    // הצג התראת מערכת אם נדרש
    if (useSystemNotification) {
        if (Notification.permission === 'granted') {
            console.log('✅ Creating system notification');
            const notification = new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                tag: 'news-notification',
                requireInteraction: true,
                silent: false
            });
            
            // טיפול בלחיצה על התראת מערכת
            notification.onclick = function() {
                console.log('🖱️ System notification clicked');
                window.focus();
                if (data && data.url) {
                    window.location.href = data.url;
                }
                notification.close();
            };
            
            // סגור התראה אחרי 10 שניות
            setTimeout(() => {
                notification.close();
            }, 10000);
        } else {
            console.warn('⚠️ Notification permission not granted');
        }
        return;
    }
    
    // בדיקה שיש jQuery
    if (typeof $ === 'undefined') {
        // fallback לדפדפן
        if (Notification.permission === 'granted') {
            new Notification(title, { body: body, icon: '/public/newsSite.png' });
        } else {
            // fallback vanilla JS
            showVanillaNotification(title, body, data);
        }
        return;
    }
    
    // יצירת התראה ויזואלית באתר עם אפשרויות אינטראקציה
    const notificationHtml = `
        <div class="custom-notification alert alert-info alert-dismissible fade show position-fixed" 
             style="top: 20px; right: 20px; z-index: 9999; max-width: 350px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
                    border: 2px solid #17a2b8; background: #e3f2fd;" role="alert">
            <div class="d-flex align-items-start">
                <span style="font-size: 20px; margin-right: 10px;">🔔</span>
                <div class="flex-grow-1">
                    <strong style="color: #0d47a1;">${title}</strong><br>
                    <small style="color: #424242;">${body}</small>
                    ${data && data.url ? `
                    <div class="mt-3">
                        <button class="btn btn-sm btn-primary me-2 notification-action" data-action="view" data-url="${data.url}">
                            👁️ View
                        </button>
                        <button class="btn btn-sm btn-outline-secondary notification-action" data-action="dismiss">
                            ❌ Dismiss
                        </button>
                    </div>
                    ` : `
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-secondary notification-action" data-action="dismiss">
                            ✅ OK
                        </button>
                    </div>
                    `}
                </div>
                <button type="button" class="btn-close notification-action" data-action="close" 
                        style="background: none; border: none; font-size: 16px; cursor: pointer;">✖️</button>
            </div>
        </div>
    `;

    // הוסף התראה לחלק העליון של הדף
    $('body').append(notificationHtml);

    // הוסף event listeners לכפתורים
    $('.notification-action').off('click').on('click', function() {
        const action = $(this).data('action');
        const url = $(this).data('url');
        const notification = $(this).closest('.custom-notification');
        
        switch(action) {
            case 'view':
                if (url) {
                    window.open(url, '_blank');
                }
                notification.fadeOut(300, function() { $(this).remove(); });
                break;
            case 'dismiss':
            case 'close':
                notification.fadeOut(300, function() { $(this).remove(); });
                break;
        }
    });

    // הסר אחרי 10 שניות אם לא הוסר ידנית
    setTimeout(() => {
        $('.custom-notification').fadeOut(500, function() {
            $(this).remove();
        });
    }, 10000);
}

// פונקציית fallback בלי jQuery
function showVanillaNotification(title, body, data) {
    // יצור element
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 350px;
        background: #e3f2fd;
        border: 2px solid #17a2b8;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: Arial, sans-serif;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: start;">
            <span style="font-size: 20px; margin-right: 10px;">🔔</span>
            <div style="flex-grow: 1;">
                <strong style="color: #0d47a1; display: block; margin-bottom: 5px;">${title}</strong>
                <div style="color: #424242; font-size: 14px;">${body}</div>
                <div style="margin-top: 10px;">
                    ${data && data.url ? 
                        `<button onclick="window.open('${data.url}', '_blank'); this.closest('.custom-notification').remove();" 
                                style="background: #007bff; color: white; border: none; padding: 5px 10px; margin-right: 5px; border-radius: 4px; cursor: pointer;">
                            👁️ View
                        </button>` : ''
                    }
                    <button onclick="this.closest('.custom-notification').remove();" 
                            style="background: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                        ✅ OK
                    </button>
                </div>
            </div>
            <button onclick="this.closest('.custom-notification').remove();" 
                    style="background: none; border: none; font-size: 16px; cursor: pointer; margin-left: 10px;">
                ❌
            </button>
        </div>
    `;
    
    // הוסף לעמוד
    document.body.appendChild(notification);
    
    // אנימציה
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // הסר אחרי 10 שניות
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 10000);
    
    console.log('✅ Vanilla notification displayed');
}

// $(document).ready ייקרא רק אם Firebase מוכן
function initNotificationsWhenReady() {
    console.log('🔍 Checking if notifications can be initialized...');
    
    // בדוק אם כבר אותחל
    if (notificationsInitialized) {
        console.log('⚠️ Notifications already initialized, skipping initNotificationsWhenReady...');
        return;
    }
    
    // בדוק אם כל הדרישות זמינות
    if (typeof serverUrl === 'undefined') {
        console.log('⏳ Waiting for serverUrl to be defined...');
        setTimeout(initNotificationsWhenReady, 500);
        return;
    }
    
    if (typeof ajaxCall === 'undefined') {
        console.log('⏳ Waiting for ajaxCall to be defined...');
        setTimeout(initNotificationsWhenReady, 500);
        return;
    }

    // בדוק אם firebaseConfig זמין
    if (typeof firebaseConfig === 'undefined') {
        console.log('⏳ Waiting for firebaseConfig to be defined...');
        setTimeout(initNotificationsWhenReady, 500);
        return;
    }

    console.log('🚀 All dependencies ready, initializing notifications...');
    initializeNotifications();
    
    // בדוק אם יש משתמש נוכחי
    if (typeof currentUser !== 'undefined' && currentUser) {
        console.log('👤 Current user found, subscribing to notifications...');
        subscribeUserToNotifications(currentUser.id);
    } else {
        console.log('👤 No current user, notifications will be enabled after login');
    }
}

$(document).ready(function () {
    console.log('📱 DOM ready, starting notification initialization process...');
    
    // בדוק אם כבר אותחל כדי למנוע אתחול כפול
    if (notificationsInitialized) {
        console.log('⚠️ Notifications already initialized, skipping DOM ready initialization...');
        
        // אבל עדיין בדוק אם יש משתמש חדש
        if (typeof currentUser !== 'undefined' && currentUser) {
            const notificationBtn = document.getElementById('notifications-btn');
            if (notificationBtn && notificationBtn.style.display === 'none') {
                console.log('👤 Showing notification button for current user...');
                showNotificationButton();
            }
        } else {
            // הצג כפתור גם בלי משתמש (לבדיקה)
            showNotificationButton();
        }
        return;
    }
    
    // המתן קצת לפני שמתחילים לבדוק כדי לתת זמן לסקריפטים להיטען
    setTimeout(initNotificationsWhenReady, 100);
});

// פונקציה לתיקון בעיות נפוצות
function fixCommonNotificationIssues() {
    console.log('🔧 Attempting to fix common notification issues...');
    
    const issues = [];
    const fixes = [];
    
    // בדוק והתחל service worker אם חסר
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            if (registrations.length === 0) {
                issues.push('No service worker registered');
                fixes.push('Attempting to register service worker...');
                
                navigator.serviceWorker.register('/firebase-messaging-sw.js')
                    .then(registration => {
                        console.log('✅ Service worker registered successfully');
                        showNotificationStatus('Service worker registered successfully', 'success');
                    })
                    .catch(error => {
                        console.error('❌ Service worker registration failed:', error);
                        showNotificationStatus('Service worker registration failed', 'danger');
                    });
            }
        });
    }
    
    // בדוק permissions
    if (Notification && Notification.permission === 'default') {
        issues.push('Notification permission not requested');
        fixes.push('Requesting notification permission...');
        requestNotificationPermission();
    }
    
    // בדוק Firebase app
    if (typeof window.app === 'undefined' || !window.app) {
        issues.push('Firebase app not initialized');
        fixes.push('Waiting for Firebase initialization...');
        setTimeout(() => {
            if (typeof window.app !== 'undefined' && window.app) {
                console.log('✅ Firebase app now available');
                initializeNotifications();
            }
        }, 2000);
    }
    
    // בדוק FCM token
    if (!currentFCMToken && messaging) {
        issues.push('No FCM token available');
        fixes.push('Attempting to get FCM token...');
        import('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js')
            .then(messagingModule => getFCMToken(messagingModule));
    }
    
    console.log('Issues found:', issues);
    console.log('Fixes applied:', fixes);
    
    if (issues.length === 0) {
        showNotificationStatus('No issues found! Notifications should work properly.', 'success');
    } else {
        showNotificationStatus(`Found ${issues.length} issues. Attempting fixes...`, 'warning');
    }
    
    return { issues, fixes };
}

// פונקציה לביטול הרשמה כשמשתמש מתנתק
function unsubscribeUserFromNotifications() {
    console.log('🚪 Unsubscribing user from notifications...');
    
    // הסתר כפתור התראות
    hideNotificationButton();
    
    // נקה את המשתמש המנוי
    subscribedUserId = null;
    
    // אל תנקה את currentFCMToken כי הוא עדיין רלוונטי למכשיר
    
    console.log('✅ User unsubscribed from notifications');
}

// פונקציה להחלפת משתמש
function switchUserNotifications(newUserId) {
    console.log('🔄 Switching user notifications to:', newUserId);
    
    // בטל הרשמה של המשתמש הקודם
    unsubscribeUserFromNotifications();
    
    // הרשם למשתמש החדש
    setTimeout(() => {
        if (newUserId && notificationsInitialized) {
            subscribeUserToNotifications(newUserId);
        }
    }, 100); // זמן קצר יותר
}

// פונקציית בדיקה פשוטה להצגת מצב הטוקן
window.checkTokenStatus = async function() {
    if (!currentUser) {
        console.log('❌ No user logged in');
        showNotificationStatus('Please log in to check token status', 'warning');
        return false;
    }
    
    console.log('� Checking FCM token status...');
    console.log('User ID:', currentUser.id);
    console.log('Current FCM Token:', currentFCMToken ? `${currentFCMToken.substring(0, 20)}...` : 'None');
    console.log('Notifications Initialized:', notificationsInitialized);
    
    if (currentFCMToken) {
        console.log('✅ Token exists and will be sent to server');
        showNotificationStatus('FCM Token is ready', 'success');
        return true;
    } else {
        console.log('❌ No FCM token available');
        showNotificationStatus('No FCM token available - try refreshing page', 'warning');
        return false;
    }
};

// פונקציה פשוטה לשליחת בדיקה לשרת
window.sendTestNotification = sendTestNotification;

// פונקציה ראשית להפעלת התראות בכל דף
window.initNotificationsOnPageLoad = function() {
    console.log('🌐 Initializing notifications for current page...');
    
    // המתן לטעינת Firebase config
    if (typeof firebaseConfig === 'undefined') {
        console.log('⏳ Waiting for Firebase config...');
        setTimeout(window.initNotificationsOnPageLoad, 200);
        return;
    }
    
    // המתן לטעינת serverUrl
    if (typeof serverUrl === 'undefined') {
        console.log('⏳ Waiting for serverUrl...');
        setTimeout(window.initNotificationsOnPageLoad, 200);
        return;
    }
    
    // המתן לטעינת ajaxCall
    if (typeof ajaxCall === 'undefined') {
        console.log('⏳ Waiting for ajaxCall...');
        setTimeout(window.initNotificationsOnPageLoad, 200);
        return;
    }
    
    console.log('✅ All dependencies loaded, starting notifications...');
    
    // הראה כפתור פעמון תמיד
    showNotificationButton();
    
    // אתחל התראות אם עדיין לא אותחל
    if (!notificationsInitialized) {
        console.log('🔔 Starting notification initialization...');
        initializeNotifications();
    }
    
    // אם יש משתמש מחובר, הרשם להתראות
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.id) {
        console.log('👤 User found, subscribing to notifications...');
        subscribeUserToNotifications(currentUser.id);
    }
};

// הרץ כשהדף נטען
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Page loaded, starting notification setup...');
    setTimeout(window.initNotificationsOnPageLoad, 100);
});

// הרץ גם כשמשתמש נכנס (מ-auth.js)
window.onUserLogin = function(user) {
    console.log('👤 User logged in, setting up notifications for:', user.email);
    if (user && user.id) {
        switchUserNotifications(user.id);
    }
};

// הרץ כשמשתמש יוצא
window.onUserLogout = function() {
    console.log('👤 User logged out, cleaning up notifications...');
    unsubscribeUserFromNotifications();
};

// פונקציה פשוטה לבדיקת FCM token
window.debugNotifications = debugNotificationSystem;

// פונקציה מתקדמת לבדיקת מצב התראות
window.advancedNotificationTest = async function() {
    if (!currentUser) {
        console.log('❌ No user logged in');
        showNotificationStatus('Please log in first', 'warning');
        return false;
    }
    
    console.log('🔬 Running advanced notification test...');
    console.log('==========================================');
    
    const userId = currentUser.id;
    console.log('👤 User ID:', userId);
    console.log('📧 Current FCM Token:', currentFCMToken ? `${currentFCMToken.substring(0, 30)}...` : 'None');
    
    try {
        // שלב 1: שמור טוקן
        console.log('\n📤 Step 1: Saving current token to server...');
        if (!currentFCMToken) {
            console.log('❌ No token to save');
            return false;
        }
        
        const saveResult = await new Promise((resolve, reject) => {
            ajaxCall(
                "POST",
                serverUrl + `Notifications/SaveFCMToken?userId=${userId}&fcmToken=${encodeURIComponent(currentFCMToken)}`,
                null,
                resolve,
                reject
            );
        });
        
        console.log('✅ Save result:', saveResult);
        
        // שלב 2: בדוק סטטוס התראות בשרת
        console.log('\n📊 Step 2: Checking notification status on server...');
        const statusResult = await checkNotificationStatus(userId);
        console.log('📊 Server status:', statusResult);
        
        // שלב 3: המתן ונסה שליחת בדיקה
        console.log('\n⏳ Step 3: Waiting 2 seconds for DB sync...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🧪 Step 4: Sending test notification...');
        const testResult = await new Promise((resolve, reject) => {
            ajaxCall(
                "POST",
                serverUrl + `Notifications/TestNotification?userId=${userId}`,
                null,
                (response) => resolve({ success: true, response }),
                (xhr) => resolve({ success: false, error: xhr.responseText, status: xhr.status })
            );
        });
        
        if (testResult.success) {
            console.log('✅ Test notification sent successfully!');
            showNotificationStatus('Advanced test completed successfully!', 'success');
        } else {
            console.log('❌ Test notification failed:', testResult.error);
            
            // שלב 5: אם נכשל, נסה direct test
            console.log('\n🎯 Step 5: Trying direct token test as fallback...');
            testDirectToken("Fallback Test", "Direct test after DB test failed");
        }
        
        console.log('==========================================');
        return testResult.success;
        
    } catch (error) {
        console.error('❌ Advanced test error:', error);
        showNotificationStatus('Advanced test failed: ' + error, 'danger');
        return false;
    }
};

// פונקציה נוספת לבדיקה מהירה של הטוקן
window.quickTokenCheck = function() {
    console.log('=== Quick Token Check ===');
    console.log('Current User:', currentUser ? `${currentUser.email} (ID: ${currentUser.id})` : 'Not logged in');
    console.log('FCM Token:', currentFCMToken ? `${currentFCMToken.substring(0, 30)}...` : 'None');
    console.log('Notifications Initialized:', notificationsInitialized);
    console.log('Firebase App:', window.app ? 'Available' : 'Not available');
    console.log('Messaging Object:', messaging ? 'Available' : 'Not available');
    
    if (currentUser && currentFCMToken) {
        console.log('✅ Ready to send notifications');
        
        // אפשרות לבדוק ישירות את הטוקן
        console.log('\n🎯 You can test the token directly by running:');
        console.log('testDirectToken()');
        console.log('\n📤 Or send token to server by running:');
        console.log('sendTokenToServer()');
        
        return true;
    } else {
        console.log('❌ Not ready for notifications');
        
        if (!currentUser) {
            console.log('💡 Please log in first');
        }
        if (!currentFCMToken) {
            console.log('💡 No FCM token - try refreshing page or check browser permissions');
        }
        
        return false;
    }
};

// פונקציה לשליחת הטוקן לשרת ידנית
window.sendTokenToServer = function() {
    if (!currentUser) {
        console.log('❌ No user logged in');
        showNotificationStatus('Please log in first', 'warning');
        return;
    }
    
    if (!currentFCMToken) {
        console.log('❌ No FCM token available');
        showNotificationStatus('No FCM token available', 'warning');
        return;
    }
    
    console.log('📤 Sending FCM token to server...');
    console.log('User ID:', currentUser.id);
    console.log('Token:', `${currentFCMToken}`);
    
    saveFCMTokenToServer(currentUser.id, currentFCMToken);
};

// פונקציה לבדיקת טוקן ישירה (בלי בדיקה ב-DB)
window.testDirectToken = function(title = "Direct Token Test", body = "This is a direct token test notification!") {
    if (!currentFCMToken) {
        console.log('❌ No FCM token available');
        showNotificationStatus('No FCM token available - please refresh page', 'warning');
        return;
    }
    
    console.log('🎯 Testing direct token...');
    console.log('Token:', `${currentFCMToken.substring(0, 30)}...`);
    console.log('Title:', title);
    console.log('Body:', body);
    
    // שלח בקשה ל-endpoint החדש
    ajaxCall(
        "POST",
        serverUrl + `Notifications/TestDirectToken?fcmToken=${encodeURIComponent(currentFCMToken)}&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`,
        null,
        function(response) {
            console.log('✅ Direct token test successful:', response);
            showNotificationStatus('Direct token test sent successfully! Check your device.', 'success');
            
            // הצג גם התראה מקומית לבדיקה
            setTimeout(() => {
                showCustomNotification(
                    title, 
                    body,
                    { url: window.location.href }
                );
            }, 1000);
        },
        function(xhr) {
            console.error('❌ Direct token test failed:', xhr.status, xhr.responseText);
            showNotificationStatus(`Direct token test failed: ${xhr.status} - ${xhr.responseText}`, 'danger');
        }
    );
}

// טען סטטוס התראות כשהדף נטען
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Page loaded, initializing notification status...');
    setTimeout(() => {
        initializeNotificationStatusGlobally();
    }, 1500); // 1.5 שניות אחרי שהדף נטען
});

// טען גם כש-window נטען לגמרי
window.addEventListener('load', function() {
    console.log('🔄 Window fully loaded, checking notification status...');
    setTimeout(() => {
        initializeNotificationStatusGlobally();
    }, 500);
});;
// ניהול push notifications עם Firebase

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
let messaging;
let currentFCMToken = null;
let notificationsInitialized = false; // דגל למניעת אתחול כפול
let subscribedUserId = null; // דגל לזכירת מי מנוי כבר להתראות

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
        
        // נסה קודם עם VAPID key אם זמין
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
            subscribedUserId = userId; // סמן שהמשתמש מנוי
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
    const statusHtml = `
        <div class="alert alert-${type} alert-dismissible fade show position-fixed" 
             style="top: 80px; right: 20px; z-index: 9999; max-width: 300px;" role="alert">
            <i class="bi bi-info-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    $('body').append(statusHtml);
    
    setTimeout(() => {
        $('.alert').fadeOut();
    }, 4000);
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

// הצגת כפתור התראות
function showNotificationButton() {
    const notificationBtn = document.getElementById('notifications-btn');
    if (notificationBtn) {
        // הצג כפתור גם אם אין משתמש (לבדיקה)
        notificationBtn.style.display = 'inline-block';
        
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
            showNotificationStatus('Notifications disabled successfully', 'info');
            
            // עדכן מצב מקומי
            subscribedUserId = null;
        },
        function(xhr) {
            console.error('❌ Error disabling notifications:', xhr.responseText);
            showNotificationStatus('Error disabling notifications', 'danger');
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
            showNotificationStatus('Notifications enabled successfully!', 'success');
            
            // עדכן מצב מקומי
            subscribedUserId = userId;
        },
        function(xhr) {
            console.error('❌ Error enabling notifications:', xhr.responseText);
            showNotificationStatus('Error enabling notifications', 'danger');
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
    
    ajaxCall(
        "POST",
        serverUrl + `Notifications/TestNotification?userId=${userId}`,
        null,
        function (response) {
            console.log('✅ Test notification sent successfully:', response);
            showNotificationStatus('Test notification sent! Check your device.', 'success');
        },
        function (xhr) {
            console.error('❌ Error sending test notification:', xhr.status, xhr.responseText);
            
            // בדוק אם השגיאה קשורה לטוקן לא תקין
            const isTokenError = xhr.status === 500 && 
                (xhr.responseText.includes('no tokens') || 
                 xhr.responseText.includes('invalid') ||
                 xhr.responseText.includes('UNAUTHENTICATED') ||
                 xhr.responseText.includes('THIRD_PARTY_AUTH_ERROR'));
            
            if (isTokenError) {
                console.log('🔄 Token is invalid, refreshing and retrying...');
                showNotificationStatus('Token expired, refreshing...', 'info');
                
                // רענן טוקן ונסה שוב
                refreshFCMToken(userId).then(success => {
                    if (success) {
                        console.log('✅ Token refreshed successfully, retrying notification...');
                        setTimeout(() => sendTestNotification(userId), 1000); // חכה קצת ונסה שוב
                    } else {
                        showNotificationStatus('Could not refresh token. Please refresh the page.', 'warning');
                    }
                }).catch(error => {
                    console.error('❌ Error refreshing token:', error);
                    showNotificationStatus('Error refreshing token. Please refresh the page.', 'danger');
                });
            } else {
                showNotificationStatus(`Error sending test notification: ${xhr.status} - ${xhr.responseText}`, 'danger');
            }
        }
    );
}

// הצגת התראה מותאמת אישית כשהאפליקציה פתוחה
function showCustomNotification(title, body, data) {
    // קבל הגדרת סוג התראה מהמשתמש
    const notificationStyle = localStorage.getItem('notificationStyle') || 'auto';
    
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
    
    // הצג התראת מערכת אם נדרש
    if (useSystemNotification) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: body,
                icon: '/public/newsSite.png',
                tag: 'comment-notification', // מנע התראות כפולות
                requireInteraction: true
            });
            
            // טיפול בלחיצה על התראת מערכת
            notification.onclick = function() {
                window.focus();
                if (data && data.url) {
                    window.location.href = data.url;
                }
                notification.close();
            };
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

// פונקציות debug וכלי עזר גלובליים
window.debugNotifications = debugNotificationSystem;
window.fixNotifications = fixCommonNotificationIssues;
window.unsubscribeNotifications = unsubscribeUserFromNotifications;
window.switchUserNotifications = switchUserNotifications;
window.sendTestNotification = sendTestNotification;
window.refreshFCMToken = refreshFCMToken;
window.validateToken = validateAndRefreshTokenIfNeeded;

// פונקציה מהירה לתיקון בעיות טוקן
window.fixTokenIssues = async function() {
    if (!currentUser) {
        console.log('❌ Please log in first');
        showNotificationStatus('Please log in first', 'warning');
        return;
    }
    
    console.log('🔧 Fixing token issues...');
    showNotificationStatus('Fixing notification issues...', 'info');
    
    try {
        // נקה טוקן ישן
        currentFCMToken = null;
        subscribedUserId = null;
        
        // אתחל מחדש
        if (messaging) {
            const messagingModule = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js');
            await getFCMToken(messagingModule);
            
            if (currentFCMToken) {
                saveFCMTokenToServer(currentUser.id, currentFCMToken);
                showNotificationStatus('Notification issues fixed! Try sending a test notification.', 'success');
                return true;
            }
        }
        
        showNotificationStatus('Could not fix issues. Please refresh the page.', 'danger');
        return false;
    } catch (error) {
        console.error('❌ Error fixing token issues:', error);
        showNotificationStatus('Error fixing issues. Please refresh the page.', 'danger');
        return false;
    }
};

// פונקציית debug מורחבת
window.debugNotificationsStatus = async function() {
    console.log('🔍 DETAILED NOTIFICATION DEBUG');
    console.log('================================');
    
    // מידע בסיסי
    console.log('Current User:', currentUser ? `${currentUser.email} (ID: ${currentUser.id})` : 'Not logged in');
    console.log('Subscribed User ID:', subscribedUserId);
    console.log('Current FCM Token:', currentFCMToken ? `${currentFCMToken.substring(0, 20)}...` : 'None');
    console.log('Token Save In Progress:', tokenSaveInProgress);
    console.log('Notifications Initialized:', notificationsInitialized);
    
    // בדיקת דפדפן
    console.log('\nBrowser Status:');
    console.log('- Notification Permission:', Notification.permission);
    console.log('- Firebase App:', window.app ? 'Initialized' : 'Not initialized');
    console.log('- Messaging Object:', messaging ? 'Ready' : 'Not ready');
    
    // בדיקת שרת (אם יש משתמש)
    if (currentUser && currentUser.id) {
        try {
            console.log('\nServer Status:');
            const serverStatus = await checkNotificationStatus(currentUser.id);
            console.log('- Server Notifications Enabled:', serverStatus);
            
            // סטטוס כולל
            const hasPermission = Notification.permission === 'granted';
            const hasToken = !!currentFCMToken;
            const isFullyEnabled = hasPermission && hasToken && serverStatus;
            
            console.log('\nOverall Status:');
            console.log('- Browser Permission:', hasPermission);
            console.log('- Has FCM Token:', hasToken);
            console.log('- Server Enabled:', serverStatus);
            console.log('- FULLY ENABLED:', isFullyEnabled);
            
        } catch (error) {
            console.error('Error checking server status:', error);
        }
    }
    
    // המלצות
    console.log('\nRecommendations:');
    if (!currentUser) {
        console.log('⚠️ Please log in first');
    } else if (Notification.permission !== 'granted') {
        console.log('⚠️ Browser notification permission not granted');
    } else if (!currentFCMToken) {
        console.log('⚠️ No FCM token available - try refreshing');
    } else {
        console.log('✅ Everything looks good!');
    }
};

// פונקציה לבדיקת התקשורת עם השרת
window.testServerConnection = async function() {
    console.log('🌐 Testing server connection...');
    
    if (!currentUser) {
        console.log('❌ No user logged in');
        return;
    }
    
    // בדיקת תגובת השרת עם debugging מפורט
    try {
        console.log(`📡 Making request to: ${serverUrl}Notifications/NotificationStatus?userId=${currentUser.id}`);
        
        const response = await fetch(`${serverUrl}Notifications/NotificationStatus?userId=${currentUser.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Server response:', data);
        } else {
            const errorText = await response.text();
            console.log('❌ Server error:', response.status, errorText);
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
    }
};

// פונקציה לבדיקת התראת בדיקה עם debugging מפורט
window.testNotificationWithDebug = async function() {
    console.log('🧪 Testing notification with full debugging...');
    
    if (!currentUser) {
        console.log('❌ No user logged in');
        return;
    }
    
    try {
        console.log(`📡 Making test notification request to: ${serverUrl}Notifications/TestNotification?userId=${currentUser.id}`);
        
        const response = await fetch(`${serverUrl}Notifications/TestNotification?userId=${currentUser.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Test notification response status:', response.status);
        console.log('📊 Test notification response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.text();
            console.log('✅ Test notification response:', data);
        } else {
            const errorText = await response.text();
            console.log('❌ Test notification error:', response.status, errorText);
        }
    } catch (error) {
        console.log('❌ Test notification network error:', error.message);
    }
};

// פונקציה לבדיקת VAPID מפורטת
window.debugVAPIDKey = async function() {
    console.log('🔐 VAPID Key Debugging');
    console.log('=====================');
    
    // בדיקת הגדרות בסיסיות
    console.log('Configuration:');
    console.log('- VAPID Key defined:', typeof vapidKey !== 'undefined');
    console.log('- VAPID Key value:', typeof vapidKey !== 'undefined' ? vapidKey : 'undefined');
    console.log('- Firebase Config:', firebaseConfig);
    
    // בדיקת Service Worker
    if ('serviceWorker' in navigator) {
        console.log('\nService Worker Status:');
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('- Registrations found:', registrations.length);
        
        registrations.forEach((registration, index) => {
            console.log(`  SW ${index + 1}:`);
            console.log(`    - Scope: ${registration.scope}`);
            console.log(`    - Active: ${registration.active ? 'Yes' : 'No'}`);
            console.log(`    - Installing: ${registration.installing ? 'Yes' : 'No'}`);
            console.log(`    - Waiting: ${registration.waiting ? 'Yes' : 'No'}`);
        });
    }
    
    // נסה ליצור טוקן עם פרטים מלאים
    if (messaging) {
        console.log('\nToken Generation Test:');
        
        try {
            // נסה בלי VAPID
            console.log('1. Trying without VAPID key...');
            const { getToken } = await import('https://www.gstatic.com/firebasejs/9.19.1/firebase-messaging.js');
            
            try {
                const tokenWithoutVAPID = await getToken(messaging);
                console.log('✅ Token without VAPID:', tokenWithoutVAPID ? tokenWithoutVAPID.substring(0, 30) + '...' : 'Failed');
            } catch (error) {
                console.log('❌ Failed without VAPID:', error.message);
            }
            
            // נסה עם VAPID
            if (typeof vapidKey !== 'undefined') {
                console.log('2. Trying with VAPID key...');
                try {
                    const tokenWithVAPID = await getToken(messaging, { vapidKey: vapidKey });
                    console.log('✅ Token with VAPID:', tokenWithVAPID ? tokenWithVAPID.substring(0, 30) + '...' : 'Failed');
                } catch (error) {
                    console.log('❌ Failed with VAPID:', error.message);
                    console.log('💡 This suggests VAPID key mismatch with project');
                }
            }
            
        } catch (importError) {
            console.log('❌ Error importing Firebase:', importError);
        }
    } else {
        console.log('❌ Messaging not initialized');
    }
};

// פונקציה לפתרון בעיות VAPID
window.fixVAPIDIssues = async function() {
    console.log('🔧 Attempting to fix VAPID issues...');
    
    const success = await fixVAPIDKeyIssues();
    
    if (success) {
        console.log('✅ VAPID fix completed. Please try initializing notifications again.');
        showNotificationStatus('VAPID issues fixed. Refreshing notifications...', 'success');
        
        // נסה לאתחל מחדש אחרי רגע
        setTimeout(async () => {
            notificationsInitialized = false;
            await initializeNotifications();
        }, 2000);
    } else {
        console.log('❌ VAPID fix failed');
        showNotificationStatus('Failed to fix VAPID issues. Try refreshing the page.', 'danger');
    }
};

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
    
    // אתחל Firebase אם עדיין לא אותחל
    if (!window.app && typeof firebaseConfig !== 'undefined') {
        console.log('🔥 Initializing Firebase...');
        try {
            // הנחה שFirebase נטען כבר
            if (typeof firebase !== 'undefined' && firebase.initializeApp) {
                window.app = firebase.initializeApp(firebaseConfig);
                console.log('✅ Firebase initialized successfully');
            }
        } catch (error) {
            console.log('⚠️ Firebase initialization error:', error);
        }
    }
    
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
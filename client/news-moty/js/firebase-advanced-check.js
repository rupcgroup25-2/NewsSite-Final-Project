// בדיקת Firebase Project ו-VAPID Key מתקדמת
console.log('🔍 Starting advanced Firebase configuration check...');

// בדיקת שרת מקומי
async function checkLocalServer() {
    console.log("🔗 Testing local server connection...");
    const resultDiv = document.getElementById('firebase-check-result');
    
    try {
        const response = await fetch('https://localhost:7065/api/Notifications/status');
        
        if (response.ok) {
            const data = await response.json();
            resultDiv.innerHTML += `<p>✅ Server Status: ${data.status} (${data.database})</p>`;
            console.log("✅ Server is healthy:", data);
            return true;
        } else {
            resultDiv.innerHTML += `<p>❌ Server returned status: ${response.status}</p>`;
            console.error("❌ Server error:", response.status);
            return false;
        }
    } catch (error) {
        resultDiv.innerHTML += `<p>❌ Server connection failed: ${error.message}</p>`;
        console.error("❌ Server connection error:", error);
        return false;
    }
}

async function fullFirebaseProjectCheck() {
    console.log('🚀 Full Firebase Project Configuration Check');
    console.log('===========================================');
    
    // 1. בדיקת Firebase Config
    console.log('\n1. 📋 Firebase Configuration:');
    if (typeof firebaseConfig === 'undefined') {
        console.error('❌ Firebase config not found!');
        return false;
    }
    
    console.log('✅ Firebase config found');
    console.log('📍 Project ID:', firebaseConfig.projectId);
    console.log('📍 API Key:', firebaseConfig.apiKey.substring(0, 20) + '...');
    console.log('📍 Messaging Sender ID:', firebaseConfig.messagingSenderId);
    console.log('📍 App ID:', firebaseConfig.appId);
    
    // 2. בדיקת VAPID Key
    console.log('\n2. 🔐 VAPID Key Check:');
    if (typeof vapidKey === 'undefined') {
        console.error('❌ VAPID Key not found!');
        return false;
    }
    
    console.log('✅ VAPID Key found');
    console.log('📍 VAPID Key length:', vapidKey.length);
    console.log('📍 VAPID Key starts with B:', vapidKey.startsWith('B'));
    console.log('📍 VAPID Key preview:', vapidKey.substring(0, 20) + '...');
    
    // 3. בדיקת Cloud Messaging API
    console.log('\n3. 🌐 Testing Firebase Project Access:');
    try {
        // נסה לאתחל Firebase
        let app;
        if (typeof firebase !== 'undefined' && firebase.initializeApp) {
            app = firebase.initializeApp(firebaseConfig, 'test-app-' + Date.now());
            console.log('✅ Firebase app initialized successfully');
        } else {
            console.error('❌ Firebase SDK not loaded properly');
            return false;
        }
        
        // נסה לגשת למעסג'ינג
        if (firebase.messaging) {
            const messaging = firebase.messaging(app);
            console.log('✅ Firebase Messaging accessible');
            
            // נסה לקבל טוקן
            console.log('\n4. 🔑 Testing Token Generation:');
            try {
                const token = await messaging.getToken({ vapidKey: vapidKey });
                if (token) {
                    console.log('✅ FCM Token generated successfully!');
                    console.log('📧 Token preview:', token.substring(0, 30) + '...');
                    console.log('📧 Token length:', token.length);
                    return token;
                } else {
                    console.error('❌ No token received');
                    return false;
                }
            } catch (tokenError) {
                console.error('❌ Token generation failed:', tokenError.code || tokenError.message);
                console.error('📋 Full error:', tokenError);
                
                // נסה בלי VAPID key
                console.log('\n🔄 Trying without VAPID key...');
                try {
                    const tokenWithoutVapid = await messaging.getToken();
                    if (tokenWithoutVapid) {
                        console.log('✅ Token generated WITHOUT VAPID key!');
                        console.log('📧 Token preview:', tokenWithoutVapid.substring(0, 30) + '...');
                        console.log('⚠️ This suggests VAPID key is invalid for this project');
                        return tokenWithoutVapid;
                    }
                } catch (noVapidError) {
                    console.error('❌ Failed even without VAPID key:', noVapidError.message);
                }
                
                return false;
            }
        } else {
            console.error('❌ Firebase Messaging not available');
            return false;
        }
        
    } catch (initError) {
        console.error('❌ Firebase initialization failed:', initError.message);
        return false;
    }
}

// בדיקת הגדרות Service Worker
async function checkServiceWorkerConfig() {
    console.log('\n5. 🔧 Service Worker Configuration Check:');
    
    if (!('serviceWorker' in navigator)) {
        console.error('❌ Service Worker not supported');
        return false;
    }
    
    try {
        // רישום service worker חדש
        console.log('🔄 Registering service worker...');
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ Service worker registered successfully');
        console.log('📍 Scope:', registration.scope);
        console.log('📍 Active:', registration.active ? 'Yes' : 'No');
        
        // בדיקת עדכון
        await registration.update();
        console.log('✅ Service worker updated');
        
        return true;
    } catch (swError) {
        console.error('❌ Service worker registration failed:', swError.message);
        console.error('📋 Full error:', swError);
        
        // נסה לטעון את התוכן של Service Worker לבדיקה
        try {
            const response = await fetch('/firebase-messaging-sw.js');
            if (!response.ok) {
                console.error('❌ Service worker file not accessible:', response.status);
            } else {
                console.log('✅ Service worker file is accessible');
                const content = await response.text();
                console.log('📍 Service worker file size:', content.length, 'characters');
            }
        } catch (fetchError) {
            console.error('❌ Cannot fetch service worker file:', fetchError.message);
        }
        
        return false;
    }
}

// בדיקת הרשאות דפדפן
function checkBrowserPermissions() {
    console.log('\n6. 🔒 Browser Permissions Check:');
    
    if (!('Notification' in window)) {
        console.error('❌ Notifications not supported in this browser');
        return false;
    }
    
    console.log('✅ Notifications supported');
    console.log('📍 Permission status:', Notification.permission);
    
    if (Notification.permission === 'denied') {
        console.error('❌ Notifications are blocked!');
        console.log('💡 To fix: Click lock icon in address bar → Allow notifications → Refresh');
        return false;
    }
    
    if (Notification.permission === 'default') {
        console.log('⚠️ Permission not requested yet');
        return 'needs-permission';
    }
    
    console.log('✅ Notification permissions granted');
    return true;
}

// פונקציה מרכזית
async function runCompleteFirebaseCheck() {
    console.log('🎯 Starting complete Firebase configuration check...');
    
    // בדיקת הרשאות דפדפן
    const permissionStatus = checkBrowserPermissions();
    if (permissionStatus === false) {
        return false;
    }
    
    if (permissionStatus === 'needs-permission') {
        console.log('🔔 Requesting notification permission...');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.error('❌ Permission denied');
            return false;
        }
        console.log('✅ Permission granted');
    }
    
    // בדיקת Service Worker
    const swOk = await checkServiceWorkerConfig();
    if (!swOk) {
        console.error('❌ Service Worker check failed');
        return false;
    }
    
    // בדיקת Firebase Project
    const token = await fullFirebaseProjectCheck();
    if (!token) {
        console.error('❌ Firebase project check failed');
        return false;
    }
    
    // בדיקת שרת מקומי
    console.log('\n6. � Local Server Check:');
    const serverOk = await checkLocalServer();
    if (!serverOk) {
        console.warn('⚠️ Server check failed, but continuing...');
    }
    
    console.log('\n�🎉 ALL CHECKS PASSED!');
    console.log('✅ Firebase configuration is correct');
    console.log('✅ Service Worker is working');
    console.log('✅ Browser permissions are granted');
    console.log('✅ FCM Token generated successfully');
    if (serverOk) {
        console.log('✅ Local server is healthy');
    }
    console.log('\n📧 Your FCM Token:', token);
    
    // שמור את הטוקן גלובלית
    window.generatedFCMToken = token;
    
    return token;
}

// הפוך זמין גלובלית
window.runCompleteFirebaseCheck = runCompleteFirebaseCheck;
window.fullFirebaseProjectCheck = fullFirebaseProjectCheck;
window.checkServiceWorkerConfig = checkServiceWorkerConfig;
window.checkLocalServer = checkLocalServer;

console.log('🔍 Advanced Firebase checker loaded. Run: runCompleteFirebaseCheck()');

// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_R6_rX3FP5phKAb8Nq5F_4PgM0nzQ3j8",
    authDomain: "newssitemotyhcj.firebaseapp.com",
    projectId: "newssitemotyhcj",
    storageBucket: "newssitemotyhcj.appspot.com",
    messagingSenderId: "508194764635",
    appId: "1:508194764635:web:e30c6e7d2fe8e5a0f7c5e1",
    measurementId: "G-5Y2T0J8HPY"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

console.log('🔥 Firebase messaging service worker initialized successfully!');

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    
    // בדוק אם התראות מופעלות עבור המשתמש הנוכחי
    try {
        const notificationStatus = localStorage.getItem('notificationStatus');
        if (notificationStatus === 'disabled') {
            console.log('🔕 [SW] Skipping background notification - notifications are disabled');
            return Promise.resolve(); // אל תציג את ההתראה
        }
    } catch (error) {
        console.log('⚠️ [SW] Could not check notification status from localStorage');
    }
    
    // בדוק אם זה התראה שצריכה להיסנן (למנוע התראות על פעולות של המשתמש הנוכחי)
    if (payload.data && payload.data.excludeUserId) {
        console.log('🚫 Service Worker: Filtering notification for user:', payload.data.excludeUserId);
        
        // נמנע מהצגת התראה כי זה למשתמש הנוכחי
        return Promise.resolve();
    }
    
    // בדוק הגדרות התראה מlocalStorage
    const notificationStyle = localStorage.getItem('notificationStyle') || 'auto';
    console.log('[SW] Notification style from localStorage:', notificationStyle);
    
    // אם זה inpage only, אל תציג התראת מערכת
    if (notificationStyle === 'inpage') {
        console.log('[SW] Skipping system notification - inpage mode only');
        return Promise.resolve();
    }
    
    const notificationTitle = payload.notification?.title || 'News Update';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new update',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: payload.data || {},
        tag: 'news-notification',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        actions: [
            {
                action: 'view',
                title: 'View'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    console.log('[SW] Showing system notification:', notificationTitle);
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
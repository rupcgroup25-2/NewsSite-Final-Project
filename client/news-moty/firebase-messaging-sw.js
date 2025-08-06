// Firebase Messaging Service Worker - Updated Version
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js');

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


// Handle background messages
messaging.onBackgroundMessage((payload) => {
    
    // Check if notifications are enabled for current user
    try {
        const notificationStatus = localStorage.getItem('notificationStatus');
        if (notificationStatus === 'disabled') {
            return Promise.resolve(); // Don't show the notification
        }
    } catch (error) {
        console.log('⚠️ [SW] Could not check notification status from localStorage');
    }
    
    // Check if this is a notification that should be filtered (prevent notifications for current user's actions)
    if (payload.data && payload.data.excludeUserId) {
        
        // Prevent showing notification because it's for the current user
        return Promise.resolve();
    }
    
    // Check notification settings from localStorage
    const notificationStyle = localStorage.getItem('notificationStyle') || 'auto';
    
    if (notificationStyle === 'inpage') {
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
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
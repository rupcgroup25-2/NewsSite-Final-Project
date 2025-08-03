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
    console.log('Background message received:', payload);
    
    // בדוק אם התראות מופעלות עבור המשתמש הנוכחי
    try {
        const notificationStatus = localStorage.getItem('notificationStatus');
        if (notificationStatus === 'disabled') {
            console.log('🔕 Skipping background notification - notifications are disabled');
            return; // אל תציג את ההתראה
        }
    } catch (error) {
        console.log('⚠️ Could not check notification status from localStorage');
    }
    
    // בדוק אם צריך לסנן את ההתראה עבור המשתמש הנוכחי
    if (payload.data && payload.data.excludeUserId) {
        // נסה לקבל את פרטי המשתמש הנוכחי מ-localStorage
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const currentUser = JSON.parse(storedUser);
                if (currentUser && currentUser.id && 
                    payload.data.excludeUserId === currentUser.id.toString()) {
                    console.log('🚫 Skipping background notification - user is the action performer');
                    return; // אל תציג את ההתראה
                }
            }
        } catch (error) {
            console.log('⚠️ Could not parse user from localStorage, showing notification anyway');
        }
    }
    
    const notificationTitle = payload.notification?.title || 'News Update';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new update',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'news-notification',
        requireInteraction: false,
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
    
    self.registration.showNotification(notificationTitle, notificationOptions);
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

// Firebase Cloud Messaging Service Worker
// This file must be in the root directory for Firebase to find it

importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyBNmhr9BYmpGC0jLG9TFCoR3rCNKI8IPIM",
    authDomain: "newspapersite-ruppin.firebaseapp.com",
    projectId: "newspapersite-ruppin",
    storageBucket: "newspapersite-ruppin.firebasestorage.app",
    messagingSenderId: "397153014495",
    appId: "1:397153014495:web:c3613b494555359a86cf6a"
});

const messaging = firebase.messaging();

// Set VAPID key for the service worker
messaging.useVapidKey('BG64zK6ZvZzQypFxE1PVHsl5-4CtqORP2XPOZABI4Idxf_TuPh86zHyD94tQOtnztUxGejFnHGvGyLkCO6meAEg');

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: './public/newsSite.png',
        badge: './public/newsSite.png',
        data: payload.data
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    // Navigate to URL if provided
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    } else {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

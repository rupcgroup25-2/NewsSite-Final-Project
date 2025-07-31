// Firebase Cloud Messaging Service Worker - v12 Compatible
console.log('🔧 Loading Firebase messaging service worker...');

// Import Firebase scripts for service worker (compat version)
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNmhr9BYmpGC0jLG9TFCoR3rCNKI8IPIM",
    authDomain: "newspapersite-ruppin.firebaseapp.com",
    projectId: "newspapersite-ruppin",
    storageBucket: "newspapersite-ruppin.appspot.com",
    messagingSenderId: "397153014495",
    appId: "1:397153014495:web:c3613b494555359a86cf6a"
};

try {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase initialized in service worker');

    // Get messaging instance
    const messaging = firebase.messaging();
    console.log('📨 Firebase messaging initialized');

    // Handle background messages
    messaging.onBackgroundMessage(function(payload) {
        console.log('📥 Background message received:', payload);

        let notificationTitle = 'התראה חדשה';
        let notificationOptions = {
            body: 'יש לך הודעה חדשה',
            icon: '/public/newsSite.png',
            badge: '/public/newsSite.png',
            tag: 'news-notification',
            requireInteraction: false,
            timestamp: Date.now(),
            actions: [
                {
                    action: 'view',
                    title: 'צפה',
                    icon: '/public/newsSite.png'
                },
                {
                    action: 'close',
                    title: 'סגור'
                }
            ],
            data: {
                url: '/',
                timestamp: Date.now()
            }
        };

        // Extract notification data
        if (payload.notification) {
            notificationTitle = payload.notification.title || notificationTitle;
            notificationOptions.body = payload.notification.body || notificationOptions.body;
            if (payload.notification.icon) {
                notificationOptions.icon = payload.notification.icon;
            }
        }

        // Extract custom data
        if (payload.data) {
            notificationOptions.data = { ...notificationOptions.data, ...payload.data };
            if (payload.data.url) {
                notificationOptions.data.url = payload.data.url;
            }
        }

        console.log('📤 Showing notification:', { title: notificationTitle, options: notificationOptions });

        // Show the notification
        return self.registration.showNotification(notificationTitle, notificationOptions);
    });

    // Handle notification click
    self.addEventListener('notificationclick', function(event) {
        console.log('👆 Notification clicked:', event.notification);
        
        event.notification.close();

        const urlToOpen = event.notification.data?.url || '/';
        
        if (event.action === 'view' || !event.action) {
            // פתח את האתר
            event.waitUntil(
                clients.matchAll({ type: 'window', includeUncontrolled: true })
                    .then(function(clientList) {
                        // בדוק אם יש כבר חלון פתוח
                        for (let i = 0; i < clientList.length; i++) {
                            const client = clientList[i];
                            if (client.url.includes(self.location.origin) && 'focus' in client) {
                                console.log('📱 Focusing existing window');
                                return client.focus();
                            }
                        }
                        
                        // פתח חלון חדש
                        if (clients.openWindow) {
                            console.log('🆕 Opening new window:', urlToOpen);
                            return clients.openWindow(urlToOpen);
                        }
                    })
            );
        } else if (event.action === 'close') {
            console.log('❌ Notification dismissed');
        }
    });

    console.log('✅ Service worker setup completed successfully');

} catch (error) {
    console.error('❌ Error setting up service worker:', error);
}

// Handle service worker lifecycle
self.addEventListener('install', function(event) {
    console.log('🔧 Service worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('🚀 Service worker activated');
    event.waitUntil(self.clients.claim());
});

// Keep service worker alive
self.addEventListener('message', function(event) {
    console.log('📨 Service worker received message:', event.data);
    
    if (event.data && event.data.type === 'PING') {
        event.ports[0].postMessage({ type: 'PONG', timestamp: Date.now() });
    }
});

console.log('🎯 Firebase messaging service worker loaded successfully');

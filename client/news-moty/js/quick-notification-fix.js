// תיקון מהיר להראיית כפתור הפעמון
console.log('🔔 Starting quick notification button fix...');

// פונקציה להראיית כפתור הפעמון
function forceShowNotificationButton() {
    console.log('👁️ Force showing notification button...');
    
    const notificationBtn = document.getElementById('notifications-btn');
    if (notificationBtn) {
        notificationBtn.style.display = 'inline-block';
        console.log('✅ Notification button is now visible');
        
        // הוסף event listener פשוט
        if (!notificationBtn.onclick) {
            notificationBtn.onclick = function() {
                console.log('🔔 Notification button clicked!');
                
                if (!currentUser || !currentUser.id) {
                    alert('Please login first to manage notifications');
                    return;
                }
                
                // בדיקה פשוטה
                const userWantsNotifications = confirm('Would you like to enable push notifications?');
                if (userWantsNotifications) {
                    // נסה לבקש הרשאה
                    if ('Notification' in window) {
                        Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                                alert('Notifications enabled! (Token will be generated automatically)');
                                console.log('✅ Notification permission granted');
                                
                                // נסה לאתחל התראות אם הפונקציה קיימת
                                if (typeof initializeNotifications === 'function') {
                                    initializeNotifications();
                                }
                            } else {
                                alert('Notifications blocked. Please enable them in your browser settings.');
                            }
                        });
                    } else {
                        alert('Your browser does not support notifications');
                    }
                } else {
                    alert('Notifications will remain disabled');
                }
            };
        }
    } else {
        console.log('❌ Notification button not found in DOM');
    }
}

// פונקציה להרצה מיידית
function initQuickNotificationFix() {
    console.log('🚀 Quick notification fix starting...');
    
    // חכה שה-DOM יהיה מוכן
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceShowNotificationButton);
    } else {
        forceShowNotificationButton();
    }
    
    // גם בתזמון לבטיחות
    setTimeout(forceShowNotificationButton, 500);
    setTimeout(forceShowNotificationButton, 1000);
    setTimeout(forceShowNotificationButton, 2000);
}

// הרץ מיד
initQuickNotificationFix();

// הפוך זמין גלובלית
window.forceShowNotificationButton = forceShowNotificationButton;

console.log('🔔 Quick notification button fix loaded!');

// Firebase Cloud Messaging Service Worker for TARG STAR
console.log('🔔 Firebase Messaging Service Worker loaded');

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration (same as in firebase-config.js)
const firebaseConfig = {
    apiKey: "AIzaSyBS_h1U4LXZl-EliAkF2BaINvWkOKpvyjA",
    authDomain: "dashbord2-9c725.firebaseapp.com",
    databaseURL: "https://dashbord2-9c725-default-rtdb.firebaseio.com",
    projectId: "dashbord2-9c725",
    storageBucket: "dashbord2-9c725.appspot.com",
    messagingSenderId: "591902142722",
    appId: "1:591902142722:web:6beacfb03e8017c0bc121b",
    measurementId: "G-V7DYBNF14S"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('📨 Background message received:', payload);
    
    const { notification, data } = payload;
    
    if (!notification) {
        console.log('⚠️ No notification data in background message');
        return;
    }

    const notificationTitle = notification.title || 'TARG STAR';
    const notificationOptions = {
        body: notification.body || 'You have a new notification',
        icon: notification.icon || '/images/logo-192.png',
        badge: '/images/badge-72.png',
        tag: data?.tag || 'targ-star-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: '/images/view-icon.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/images/dismiss-icon.png'
            }
        ],
        data: {
            ...data,
            timestamp: Date.now(),
            url: data?.url || '/dashboard.html'
        }
    };

    // Show notification
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked:', event);
    
    const { action, notification } = event;
    const data = notification.data || {};
    
    event.notification.close();
    
    let urlToOpen = '/dashboard.html';
    
    // Handle different actions
    if (action === 'view') {
        // Determine URL based on notification type
        if (data.type) {
            switch (data.type) {
                case 'course_update':
                    urlToOpen = `/lesson-${data.courseId}.html`;
                    break;
                case 'order_update':
                    urlToOpen = '/orders.html';
                    break;
                case 'message':
                    urlToOpen = '/contact.html';
                    break;
                case 'dashboard':
                    urlToOpen = '/dashboard.html';
                    break;
                default:
                    urlToOpen = data.url || '/dashboard.html';
            }
        } else {
            urlToOpen = data.url || '/dashboard.html';
        }
    } else if (action === 'dismiss') {
        // Just close the notification (already done above)
        return;
    } else {
        // Default click (no action button)
        urlToOpen = data.url || '/dashboard.html';
    }
    
    // Open the URL
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window/tab open with the target URL
                for (const client of clientList) {
                    if (client.url.includes(urlToOpen.replace('/', '')) && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // If no existing window/tab, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('🔔 Notification closed:', event);
    
    // Optional: Track notification dismissal analytics
    const data = event.notification.data || {};
    
    // You could send analytics data here
    console.log('📊 Notification dismissed:', {
        tag: event.notification.tag,
        timestamp: Date.now(),
        data: data
    });
});

// Handle push events (for custom push notifications)
self.addEventListener('push', (event) => {
    console.log('📨 Push event received:', event);
    
    if (!event.data) {
        console.log('⚠️ Push event has no data');
        return;
    }
    
    try {
        const payload = event.data.json();
        console.log('📨 Push payload:', payload);
        
        const { notification, data } = payload;
        
        if (notification) {
            const notificationTitle = notification.title || 'TARG STAR';
            const notificationOptions = {
                body: notification.body || 'You have a new notification',
                icon: notification.icon || '/images/logo-192.png',
                badge: '/images/badge-72.png',
                tag: data?.tag || 'targ-star-push',
                requireInteraction: true,
                data: data || {}
            };
            
            event.waitUntil(
                self.registration.showNotification(notificationTitle, notificationOptions)
            );
        }
        
    } catch (error) {
        console.error('❌ Error parsing push data:', error);
    }
});

// Service Worker installation
self.addEventListener('install', (event) => {
    console.log('🔧 Firebase Messaging Service Worker installing...');
    self.skipWaiting();
});

// Service Worker activation
self.addEventListener('activate', (event) => {
    console.log('✅ Firebase Messaging Service Worker activated');
    event.waitUntil(self.clients.claim());
});

console.log('🔔 Firebase Messaging Service Worker setup complete');
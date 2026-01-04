// Firebase Notifications System for TARG STAR
console.log('🔔 Initializing Firebase Notifications...');

class NotificationManager {
    constructor() {
        this.messaging = null;
        this.vapidKey = 'BKxvxhk5dLxgKFKh4K9rVA7x2c8wDeVLGPTjxvxhk5dLxgKFKh4K9rVA7x2c8wDeVLGPTjxvxhk5dLxgKFKh4K9rVA7x2c8wDeVLGPTj'; // Replace with your VAPID key
        this.isSupported = false;
        this.permission = 'default';
        this.token = null;
        
        this.initializeNotifications();
    }

    async initializeNotifications() {
        try {
            // Check if notifications are supported
            if (!('Notification' in window)) {
                console.log('❌ This browser does not support notifications');
                return;
            }

            // Check if Firebase Messaging is available
            if (!firebase.messaging || typeof firebase.messaging !== 'function') {
                console.log('❌ Firebase Messaging not available');
                return;
            }

            // Initialize Firebase Messaging
            this.messaging = firebase.messaging();
            this.isSupported = true;
            
            console.log('✅ Firebase Messaging initialized');
            
            // Get current permission status
            this.permission = Notification.permission;
            console.log('🔔 Current notification permission:', this.permission);
            
            // Set up message handlers
            this.setupMessageHandlers();
            
            // Try to get existing token
            await this.getToken();
            
        } catch (error) {
            console.error('❌ Error initializing notifications:', error);
        }
    }

    setupMessageHandlers() {
        if (!this.messaging) return;

        // Handle foreground messages
        this.messaging.onMessage((payload) => {
            console.log('📨 Message received in foreground:', payload);
            this.showNotification(payload);
        });

        // Handle token refresh
        this.messaging.onTokenRefresh(() => {
            console.log('🔄 FCM token refreshed');
            this.getToken();
        });
    }
    async requestPermission() {
        try {
            console.log('🔔 Requesting notification permission...');
            
            if (this.permission === 'granted') {
                console.log('✅ Notification permission already granted');
                return true;
            }

            if (this.permission === 'denied') {
                console.log('❌ Notification permission denied');
                this.showPermissionDeniedMessage();
                return false;
            }

            // Request permission
            const permission = await Notification.requestPermission();
            this.permission = permission;
            
            if (permission === 'granted') {
                console.log('✅ Notification permission granted');
                await this.getToken();
                this.showPermissionGrantedMessage();
                return true;
            } else {
                console.log('❌ Notification permission denied');
                this.showPermissionDeniedMessage();
                return false;
            }
            
        } catch (error) {
            console.error('❌ Error requesting permission:', error);
            return false;
        }
    }

    async getToken() {
        if (!this.messaging || this.permission !== 'granted') {
            console.log('⚠️ Cannot get token - messaging not available or permission not granted');
            return null;
        }

        try {
            const token = await this.messaging.getToken({ vapidKey: this.vapidKey });
            
            if (token) {
                console.log('🎫 FCM Token:', token);
                this.token = token;
                
                // Save token to user profile
                await this.saveTokenToProfile(token);
                
                return token;
            } else {
                console.log('❌ No registration token available');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Error getting FCM token:', error);
            return null;
        }
    }

    async saveTokenToProfile(token) {
        try {
            const user = window.auth?.currentUser;
            if (!user || !window.db) {
                console.log('⚠️ Cannot save token - user not authenticated or Firestore not available');
                return;
            }

            await window.db.collection('users').doc(user.uid).update({
                fcmToken: token,
                tokenUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                notificationsEnabled: true
            });
            
            console.log('✅ FCM token saved to user profile');
            
        } catch (error) {
            console.error('❌ Error saving token to profile:', error);
        }
    }

    showNotification(payload) {
        const { notification, data } = payload;
        
        if (!notification) {
            console.log('⚠️ No notification data in payload');
            return;
        }

        // Create custom notification
        const notificationOptions = {
            body: notification.body,
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
            data: data || {}
        };

        // Show browser notification
        if (this.permission === 'granted') {
            const notification = new Notification(notification.title, notificationOptions);
            
            notification.onclick = () => {
                console.log('🔔 Notification clicked');
                this.handleNotificationClick(payload);
                notification.close();
            };
        }

        // Also show in-app notification
        this.showInAppNotification(payload);
    }
    showInAppNotification(payload) {
        const { notification, data } = payload;
        
        // Create in-app notification element
        const notificationEl = document.createElement('div');
        notificationEl.className = 'in-app-notification';
        notificationEl.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <div class="notification-icon">🔔</div>
                    <div class="notification-title">${notification.title}</div>
                    <button class="notification-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="notification-body">${notification.body}</div>
                <div class="notification-actions">
                    <button class="notification-btn primary" onclick="window.notificationManager.handleNotificationClick(${JSON.stringify(payload).replace(/"/g, '&quot;')}); this.parentElement.parentElement.parentElement.remove();">
                        View
                    </button>
                    <button class="notification-btn secondary" onclick="this.parentElement.parentElement.parentElement.remove();">
                        Dismiss
                    </button>
                </div>
            </div>
        `;

        // Add styles
        notificationEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            border: 1px solid #e9ecef;
            max-width: 400px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        // Add to page
        document.body.appendChild(notificationEl);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (notificationEl.parentNode) {
                        notificationEl.remove();
                    }
                }, 300);
            }
        }, 8000);
    }

    handleNotificationClick(payload) {
        const { data } = payload;
        
        console.log('🔔 Handling notification click:', data);
        
        // Handle different notification types
        if (data?.type) {
            switch (data.type) {
                case 'course_update':
                    window.location.href = `lesson-${data.courseId}.html`;
                    break;
                case 'order_update':
                    window.location.href = 'orders.html';
                    break;
                case 'message':
                    window.location.href = 'contact.html';
                    break;
                case 'dashboard':
                    window.location.href = 'dashboard.html';
                    break;
                default:
                    window.location.href = 'index.html';
            }
        } else {
            // Default action
            window.location.href = 'dashboard.html';
        }
    }

    showPermissionGrantedMessage() {
        if (window.showToast) {
            window.showToast('🔔 Notifications enabled! You\'ll receive updates about your courses and orders.', 'success', 6000);
        }
    }

    showPermissionDeniedMessage() {
        if (window.showToast) {
            window.showToast('🔕 Notifications disabled. You can enable them in your browser settings.', 'warning', 8000);
        }
    }

    // Send test notification (for development)
    async sendTestNotification() {
        if (!this.token) {
            console.log('❌ No FCM token available');
            return;
        }

        // This would typically be done from your server
        console.log('🧪 Test notification would be sent to token:', this.token);
        
        // Simulate a notification for testing
        const testPayload = {
            notification: {
                title: 'TARG STAR Test Notification',
                body: 'This is a test notification from your AI education platform!'
            },
            data: {
                type: 'dashboard',
                timestamp: new Date().toISOString()
            }
        };
        
        this.showNotification(testPayload);
    }

    // Subscribe to topic notifications
    async subscribeToTopic(topic) {
        if (!this.token) {
            console.log('❌ No FCM token available for topic subscription');
            return false;
        }

        try {
            // This would typically be done via your server
            console.log(`📢 Subscribing to topic: ${topic}`);
            
            // Save subscription to user profile
            const user = window.auth?.currentUser;
            if (user && window.db) {
                await window.db.collection('users').doc(user.uid).update({
                    [`subscriptions.${topic}`]: true,
                    subscriptionsUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                console.log(`✅ Subscribed to topic: ${topic}`);
                return true;
            }
            
        } catch (error) {
            console.error(`❌ Error subscribing to topic ${topic}:`, error);
            return false;
        }
    }

    // Unsubscribe from topic notifications
    async unsubscribeFromTopic(topic) {
        try {
            console.log(`📢 Unsubscribing from topic: ${topic}`);
            
            const user = window.auth?.currentUser;
            if (user && window.db) {
                await window.db.collection('users').doc(user.uid).update({
                    [`subscriptions.${topic}`]: false,
                    subscriptionsUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                console.log(`✅ Unsubscribed from topic: ${topic}`);
                return true;
            }
            
        } catch (error) {
            console.error(`❌ Error unsubscribing from topic ${topic}:`, error);
            return false;
        }
    }

    // Get notification settings
    getSettings() {
        return {
            isSupported: this.isSupported,
            permission: this.permission,
            hasToken: !!this.token,
            token: this.token
        };
    }
}
// Initialize notification manager when Firebase is ready
let notificationManager = null;

function initializeNotifications() {
    if (window.FirebaseHelpers?.isFirebaseReady()) {
        console.log('🔔 Initializing notification manager...');
        notificationManager = new NotificationManager();
        window.notificationManager = notificationManager;
        console.log('✅ Notification manager initialized');
    } else {
        console.log('⚠️ Firebase not ready, retrying notification initialization...');
        setTimeout(initializeNotifications, 2000);
    }
}

// Wait for Firebase to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeNotifications, 1000);
    });
} else {
    setTimeout(initializeNotifications, 1000);
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .in-app-notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .notification-content {
        padding: 20px;
    }

    .notification-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
    }

    .notification-icon {
        font-size: 1.2rem;
    }

    .notification-title {
        flex: 1;
        font-weight: 600;
        color: #333;
        font-size: 1rem;
    }

    .notification-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #666;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }

    .notification-close:hover {
        background: #f8f9fa;
        color: #333;
    }

    .notification-body {
        color: #666;
        font-size: 0.9rem;
        line-height: 1.5;
        margin-bottom: 15px;
    }

    .notification-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }

    .notification-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .notification-btn.primary {
        background: linear-gradient(45deg, #FFD700, #FFA500);
        color: #333;
    }

    .notification-btn.primary:hover {
        background: linear-gradient(45deg, #FFA500, #FF8C00);
        color: white;
        transform: translateY(-1px);
    }

    .notification-btn.secondary {
        background: #f8f9fa;
        color: #666;
        border: 1px solid #e9ecef;
    }

    .notification-btn.secondary:hover {
        background: #e9ecef;
        color: #333;
    }

    /* Notification permission prompt */
    .notification-permission-prompt {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        border: 1px solid #e9ecef;
        max-width: 350px;
        z-index: 10000;
        padding: 20px;
        animation: slideInRight 0.3s ease-out;
    }

    .permission-prompt-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
    }

    .permission-prompt-title {
        font-weight: 600;
        color: #333;
        font-size: 1rem;
    }

    .permission-prompt-body {
        color: #666;
        font-size: 0.9rem;
        line-height: 1.5;
        margin-bottom: 15px;
    }

    .permission-prompt-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
`;

document.head.appendChild(notificationStyles);

// Global notification functions
window.requestNotificationPermission = async function() {
    if (window.notificationManager) {
        return await window.notificationManager.requestPermission();
    } else {
        console.log('⚠️ Notification manager not available');
        return false;
    }
};

window.sendTestNotification = function() {
    if (window.notificationManager) {
        window.notificationManager.sendTestNotification();
    } else {
        console.log('⚠️ Notification manager not available');
    }
};

window.getNotificationSettings = function() {
    if (window.notificationManager) {
        return window.notificationManager.getSettings();
    } else {
        return {
            isSupported: false,
            permission: 'default',
            hasToken: false,
            token: null
        };
    }
};

// Show notification permission prompt for new users
function showNotificationPermissionPrompt() {
    if (Notification.permission !== 'default') {
        return; // Already granted or denied
    }

    const prompt = document.createElement('div');
    prompt.className = 'notification-permission-prompt';
    prompt.innerHTML = `
        <div class="permission-prompt-header">
            <div class="notification-icon">🔔</div>
            <div class="permission-prompt-title">Enable Notifications</div>
        </div>
        <div class="permission-prompt-body">
            Get notified about course updates, new lessons, and important announcements from TARG STAR.
        </div>
        <div class="permission-prompt-actions">
            <button class="notification-btn secondary" onclick="this.parentElement.parentElement.remove();">
                Not Now
            </button>
            <button class="notification-btn primary" onclick="window.requestNotificationPermission(); this.parentElement.parentElement.remove();">
                Enable
            </button>
        </div>
    `;

    document.body.appendChild(prompt);

    // Auto-remove after 15 seconds
    setTimeout(() => {
        if (prompt.parentNode) {
            prompt.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (prompt.parentNode) {
                    prompt.remove();
                }
            }, 300);
        }
    }, 15000);
}

// Show permission prompt for authenticated users after a delay
setTimeout(() => {
    if (window.auth?.currentUser && Notification.permission === 'default') {
        showNotificationPermissionPrompt();
    }
}, 5000);

console.log('🔔 Firebase Notifications system loaded');
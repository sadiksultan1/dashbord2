// Simplified Firebase Configuration for TARG STAR
console.log('🔥 Loading simplified Firebase configuration...');

// Simple Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBS_h1U4LXZl-EliAkF2BaINvWkOKpvyjA",
    authDomain: "dashbord2-9c725.firebaseapp.com",
    projectId: "dashbord2-9c725",
    storageBucket: "dashbord2-9c725.appspot.com",
    messagingSenderId: "591902142722",
    appId: "1:591902142722:web:6beacfb03e8017c0bc121b"
};

// Global variables
let firebaseApp = null;
let auth = null;
let db = null;
let storage = null;

// Simple initialization function
function initFirebase() {
    try {
        console.log('🔧 Initializing Firebase...');
        
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK not loaded');
            return false;
        }
        
        // Initialize Firebase app
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase app initialized');
        } else {
            firebaseApp = firebase.apps[0];
            console.log('✅ Firebase app already exists');
        }
        
        // Initialize services
        try {
            auth = firebase.auth();
            console.log('✅ Auth initialized');
        } catch (e) {
            console.error('❌ Auth failed:', e.message);
        }
        
        try {
            db = firebase.firestore();
            console.log('✅ Firestore initialized');
        } catch (e) {
            console.error('❌ Firestore failed:', e.message);
        }
        
        try {
            storage = firebase.storage();
            console.log('✅ Storage initialized');
        } catch (e) {
            console.error('❌ Storage failed:', e.message);
        }
        
        // Make services globally available
        window.firebase = firebase;
        window.auth = auth;
        window.db = db;
        window.storage = storage;
        
        console.log('🎉 Firebase initialization complete!');
        return true;
        
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return false;
    }
}

// Simple helper functions
window.SimpleFirebase = {
    // Check if Firebase is ready
    isReady: () => {
        return !!(firebaseApp && auth && db);
    },
    
    // Save contact message
    saveMessage: async (messageData) => {
        try {
            if (!db) {
                // Fallback to localStorage
                const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
                const message = {
                    ...messageData,
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    method: 'localStorage'
                };
                messages.push(message);
                localStorage.setItem('contact_messages', JSON.stringify(messages));
                console.log('✅ Message saved to localStorage');
                return message;
            }
            
            // Save to Firestore
            const docRef = await db.collection('contact-messages').add({
                ...messageData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'new'
            });
            
            console.log('✅ Message saved to Firestore:', docRef.id);
            return { id: docRef.id, ...messageData };
            
        } catch (error) {
            console.error('❌ Error saving message:', error);
            
            // Fallback to localStorage
            const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
            const message = {
                ...messageData,
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                method: 'fallback',
                error: error.message
            };
            messages.push(message);
            localStorage.setItem('contact_messages', JSON.stringify(messages));
            console.log('✅ Message saved to localStorage (fallback)');
            return message;
        }
    },
    
    // Test connection
    testConnection: async () => {
        try {
            if (!db) {
                console.log('❌ Firestore not available');
                return false;
            }
            
            // Try to read from Firestore
            await db.collection('_test').limit(1).get();
            console.log('✅ Firestore connection working');
            return true;
            
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return false;
        }
    },
    
    // Get status
    getStatus: () => {
        return {
            firebaseSDK: typeof firebase !== 'undefined',
            app: !!firebaseApp,
            auth: !!auth,
            firestore: !!db,
            storage: !!storage,
            ready: window.SimpleFirebase.isReady()
        };
    }
};

// Initialize Firebase when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initFirebase, 1000);
    });
} else {
    setTimeout(initFirebase, 1000);
}

// Also try immediate initialization
setTimeout(initFirebase, 500);

console.log('🔥 Simple Firebase configuration loaded');
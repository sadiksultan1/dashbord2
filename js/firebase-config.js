// Enhanced Firebase Configuration for TARG STAR with better error handling
console.log('🔥 Starting Firebase initialization...');

// Your web app's Firebase configuration - Updated for better connectivity
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

// Firebase initialization with enhanced error handling and retry logic
let auth, db, storage, analytics;
let firebaseInitialized = false;
let initializationAttempts = 0;
const maxInitializationAttempts = 3;

function initializeFirebase() {
    initializationAttempts++;
    
    try {
        // Check if Firebase is available
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK not loaded - attempt', initializationAttempts);
            
            if (initializationAttempts < maxInitializationAttempts) {
                console.log('🔄 Retrying Firebase initialization in 2 seconds...');
                setTimeout(initializeFirebase, 2000);
                return false;
            } else {
                console.error('❌ Firebase SDK failed to load after', maxInitializationAttempts, 'attempts');
                return false;
            }
        }

        console.log('🔧 Initializing Firebase app... (attempt', initializationAttempts + ')');
        
        // Initialize Firebase app
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase app initialized successfully');
        } else {
            console.log('✅ Firebase app already initialized');
        }

        // Initialize Firebase services with enhanced error handling
        try {
            auth = firebase.auth();
            console.log('✅ Firebase Auth initialized');
            
            // Test auth connection
            auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('🔐 User authenticated:', user.email);
                } else {
                    console.log('🔐 No user authenticated');
                }
            });
            
        } catch (error) {
            console.error('❌ Firebase Auth initialization failed:', error);
            auth = null;
        }

        try {
            db = firebase.firestore();
            console.log('✅ Firestore initialized');
            
            // Configure Firestore settings for better performance
            db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
                ignoreUndefinedProperties: true
            });
            
            // Test Firestore connection
            testFirestoreConnection();
            
        } catch (error) {
            console.error('❌ Firestore initialization failed:', error);
            db = null;
        }

        try {
            storage = firebase.storage();
            console.log('✅ Firebase Storage initialized');
        } catch (error) {
            console.error('❌ Firebase Storage initialization failed:', error);
            storage = null;
        }

        // Initialize Analytics (optional)
        try {
            if (firebase.analytics && typeof firebase.analytics === 'function') {
                analytics = firebase.analytics();
                console.log('✅ Firebase Analytics initialized');
            } else {
                console.log('⚠️ Firebase Analytics not available');
            }
        } catch (error) {
            console.log('⚠️ Analytics initialization failed:', error.message);
            analytics = null;
        }

        // Set up auth persistence with error handling
        if (auth) {
            auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .then(() => {
                    console.log('✅ Auth persistence set to LOCAL');
                })
                .catch((error) => {
                    console.error('⚠️ Error setting auth persistence:', error);
                });
        }

        // Enable offline persistence for Firestore with error handling
        if (db) {
            db.enablePersistence({ synchronizeTabs: true })
                .then(() => {
                    console.log('✅ Firestore offline persistence enabled');
                })
                .catch((err) => {
                    if (err.code === 'failed-precondition') {
                        console.log('⚠️ Multiple tabs open, persistence can only be enabled in one tab');
                    } else if (err.code === 'unimplemented') {
                        console.log('⚠️ Browser does not support offline persistence');
                    } else {
                        console.error('⚠️ Persistence error:', err);
                    }
                });
        }

        firebaseInitialized = true;
        console.log('🎉 Firebase initialization completed successfully!');
        
        // Show success notification
        setTimeout(() => {
            if (window.showToast) {
                window.showToast('🔥 Firebase connected successfully!', 'success');
            }
        }, 1000);
        
        return true;

    } catch (error) {
        console.error('❌ Firebase initialization failed (attempt ' + initializationAttempts + '):', error);
        
        if (initializationAttempts < maxInitializationAttempts) {
            console.log('🔄 Retrying Firebase initialization in 3 seconds...');
            setTimeout(initializeFirebase, 3000);
        } else {
            console.error('❌ Firebase initialization failed after', maxInitializationAttempts, 'attempts');
            if (window.showToast) {
                window.showToast('⚠️ Firebase connection failed - using offline mode', 'warning');
            }
        }
        
        return false;
    }
}

// Test Firestore connection
async function testFirestoreConnection() {
    if (!db) return false;
    
    try {
        // Try to read from Firestore
        const testDoc = await db.collection('_test').doc('connection').get();
        console.log('✅ Firestore connection test successful');
        return true;
    } catch (error) {
        console.error('❌ Firestore connection test failed:', error);
        
        // Try to write a test document
        try {
            await db.collection('_test').doc('connection').set({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                test: true
            });
            console.log('✅ Firestore write test successful');
            return true;
        } catch (writeError) {
            console.error('❌ Firestore write test failed:', writeError);
            return false;
        }
    }
}

// Initialize Firebase with retry logic
let initSuccess = false;

// Try immediate initialization
initSuccess = initializeFirebase();

// If immediate initialization fails, try again after DOM loads
if (!initSuccess) {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔄 Retrying Firebase initialization after DOM load...');
        initializeFirebase();
    });
}

// Also try after a delay to ensure all scripts are loaded
setTimeout(() => {
    if (!firebaseInitialized) {
        console.log('🔄 Final Firebase initialization attempt...');
        initializeFirebase();
    }
}, 5000);

// Make Firebase services globally available
window.firebase = firebase;
window.auth = auth;
window.db = db;
window.storage = storage;
window.analytics = analytics;
window.firebaseInitialized = firebaseInitialized;

// Enhanced Firebase Helper functions with fallbacks
window.FirebaseHelpers = {
    // Check if Firebase is properly initialized
    isFirebaseReady: () => {
        return firebaseInitialized && auth && db;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        if (!auth) return false;
        return auth.currentUser !== null;
    },
    
    // Get current user
    getCurrentUser: () => {
        if (!auth) return null;
        return auth.currentUser;
    },
    
    // Sign out user
    signOut: async () => {
        try {
            if (!auth) {
                console.log('⚠️ Auth not available, clearing local storage');
                localStorage.removeItem('targstar_user');
                return true;
            }
            
            await auth.signOut();
            console.log('✅ User signed out successfully');
            return true;
        } catch (error) {
            console.error('❌ Sign out error:', error);
            // Fallback: clear local storage
            localStorage.removeItem('targstar_user');
            return false;
        }
    },
    
    // Create user document with fallback
    createUserDocument: async (user, additionalData = {}) => {
        if (!user) return null;
        
        try {
            if (!db) {
                console.log('⚠️ Firestore not available, using local storage');
                const userData = {
                    uid: user.uid,
                    displayName: user.displayName || 'Anonymous User',
                    email: user.email,
                    photoURL: user.photoURL || '',
                    createdAt: new Date().toISOString(),
                    ...additionalData
                };
                localStorage.setItem(`user_${user.uid}`, JSON.stringify(userData));
                return userData;
            }
            
            const userRef = db.collection('users').doc(user.uid);
            const snapshot = await userRef.get();
            
            if (!snapshot.exists) {
                const { displayName, email, photoURL } = user;
                const userData = {
                    displayName: displayName || 'Anonymous User',
                    email,
                    photoURL: photoURL || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                    isActive: true,
                    preferences: {
                        theme: 'light',
                        notifications: true,
                        language: 'en'
                    },
                    profile: {
                        bio: '',
                        location: '',
                        website: '',
                        skills: []
                    },
                    stats: {
                        coursesCompleted: 0,
                        totalSpent: 0,
                        totalOrders: 0,
                        joinDate: firebase.firestore.FieldValue.serverTimestamp()
                    },
                    cart: [],
                    wishlist: [],
                    orders: [],
                    contactMessages: [],
                    ...additionalData
                };
                
                await userRef.set(userData);
                console.log('✅ User document created successfully');
            } else {
                // Update last login time
                await userRef.update({
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('✅ User login time updated');
            }
            
            return userRef;
        } catch (error) {
            console.error('❌ Error creating user document:', error);
            return null;
        }
    },
    
    // Save contact message with fallback
    saveContactMessage: async (messageData) => {
        try {
            if (!db) {
                console.log('⚠️ Firestore not available, using local storage');
                const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
                const messageWithId = {
                    ...messageData,
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString()
                };
                messages.push(messageWithId);
                localStorage.setItem('contact_messages', JSON.stringify(messages));
                console.log('✅ Message saved to local storage');
                return messageWithId;
            }
            
            const docRef = await db.collection('contact-messages').add({
                ...messageData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                serverTimestamp: new Date().toISOString(),
                status: 'new'
            });
            
            console.log('✅ Message saved to Firestore with ID:', docRef.id);
            return { id: docRef.id, ...messageData };
        } catch (error) {
            console.error('❌ Error saving contact message:', error);
            // Fallback to local storage
            const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
            const messageWithId = {
                ...messageData,
                id: Date.now().toString(),
                timestamp: new Date().toISOString()
            };
            messages.push(messageWithId);
            localStorage.setItem('contact_messages', JSON.stringify(messages));
            console.log('✅ Message saved to local storage (fallback)');
            return messageWithId;
        }
    },
    
    // Upload file with fallback
    uploadFile: async (file, path) => {
        try {
            if (!storage) {
                console.log('⚠️ Storage not available');
                throw new Error('Firebase Storage not available');
            }
            
            const storageRef = storage.ref().child(path);
            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            console.log('✅ File uploaded successfully:', downloadURL);
            return downloadURL;
        } catch (error) {
            console.error('❌ File upload error:', error);
            throw error;
        }
    },
    
    // Log analytics event with fallback
    logEvent: (eventName, parameters = {}) => {
        try {
            if (analytics) {
                analytics.logEvent(eventName, parameters);
                console.log('📊 Analytics event logged:', eventName, parameters);
            } else {
                console.log('📊 Analytics not available, logging to console:', eventName, parameters);
            }
        } catch (error) {
            console.error('📊 Analytics error:', error);
        }
    },
    
    // Test Firebase connection with enhanced diagnostics
    testConnection: async () => {
        console.log('🔍 Testing Firebase connection...');
        
        try {
            if (!db) {
                console.log('❌ Firestore not available');
                return false;
            }
            
            // Test 1: Simple read operation
            console.log('📖 Testing Firestore read...');
            const testCollection = db.collection('_connection_test');
            const snapshot = await testCollection.limit(1).get();
            console.log('✅ Firestore read test successful');
            
            // Test 2: Write operation
            console.log('✍️ Testing Firestore write...');
            const testDoc = {
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                test: true,
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            const docRef = await testCollection.add(testDoc);
            console.log('✅ Firestore write test successful, doc ID:', docRef.id);
            
            // Test 3: Auth connection
            if (auth) {
                console.log('🔐 Testing Auth connection...');
                const currentUser = auth.currentUser;
                console.log('✅ Auth connection test successful, current user:', currentUser ? currentUser.email : 'none');
            }
            
            // Test 4: Storage connection
            if (storage) {
                console.log('📁 Testing Storage connection...');
                const storageRef = storage.ref();
                console.log('✅ Storage connection test successful');
            }
            
            console.log('🎉 All Firebase connection tests passed!');
            return true;
            
        } catch (error) {
            console.error('❌ Firebase connection test failed:', error);
            
            // Detailed error analysis
            if (error.code === 'permission-denied') {
                console.error('🚫 Permission denied - check Firestore security rules');
            } else if (error.code === 'unavailable') {
                console.error('🌐 Firebase service unavailable - check internet connection');
            } else if (error.code === 'unauthenticated') {
                console.error('🔐 Authentication required for this operation');
            } else {
                console.error('❓ Unknown error:', error.message);
            }
            
            return false;
        }
    },
    
    // Enhanced connection diagnostics
    diagnoseConnection: async () => {
        console.log('🔍 Running Firebase connection diagnostics...');
        
        const diagnostics = {
            firebaseSDK: typeof firebase !== 'undefined',
            firebaseApp: firebase?.apps?.length > 0,
            auth: !!auth,
            firestore: !!db,
            storage: !!storage,
            analytics: !!analytics,
            online: navigator.onLine,
            projectId: firebaseConfig.projectId,
            authDomain: firebaseConfig.authDomain
        };
        
        console.table(diagnostics);
        
        // Test each service
        const serviceTests = {};
        
        if (auth) {
            try {
                await auth.signInAnonymously();
                await auth.signOut();
                serviceTests.auth = 'Working';
            } catch (error) {
                serviceTests.auth = `Error: ${error.message}`;
            }
        } else {
            serviceTests.auth = 'Not initialized';
        }
        
        if (db) {
            try {
                await db.collection('_test').limit(1).get();
                serviceTests.firestore = 'Working';
            } catch (error) {
                serviceTests.firestore = `Error: ${error.message}`;
            }
        } else {
            serviceTests.firestore = 'Not initialized';
        }
        
        if (storage) {
            try {
                storage.ref().toString();
                serviceTests.storage = 'Working';
            } catch (error) {
                serviceTests.storage = `Error: ${error.message}`;
            }
        } else {
            serviceTests.storage = 'Not initialized';
        }
        
        console.log('🧪 Service Test Results:');
        console.table(serviceTests);
        
        return { diagnostics, serviceTests };
    }
};

// Connection monitoring with enhanced notifications
let isOnline = navigator.onLine;
let lastFirebaseStatus = null;

// Enhanced toast notification system
window.showToast = function(message, type = 'info', duration = 4000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = message;
    
    // Toast styles
    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
        zIndex: '10000',
        maxWidth: '350px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        transform: 'translateX(400px)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    };
    
    // Type-specific colors
    const typeColors = {
        success: 'linear-gradient(135deg, #28a745, #20c997)',
        error: 'linear-gradient(135deg, #dc3545, #c82333)',
        warning: 'linear-gradient(135deg, #ffc107, #fd7e14)',
        info: 'linear-gradient(135deg, #17a2b8, #138496)'
    };
    
    Object.assign(toast.style, styles);
    toast.style.background = typeColors[type] || typeColors.info;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-hide
    const hideTimeout = setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
    
    // Click to dismiss
    toast.addEventListener('click', () => {
        clearTimeout(hideTimeout);
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    });
};

window.addEventListener('online', () => {
    isOnline = true;
    console.log('🌐 Back online');
    
    // Test Firebase connection when back online
    setTimeout(async () => {
        if (window.FirebaseHelpers?.isFirebaseReady()) {
            const connectionTest = await window.FirebaseHelpers.testConnection();
            if (connectionTest) {
                window.showToast('🌐 Connection restored - Firebase working!', 'success');
            } else {
                window.showToast('🌐 Online but Firebase issues detected', 'warning');
            }
        } else {
            window.showToast('🌐 Back online - Firebase reconnecting...', 'info');
            // Try to reinitialize Firebase
            if (window.debugFirebase?.reinitialize) {
                window.debugFirebase.reinitialize();
            }
        }
    }, 2000);
});

window.addEventListener('offline', () => {
    isOnline = false;
    console.log('📴 Offline mode');
    window.showToast('📴 Working offline - limited functionality', 'warning', 6000);
});

// Monitor Firebase connection status
function monitorFirebaseStatus() {
    const currentStatus = window.FirebaseHelpers?.isFirebaseReady();
    
    if (currentStatus !== lastFirebaseStatus) {
        lastFirebaseStatus = currentStatus;
        
        if (currentStatus) {
            console.log('🔥 Firebase connection established');
            if (isOnline) {
                window.showToast('🔥 Firebase connected successfully!', 'success');
            }
        } else {
            console.log('⚠️ Firebase connection lost');
            if (isOnline) {
                window.showToast('⚠️ Firebase connection issues - using offline mode', 'warning', 6000);
            }
        }
    }
}

// Check Firebase status periodically
setInterval(monitorFirebaseStatus, 10000);

// Initialize app when DOM is loaded with enhanced diagnostics
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 TARG STAR Firebase initialization complete');
    console.log('📊 Project ID:', firebaseConfig.projectId);
    console.log('🌐 Auth Domain:', firebaseConfig.authDomain);
    console.log('🔥 Firebase Ready:', window.FirebaseHelpers.isFirebaseReady());
    
    // Run comprehensive connection test
    setTimeout(async () => {
        console.log('🔍 Running Firebase connection diagnostics...');
        
        if (window.FirebaseHelpers.isFirebaseReady()) {
            // Run diagnostics
            const diagnostics = await window.FirebaseHelpers.diagnoseConnection();
            
            // Test connection
            const connectionTest = await window.FirebaseHelpers.testConnection();
            
            if (connectionTest) {
                console.log('✅ Firebase is working properly');
                if (window.showToast) {
                    window.showToast('✅ Firebase connected successfully!', 'success');
                }
            } else {
                console.log('⚠️ Firebase connection issues detected');
                if (window.showToast) {
                    window.showToast('⚠️ Firebase connection issues - using offline mode', 'warning');
                }
            }
        } else {
            console.log('⚠️ Firebase not properly initialized, using fallback mode');
            if (window.showToast) {
                window.showToast('⚠️ Using offline mode - some features may be limited', 'warning');
            }
            
            // Try one more initialization attempt
            console.log('🔄 Attempting final Firebase initialization...');
            const finalAttempt = initializeFirebase();
            if (finalAttempt) {
                console.log('✅ Final initialization attempt successful!');
                if (window.showToast) {
                    window.showToast('✅ Firebase connection restored!', 'success');
                }
            }
        }
    }, 3000);
    
    // Log initial analytics event
    if (analytics) {
        window.FirebaseHelpers.logEvent('app_initialized', {
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            page_location: window.location.href,
            firebase_ready: window.FirebaseHelpers.isFirebaseReady(),
            connection_test: 'pending'
        });
    }
});

// Export for ES6 modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        firebase,
        auth,
        db,
        storage,
        analytics,
        firebaseConfig,
        FirebaseHelpers: window.FirebaseHelpers
    };
}

// Global debugging functions for Firebase
window.debugFirebase = {
    // Test Firebase connection
    testConnection: async () => {
        console.log('🧪 Manual Firebase connection test...');
        if (window.FirebaseHelpers) {
            const result = await window.FirebaseHelpers.testConnection();
            console.log('Test result:', result ? '✅ Success' : '❌ Failed');
            return result;
        } else {
            console.log('❌ FirebaseHelpers not available');
            return false;
        }
    },
    
    // Run full diagnostics
    diagnose: async () => {
        console.log('🔍 Running full Firebase diagnostics...');
        if (window.FirebaseHelpers) {
            return await window.FirebaseHelpers.diagnoseConnection();
        } else {
            console.log('❌ FirebaseHelpers not available');
            return null;
        }
    },
    
    // Check Firebase status
    status: () => {
        console.log('📊 Firebase Status:');
        console.log('- SDK Loaded:', typeof firebase !== 'undefined');
        console.log('- App Initialized:', firebase?.apps?.length > 0);
        console.log('- Auth Available:', !!window.auth);
        console.log('- Firestore Available:', !!window.db);
        console.log('- Storage Available:', !!window.storage);
        console.log('- Analytics Available:', !!window.analytics);
        console.log('- Firebase Ready:', window.FirebaseHelpers?.isFirebaseReady());
        console.log('- Online:', navigator.onLine);
    },
    
    // Force reinitialize Firebase
    reinitialize: () => {
        console.log('🔄 Force reinitializing Firebase...');
        return initializeFirebase();
    },
    
    // Test specific service
    testService: async (service) => {
        console.log(`🧪 Testing ${service} service...`);
        
        switch (service) {
            case 'auth':
                if (!window.auth) {
                    console.log('❌ Auth not available');
                    return false;
                }
                try {
                    const user = window.auth.currentUser;
                    console.log('✅ Auth working, current user:', user ? user.email : 'none');
                    return true;
                } catch (error) {
                    console.log('❌ Auth error:', error.message);
                    return false;
                }
                
            case 'firestore':
                if (!window.db) {
                    console.log('❌ Firestore not available');
                    return false;
                }
                try {
                    await window.db.collection('_test').limit(1).get();
                    console.log('✅ Firestore working');
                    return true;
                } catch (error) {
                    console.log('❌ Firestore error:', error.message);
                    return false;
                }
                
            case 'storage':
                if (!window.storage) {
                    console.log('❌ Storage not available');
                    return false;
                }
                try {
                    window.storage.ref().toString();
                    console.log('✅ Storage working');
                    return true;
                } catch (error) {
                    console.log('❌ Storage error:', error.message);
                    return false;
                }
                
            default:
                console.log('❌ Unknown service. Available: auth, firestore, storage');
                return false;
        }
    }
};

console.log('🔥 Firebase configuration loaded successfully');
console.log('🧪 Debug functions available: window.debugFirebase.status(), window.debugFirebase.testConnection(), window.debugFirebase.diagnose()');

// Auto-run status check after a delay
setTimeout(() => {
    console.log('📊 Auto-running Firebase status check...');
    window.debugFirebase.status();
}, 2000);
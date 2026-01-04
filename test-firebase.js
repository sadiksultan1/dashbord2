// Firebase Connection Test Script
// Run this in the browser console to test Firebase connectivity

console.log('🔥 Starting Firebase Connection Test...');

// Test 1: Check if Firebase SDK is loaded
function testFirebaseSDK() {
    console.log('\n=== Test 1: Firebase SDK ===');
    
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK not loaded');
        return false;
    }
    
    console.log('✅ Firebase SDK loaded');
    console.log('📦 Firebase version:', firebase.SDK_VERSION);
    console.log('🏗️ Firebase apps:', firebase.apps.length);
    
    return true;
}

// Test 2: Check Firebase app initialization
function testFirebaseApp() {
    console.log('\n=== Test 2: Firebase App ===');
    
    if (!firebase.apps.length) {
        console.error('❌ No Firebase apps initialized');
        return false;
    }
    
    const app = firebase.apps[0];
    console.log('✅ Firebase app initialized');
    console.log('📋 App name:', app.name);
    console.log('⚙️ App options:', app.options);
    
    return true;
}

// Test 3: Check Firebase services
function testFirebaseServices() {
    console.log('\n=== Test 3: Firebase Services ===');
    
    const services = {
        auth: window.auth,
        firestore: window.db,
        storage: window.storage,
        analytics: window.analytics
    };
    
    let allWorking = true;
    
    Object.entries(services).forEach(([name, service]) => {
        if (service) {
            console.log(`✅ ${name} service available`);
        } else {
            console.error(`❌ ${name} service not available`);
            allWorking = false;
        }
    });
    
    return allWorking;
}

// Test 4: Test Firestore connection
async function testFirestoreConnection() {
    console.log('\n=== Test 4: Firestore Connection ===');
    
    if (!window.db) {
        console.error('❌ Firestore not available');
        return false;
    }
    
    try {
        console.log('📖 Testing Firestore read...');
        const testCollection = window.db.collection('_connection_test');
        const snapshot = await testCollection.limit(1).get();
        console.log('✅ Firestore read successful');
        
        console.log('✍️ Testing Firestore write...');
        const testDoc = {
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            test: true,
            testTime: new Date().toISOString()
        };
        
        const docRef = await testCollection.add(testDoc);
        console.log('✅ Firestore write successful, doc ID:', docRef.id);
        
        return true;
    } catch (error) {
        console.error('❌ Firestore connection failed:', error);
        console.error('🔍 Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        return false;
    }
}

// Test 5: Test Authentication
async function testAuthentication() {
    console.log('\n=== Test 5: Authentication ===');
    
    if (!window.auth) {
        console.error('❌ Auth not available');
        return false;
    }
    
    try {
        console.log('🔐 Current user:', window.auth.currentUser);
        console.log('✅ Auth service working');
        return true;
    } catch (error) {
        console.error('❌ Auth test failed:', error);
        return false;
    }
}

// Test 6: Test Firebase Helpers
function testFirebaseHelpers() {
    console.log('\n=== Test 6: Firebase Helpers ===');
    
    if (!window.FirebaseHelpers) {
        console.error('❌ FirebaseHelpers not available');
        return false;
    }
    
    console.log('✅ FirebaseHelpers available');
    console.log('🔧 Available methods:', Object.keys(window.FirebaseHelpers));
    console.log('🔥 Firebase ready:', window.FirebaseHelpers.isFirebaseReady());
    
    return true;
}

// Run all tests
async function runAllTests() {
    console.log('🧪 Running comprehensive Firebase tests...\n');
    
    const tests = [
        { name: 'Firebase SDK', test: testFirebaseSDK },
        { name: 'Firebase App', test: testFirebaseApp },
        { name: 'Firebase Services', test: testFirebaseServices },
        { name: 'Firestore Connection', test: testFirestoreConnection },
        { name: 'Authentication', test: testAuthentication },
        { name: 'Firebase Helpers', test: testFirebaseHelpers }
    ];
    
    const results = {};
    
    for (const { name, test } of tests) {
        try {
            results[name] = await test();
        } catch (error) {
            console.error(`❌ Test "${name}" threw an error:`, error);
            results[name] = false;
        }
    }
    
    console.log('\n=== Test Results Summary ===');
    console.table(results);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Firebase is working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Check the details above.');
        
        // Provide troubleshooting suggestions
        console.log('\n🔧 Troubleshooting suggestions:');
        
        if (!results['Firebase SDK']) {
            console.log('- Check if Firebase scripts are loaded correctly');
            console.log('- Verify internet connection');
        }
        
        if (!results['Firebase App']) {
            console.log('- Check Firebase configuration in firebase-config.js');
            console.log('- Verify project ID and API keys');
        }
        
        if (!results['Firestore Connection']) {
            console.log('- Check Firestore security rules');
            console.log('- Verify project permissions');
            console.log('- Check if Firestore is enabled in Firebase Console');
        }
    }
    
    return results;
}

// Export functions for manual testing
window.firebaseTests = {
    runAll: runAllTests,
    testSDK: testFirebaseSDK,
    testApp: testFirebaseApp,
    testServices: testFirebaseServices,
    testFirestore: testFirestoreConnection,
    testAuth: testAuthentication,
    testHelpers: testFirebaseHelpers
};

console.log('🧪 Firebase test functions loaded. Run window.firebaseTests.runAll() to test everything.');

// Auto-run tests if requested
if (window.location.search.includes('autotest=true')) {
    setTimeout(runAllTests, 2000);
}
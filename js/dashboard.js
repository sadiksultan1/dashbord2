// Dashboard functionality
// AUTHENTICATION CHECK - Dashboard access restricted to logged-in users only
(function checkAuthentication() {
    console.log('🔐 Checking authentication for dashboard access...');
    
    // Check if Firebase auth is available and user is signed in
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            if (!user) {
                // Check localStorage for demo accounts
                const storedUser = localStorage.getItem('targstar_user');
                if (!storedUser) {
                    console.log('❌ No authenticated user found - blocking dashboard access');
                    showAccessDenied();
                    return;
                }
                
                try {
                    const userData = JSON.parse(storedUser);
                    if (!userData || !userData.email) {
                        console.log('❌ Invalid user data - blocking dashboard access');
                        showAccessDenied();
                        return;
                    }
                } catch (error) {
                    console.log('❌ Error parsing user data - blocking dashboard access');
                    showAccessDenied();
                    return;
                }
            }
            console.log('✅ User authenticated - allowing dashboard access');
        });
    } else {
        // Firebase not available, check localStorage only
        const storedUser = localStorage.getItem('targstar_user');
        if (!storedUser) {
            console.log('❌ No user session found - blocking dashboard access');
            showAccessDenied();
            return;
        }
        
        try {
            const userData = JSON.parse(storedUser);
            if (!userData || !userData.email) {
                console.log('❌ Invalid user session - blocking dashboard access');
                showAccessDenied();
                return;
            }
            console.log('✅ Demo user session found - allowing dashboard access');
        } catch (error) {
            console.log('❌ Error validating user session - blocking dashboard access');
            showAccessDenied();
            return;
        }
    }
    
    function showAccessDenied() {
        // Hide the main content immediately
        const mainContent = document.querySelector('body');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
        
        // Show access denied page
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
            ">
                <div style="
                    background: white;
                    padding: 60px 40px;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    text-align: center;
                    max-width: 500px;
                    margin: 20px;
                    animation: fadeInUp 0.6s ease-out;
                ">
                    <div style="
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(45deg, #FFD700, #FFA500);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 30px;
                        font-size: 2rem;
                        animation: pulse 2s infinite;
                    ">🔒</div>
                    
                    <h1 style="
                        color: #333;
                        margin-bottom: 20px;
                        font-size: 2rem;
                        font-weight: 700;
                    ">Dashboard Access Restricted</h1>
                    
                    <p style="
                        color: #666;
                        margin-bottom: 30px;
                        font-size: 1.1rem;
                        line-height: 1.6;
                    ">
                        This dashboard is only accessible to authenticated users.<br>
                        Please sign in to access your learning dashboard and activate all features.
                    </p>
                    
                    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-bottom: 30px;">
                        <button onclick="window.location.href='index.html'" style="
                            background: linear-gradient(45deg, #667eea, #764ba2);
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 25px;
                            font-size: 1rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(102, 126, 234, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            🏠 Go to Homepage
                        </button>
                        
                        <button onclick="window.location.href='index.html#signin'" style="
                            background: linear-gradient(45deg, #FFD700, #FFA500);
                            color: #333;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 25px;
                            font-size: 1rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(255, 215, 0, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            🔑 Sign In Now
                        </button>
                    </div>
                    
                    <div style="
                        padding: 20px;
                        background: #f8f9fa;
                        border-radius: 10px;
                        border-left: 4px solid #FFD700;
                    ">
                        <h3 style="color: #333; margin-bottom: 15px; font-size: 1.1rem;">
                            <i class="fas fa-user-friends"></i> Demo Accounts Available:
                        </h3>
                        <div style="color: #666; font-size: 0.9rem; line-height: 1.8;">
                            📧 <strong>demo@targstar.com</strong> | 🔑 demo123<br>
                            📧 <strong>student@targstar.com</strong> | 🔑 student123<br>
                            📧 <strong>learner@targstar.com</strong> | 🔑 learner123
                        </div>
                        <p style="color: #999; font-size: 0.8rem; margin-top: 15px; margin-bottom: 0;">
                            Use any of these accounts to test the dashboard features
                        </p>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            </style>
        `;
    }
})();

class DashboardManager {
    constructor() {
        this.user = null;
        this.charts = {};
        this.activities = [];
        this.achievements = [];
        this.courses = [];
        this.orders = [];
        this.liveSession = null;
        this.notes = [];
        this.currentNote = '';
        this.autoSaveInterval = null;
        
        this.initializeDashboard();
    }

    async initializeDashboard() {
        // Wait for auth state
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.user = user;
                console.log('👤 User authenticated, activating dashboard...');
                
                // Show loading state
                this.showLoadingState();
                
                // Step 1: Load user data
                this.updateLoadingProgress(1, 'active', '👤 Loading user profile and data...');
                await this.loadUserData();
                this.updateLoadingProgress(1, 'completed');
                
                // Step 2: Initialize dashboard (NO AUTO PERMISSIONS)
                this.updateLoadingProgress(2, 'active', '🎛️ Setting up dashboard interface...');
                try {
                    console.log('🔧 Starting dashboard interface setup...');
                    
                    // Render dashboard with error handling
                    console.log('📊 Rendering dashboard...');
                    this.renderDashboard();
                    console.log('✅ Dashboard rendered successfully');
                    
                    // Setup event listeners with error handling
                    console.log('🎯 Setting up event listeners...');
                    this.setupEventListeners();
                    console.log('✅ Event listeners setup complete');
                    
                    // Initialize dashboard sections with error handling
                    console.log('🎛️ Initializing dashboard sections...');
                    this.initializeDashboardSections();
                    console.log('✅ Dashboard sections initialized');
                    
                    this.updateLoadingProgress(2, 'completed');
                    console.log('✅ Step 2 completed successfully');
                } catch (error) {
                    console.error('❌ Error in step 2 (dashboard interface setup):', error);
                    this.updateLoadingProgress(2, 'error', '❌ Dashboard interface setup failed');
                    
                    // Fallback: Try basic activation
                    try {
                        console.log('🔄 Attempting fallback dashboard activation...');
                        this.dashboardActive = true;
                        document.body.classList.add('dashboard-active');
                        
                        // Make all sections visible
                        const sections = document.querySelectorAll('.dashboard-card');
                        sections.forEach(section => {
                            section.style.display = 'block';
                            section.style.visibility = 'visible';
                            section.style.opacity = '1';
                        });
                        
                        console.log('✅ Fallback activation successful');
                        this.updateLoadingProgress(2, 'completed', '🎛️ Dashboard interface ready (fallback mode)');
                    } catch (fallbackError) {
                        console.error('❌ Fallback activation also failed:', fallbackError);
                    }
                }
                
                // Step 3: Prepare systems (NO AUTO-START)
                this.updateLoadingProgress(3, 'active', '⚙️ Preparing learning systems...');
                this.initializeLiveFeatures(); // Initialize but don't auto-start
                this.updateLoadingProgress(3, 'completed');
                
                // Step 4: Setup notes (NO AUTO-ACTIVATION)
                this.updateLoadingProgress(4, 'active', '📝 Setting up notes system...');
                this.setupNotesEditor();
                this.setupNotesLibrary();
                this.updateLoadingProgress(4, 'completed');
                
                // Step 5: Activate dashboard sections
                this.updateLoadingProgress(5, 'active', '🎯 Activating dashboard sections...');
                this.activateAllSections();
                this.updateLoadingProgress(5, 'completed');
                
                // Step 6: Set user online
                this.updateLoadingProgress(6, 'active', '🌐 Setting online status...');
                this.setUserOnlineStatus(true);
                this.updateLoadingProgress(6, 'completed');
                
                // Final step - NO AUTO PERMISSIONS
                setTimeout(() => {
                    this.hideLoadingState();
                    this.showDashboardReady();
                    console.log('✅ Dashboard fully activated for user:', user.displayName || user.email);
                }, 1000);
                
            } else {
                this.redirectToLogin();
            }
        });
    }

    redirectToLogin() {
        // Check if user is logged in via localStorage (for demo accounts)
        const storedUser = localStorage.getItem('targstar_user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                if (userData && userData.email) {
                    // User is logged in via demo account
                    this.user = userData;
                    console.log('👤 Demo user found, activating dashboard...');
                    
                    // Show loading state
                    this.showLoadingState();
                    
                    // Activate dashboard for demo user (NO AUTO PERMISSIONS)
                    this.activateDemoUserDashboard();
                    return;
                }
            } catch (error) {
                console.error('Error parsing stored user:', error);
            }
        }
        
        // No authenticated user found - redirect to login
        console.log('❌ No authenticated user - redirecting to login');
        
        // Show access denied message
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                <div style="
                    background: white;
                    padding: 60px 40px;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    text-align: center;
                    max-width: 500px;
                    margin: 20px;
                ">
                    <div style="
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(45deg, #FFD700, #FFA500);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 30px;
                        font-size: 2rem;
                    ">🔒</div>
                    
                    <h1 style="
                        color: #333;
                        margin-bottom: 20px;
                        font-size: 2rem;
                        font-weight: 700;
                    ">Access Restricted</h1>
                    
                    <p style="
                        color: #666;
                        margin-bottom: 30px;
                        font-size: 1.1rem;
                        line-height: 1.6;
                    ">
                        The dashboard is only accessible to logged-in users.<br>
                        Please sign in to access your learning dashboard.
                    </p>
                    
                    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="window.location.href='index.html'" style="
                            background: linear-gradient(45deg, #667eea, #764ba2);
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 25px;
                            font-size: 1rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            text-decoration: none;
                            display: inline-block;
                        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(102, 126, 234, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            🏠 Go to Homepage
                        </button>
                        
                        <button onclick="showSignInModal()" style="
                            background: linear-gradient(45deg, #FFD700, #FFA500);
                            color: #333;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 25px;
                            font-size: 1rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(255, 215, 0, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            🔑 Sign In Now
                        </button>
                    </div>
                    
                    <div style="
                        margin-top: 40px;
                        padding: 20px;
                        background: #f8f9fa;
                        border-radius: 10px;
                        border-left: 4px solid #FFD700;
                    ">
                        <h3 style="color: #333; margin-bottom: 15px; font-size: 1.1rem;">Demo Accounts Available:</h3>
                        <div style="color: #666; font-size: 0.9rem; line-height: 1.8;">
                            📧 <strong>demo@targstar.com</strong> | 🔑 demo123<br>
                            📧 <strong>student@targstar.com</strong> | 🔑 student123<br>
                            📧 <strong>learner@targstar.com</strong> | 🔑 learner123
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                function showSignInModal() {
                    // Redirect to homepage with sign-in trigger
                    window.location.href = 'index.html#signin';
                }
            </script>
        `;
    }

    async loadUserData() {
        try {
            // Load user document
            const userDoc = await db.collection('users').doc(this.user.uid).get();
            if (userDoc.exists) {
                this.userData = userDoc.data();
            } else {
                // Create user document if it doesn't exist
                await window.FirebaseHelpers.createUserDocument(this.user);
                this.userData = {
                    displayName: this.user.displayName || 'User',
                    email: this.user.email,
                    stats: { coursesCompleted: 0, totalSpent: 0, totalOrders: 0 },
                    profile: { bio: '', location: '', website: '' }
                };
            }

            // Load user activities, orders, etc.
            await Promise.all([
                this.loadActivities(),
                this.loadOrders(),
                this.loadCourses(),
                this.loadAchievements(),
                this.loadNotes()
            ]);

        } catch (error) {
            console.error('Error loading user data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadActivities() {
        try {
            console.log('📈 Loading user activities...');
            
            // Load activities from localStorage or Firebase
            let storedActivities = [];
            
            // Try to load from localStorage first
            const userActivities = localStorage.getItem(`targstar_activities_${this.user?.uid || 'demo'}`);
            if (userActivities) {
                storedActivities = JSON.parse(userActivities);
            }
            
            // Generate sample activities for demo (if no stored activities)
            if (storedActivities.length === 0) {
                this.activities = [
                    {
                        id: 1,
                        type: 'course',
                        title: 'Completed Machine Learning Basics',
                        description: 'Finished all modules and passed the final quiz',
                        time: this.getRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2 hours ago
                        timestamp: Date.now() - 2 * 60 * 60 * 1000,
                        icon: '🎓'
                    },
                    {
                        id: 2,
                        type: 'purchase',
                        title: 'Purchased AI Toolkit',
                        description: 'Premium AI development tools package',
                        time: this.getRelativeTime(new Date(Date.now() - 24 * 60 * 60 * 1000)), // 1 day ago
                        timestamp: Date.now() - 24 * 60 * 60 * 1000,
                        icon: '🛒'
                    },
                    {
                        id: 3,
                        type: 'achievement',
                        title: 'Earned "Quick Learner" Badge',
                        description: 'Completed 3 courses in one week',
                        time: this.getRelativeTime(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // 3 days ago
                        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
                        icon: '🏆'
                    },
                    {
                        id: 4,
                        type: 'course',
                        title: 'Started Deep Learning Course',
                        description: 'Enrolled in advanced neural networks',
                        time: this.getRelativeTime(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)), // 5 days ago
                        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
                        icon: '📚'
                    },
                    {
                        id: 5,
                        type: 'login',
                        title: 'Dashboard Activated',
                        description: 'Successfully logged in and activated dashboard',
                        time: this.getRelativeTime(new Date()),
                        timestamp: Date.now(),
                        icon: '🚀'
                    }
                ];
                
                // Save sample activities to localStorage
                this.saveActivities();
            } else {
                this.activities = storedActivities;
            }
            
            // Sort activities by timestamp (newest first)
            this.activities.sort((a, b) => b.timestamp - a.timestamp);
            
            console.log(`✅ Loaded ${this.activities.length} activities`);
        } catch (error) {
            console.error('Error loading activities:', error);
            this.activities = [];
        }
    }

    // Helper function to get relative time
    getRelativeTime(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.ceil(diffTime / (1000 * 60));
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffMinutes < 60) {
            return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
        } else if (diffHours < 24) {
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        } else {
            return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
        }
    }

    // Add new activity
    addActivity(type, title, description, icon = '📝') {
        const newActivity = {
            id: Date.now(),
            type: type,
            title: title,
            description: description,
            time: 'Just now',
            timestamp: Date.now(),
            icon: icon
        };
        
        this.activities.unshift(newActivity); // Add to beginning
        this.saveActivities();
        this.renderActivities();
        
        console.log('✅ New activity added:', title);
    }

    // Save activities to localStorage
    saveActivities() {
        try {
            localStorage.setItem(`targstar_activities_${this.user?.uid || 'demo'}`, JSON.stringify(this.activities));
        } catch (error) {
            console.error('Error saving activities:', error);
        }
    }

    async loadOrders() {
        try {
            // Load from cart manager
            if (window.cartManager) {
                this.orders = window.cartManager.getOrderHistory().slice(0, 3);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    async loadCourses() {
        try {
            // Generate sample course progress
            this.courses = [
                {
                    id: 1,
                    title: 'Machine Learning Fundamentals',
                    progress: 85,
                    thumbnail: 'ML'
                },
                {
                    id: 2,
                    title: 'Deep Learning with Python',
                    progress: 60,
                    thumbnail: 'DL'
                },
                {
                    id: 3,
                    title: 'AI Ethics and Society',
                    progress: 30,
                    thumbnail: 'AI'
                }
            ];
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    }

    async loadAchievements() {
        try {
            this.achievements = [
                { id: 1, title: 'First Steps', description: 'Complete first lesson', icon: '👶', unlocked: true },
                { id: 2, title: 'Quick Learner', description: 'Complete 3 courses in a week', icon: '⚡', unlocked: true },
                { id: 3, title: 'Dedicated Student', description: '7-day learning streak', icon: '🔥', unlocked: true },
                { id: 4, title: 'Knowledge Seeker', description: 'Complete 10 courses', icon: '🎓', unlocked: false },
                { id: 5, title: 'AI Expert', description: 'Master all AI courses', icon: '🤖', unlocked: false },
                { id: 6, title: 'Community Helper', description: 'Help 10 students', icon: '🤝', unlocked: false },
                { id: 7, title: 'Perfect Score', description: 'Get 100% on 5 quizzes', icon: '💯', unlocked: false },
                { id: 8, title: 'Early Bird', description: 'Study before 8 AM', icon: '🌅', unlocked: false },
                { id: 9, title: 'Night Owl', description: 'Study after 10 PM', icon: '🦉', unlocked: false },
                { id: 10, title: 'Consistent', description: '30-day learning streak', icon: '📅', unlocked: false },
                { id: 11, title: 'Mentor', description: 'Create a study guide', icon: '👨‍🏫', unlocked: false },
                { id: 12, title: 'Graduate', description: 'Complete certification', icon: '🎖️', unlocked: false }
            ];
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    }

    async loadNotes() {
        try {
            // Load notes from Firebase or localStorage
            if (window.SimpleFirebase?.isReady()) {
                const notesDoc = await db.collection('users').doc(this.user.uid).collection('notes').orderBy('createdAt', 'desc').get();
                this.notes = notesDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                // Load from localStorage
                this.notes = JSON.parse(localStorage.getItem(`targstar_notes_${this.user.uid}`) || '[]');
            }
            
            console.log('📝 Loaded', this.notes.length, 'notes');
        } catch (error) {
            console.error('Error loading notes:', error);
            this.notes = [];
        }
    }

    renderDashboard() {
        this.updateWelcomeMessage();
        this.updateStats();
        this.updateProfile();
        this.renderActivities();
        this.renderCourses();
        this.renderOrders();
        this.renderAchievements();
        this.renderNotes();
        this.initializeCharts();
    }

    updateWelcomeMessage() {
        const welcomeMsg = document.getElementById('welcome-message');
        const userName = this.userData?.displayName || this.user?.displayName || 'there';
        const hour = new Date().getHours();
        let greeting = 'Good evening';
        
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 18) greeting = 'Good afternoon';
        
        welcomeMsg.textContent = `${greeting}, ${userName}! Here's your learning progress and activity.`;
    }

    updateStats() {
        // Animate counters
        this.animateCounter('courses-completed', this.userData?.stats?.coursesCompleted || 12);
        this.animateCounter('study-hours', 156);
        this.animateCounter('achievements', this.achievements.filter(a => a.unlocked).length);
        this.animateCounter('streak-days', 7);
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const duration = 2000;
        const startTime = performance.now();
        const startValue = 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    updateProfile() {
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const userAvatar = document.getElementById('user-avatar');
        
        profileName.textContent = this.userData?.displayName || this.user?.displayName || 'User';
        profileEmail.textContent = this.user?.email || '';
        
        if (this.user?.photoURL) {
            userAvatar.src = this.user.photoURL;
        }
        
        // Update profile completion
        const completion = this.calculateProfileCompletion();
        const progressFill = document.getElementById('profile-completion');
        const progressPercent = progressFill.nextElementSibling;
        
        setTimeout(() => {
            progressFill.style.width = `${completion}%`;
            progressPercent.textContent = `${completion}%`;
        }, 500);
    }

    calculateProfileCompletion() {
        let completion = 30; // Base for having an account
        
        if (this.userData?.displayName) completion += 20;
        if (this.user?.photoURL) completion += 15;
        if (this.userData?.profile?.bio) completion += 15;
        if (this.userData?.profile?.location) completion += 10;
        if (this.userData?.profile?.website) completion += 10;
        
        return Math.min(completion, 100);
    }

    renderActivities() {
        const container = document.getElementById('activity-list');
        
        if (!container) {
            console.error('❌ Activity list container not found');
            return;
        }
        
        if (this.activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-chart-line" style="font-size: 3rem; color: #e9ecef; margin-bottom: 15px;"></i>
                        <h3 style="color: #666; margin-bottom: 10px;">No Recent Activity</h3>
                        <p style="color: #999; margin-bottom: 20px;">Start learning to see your activity here</p>
                        <button class="cta-btn" onclick="window.location.href='lessons.html'">
                            Browse Courses
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        const activitiesHTML = this.activities.map((activity, index) => `
            <div class="activity-item" data-activity-id="${activity.id}" style="animation-delay: ${index * 0.1}s">
                <div class="activity-icon ${activity.type}">
                    ${activity.icon}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">
                        <i class="fas fa-clock"></i>
                        ${activity.time}
                    </div>
                </div>
                <div class="activity-actions">
                    <button class="activity-action-btn" onclick="window.dashboardManager.viewActivityDetails('${activity.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="activity-action-btn delete" onclick="window.dashboardManager.deleteActivity('${activity.id}')" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = activitiesHTML;
        
        // Add fade-in animation
        setTimeout(() => {
            const items = container.querySelectorAll('.activity-item');
            items.forEach(item => item.classList.add('fade-in'));
        }, 100);
        
        console.log(`✅ Rendered ${this.activities.length} activities`);
    }

    // View activity details
    viewActivityDetails(activityId) {
        const activity = this.activities.find(a => a.id == activityId);
        if (!activity) return;
        
        const modal = document.createElement('div');
        modal.className = 'activity-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content activity-modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${activity.icon} ${activity.title}</h3>
                        <button class="close-btn" onclick="this.closest('.activity-modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="activity-detail-item">
                            <strong>Type:</strong> 
                            <span class="activity-type-badge ${activity.type}">${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</span>
                        </div>
                        <div class="activity-detail-item">
                            <strong>Description:</strong> ${activity.description}
                        </div>
                        <div class="activity-detail-item">
                            <strong>Time:</strong> ${activity.time}
                        </div>
                        <div class="activity-detail-item">
                            <strong>Date:</strong> ${new Date(activity.timestamp).toLocaleString()}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.activity-modal').remove()">Close</button>
                    </div>
                </div>
            </div>
            <style>
                .activity-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px);
                }
                .activity-modal-content {
                    background: white;
                    border-radius: 15px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    position: relative;
                    animation: modalSlideIn 0.3s ease-out;
                }
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: translateY(-50px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .modal-header {
                    padding: 20px 20px 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                .modal-body {
                    padding: 0 20px;
                }
                .modal-footer {
                    padding: 20px;
                    text-align: right;
                    border-top: 1px solid #eee;
                    margin-top: 20px;
                }
                .activity-detail-item {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .activity-type-badge {
                    padding: 4px 12px;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .activity-type-badge.course { background: #e3f2fd; color: #1976d2; }
                .activity-type-badge.purchase { background: #fff3e0; color: #f57c00; }
                .activity-type-badge.achievement { background: #e8f5e8; color: #388e3c; }
                .activity-type-badge.login { background: #f3e5f5; color: #7b1fa2; }
                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: #666;
                    padding: 5px;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .close-btn:hover {
                    background: #f5f5f5;
                    color: #333;
                }
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .btn-secondary:hover {
                    background: #5a6268;
                }
            </style>
        `;
        
        document.body.appendChild(modal);
    }

    // Delete activity
    deleteActivity(activityId) {
        if (!confirm('Are you sure you want to remove this activity?')) return;
        
        this.activities = this.activities.filter(a => a.id != activityId);
        this.saveActivities();
        this.renderActivities();
        
        this.showSuccess('Activity removed successfully');
    }

    renderCourses() {
        const container = document.getElementById('current-courses');
        
        if (this.courses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No courses in progress</p>
                    <a href="lessons.html" class="cta-btn">Browse Courses</a>
                </div>
            `;
            return;
        }

        const coursesHTML = this.courses.map(course => `
            <div class="course-item">
                <div class="course-thumbnail">${course.thumbnail}</div>
                <div class="course-info">
                    <div class="course-title">${course.title}</div>
                    <div class="course-progress">
                        <div class="course-progress-bar">
                            <div class="course-progress-fill" style="width: ${course.progress}%"></div>
                        </div>
                        <span class="course-percentage">${course.progress}%</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = coursesHTML;
    }

    renderOrders() {
        const container = document.getElementById('recent-orders');
        
        if (this.orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No recent orders</p>
                    <a href="products.html" class="cta-btn">Shop Now</a>
                </div>
            `;
            return;
        }

        const ordersHTML = this.orders.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <h4>Order #${order.orderNumber}</h4>
                    <p>${new Date(order.timestamp).toLocaleDateString()} • ${order.total.toFixed(2)}</p>
                </div>
                <div class="order-status ${order.status}">${order.status}</div>
            </div>
        `).join('');

        container.innerHTML = ordersHTML;
    }

    renderAchievements() {
        const container = document.getElementById('achievements-grid');
        const countElement = document.getElementById('achievement-count');
        
        const unlockedCount = this.achievements.filter(a => a.unlocked).length;
        countElement.textContent = `${unlockedCount}/${this.achievements.length}`;

        const achievementsHTML = this.achievements.map(achievement => `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `).join('');

        container.innerHTML = achievementsHTML;
    }

    renderNotes() {
        const container = document.getElementById('notes-grid');
        
        if (this.notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-sticky-note" style="font-size: 3rem; color: #e9ecef; margin-bottom: 15px;"></i>
                        <h3 style="color: #666; margin-bottom: 10px;">No notes yet</h3>
                        <p style="color: #999; margin-bottom: 20px;">Start taking notes during your learning sessions</p>
                        <button class="notes-btn" onclick="window.dashboardManager.createNewNote()">
                            <i class="fas fa-plus"></i> Create First Note
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        const notesHTML = this.notes.map(note => `
            <div class="note-card" onclick="window.dashboardManager.openNote('${note.id}')">
                <div class="note-header">
                    <h4 class="note-title">${note.title || 'Untitled Note'}</h4>
                    <div class="note-actions">
                        <button class="note-action-btn favorite ${note.favorite ? 'active' : ''}" 
                                onclick="event.stopPropagation(); window.dashboardManager.toggleNoteFavorite('${note.id}')">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="note-action-btn delete" 
                                onclick="event.stopPropagation(); window.dashboardManager.deleteNote('${note.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-preview">${this.getPreviewText(note.content)}</div>
                <div class="note-meta">
                    <div class="note-date">
                        <i class="fas fa-clock"></i>
                        ${this.formatDate(note.updatedAt || note.createdAt)}
                    </div>
                    <div class="note-tags">
                        ${note.tags ? note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = notesHTML;
    }

    getPreviewText(content) {
        if (!content) return 'No content';
        
        // Remove HTML tags and get first 150 characters
        const text = content.replace(/<[^>]*>/g, '').trim();
        return text.length > 150 ? text.substring(0, 150) + '...' : text;
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        
        return date.toLocaleDateString();
    }

    initializeCharts() {
        this.initializeProgressChart();
        this.initializeAnalyticsChart();
    }

    initializeProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        this.charts.progress = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Not Started'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: [
                        '#00b894',
                        '#FFD700',
                        '#e9ecef'
                    ],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    initializeAnalyticsChart() {
        const ctx = document.getElementById('analyticsChart');
        if (!ctx) {
            console.error('❌ Analytics chart canvas not found');
            return;
        }

        console.log('📊 Initializing Learning Analytics chart...');

        // Generate realistic learning data based on user activities
        this.analyticsData = this.generateAnalyticsData();

        this.charts.analytics = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.analyticsData.week.labels,
                datasets: [{
                    label: 'Study Hours',
                    data: this.analyticsData.week.studyHours,
                    borderColor: '#FFD700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FFD700',
                    pointBorderColor: '#FFA500',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }, {
                    label: 'Courses Completed',
                    data: this.analyticsData.week.coursesCompleted,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#764ba2',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#FFD700',
                        bodyColor: '#ffffff',
                        borderColor: '#FFD700',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                return `📅 ${context[0].label}`;
                            },
                            label: function(context) {
                                const label = context.dataset.label;
                                const value = context.parsed.y;
                                if (label === 'Study Hours') {
                                    return `⏱️ ${label}: ${value} hours`;
                                } else {
                                    return `📚 ${label}: ${value} courses`;
                                }
                            },
                            afterBody: function(context) {
                                const totalHours = context.reduce((sum, item) => {
                                    return item.dataset.label === 'Study Hours' ? sum + item.parsed.y : sum;
                                }, 0);
                                return totalHours > 0 ? [`💡 Keep up the great work!`] : [];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            color: '#666'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11,
                                weight: '600'
                            },
                            color: '#333'
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });

        // Enhanced chart period buttons with analytics
        this.setupAnalyticsControls();
        
        // Add analytics summary
        this.renderAnalyticsSummary();
        
        console.log('✅ Learning Analytics chart initialized');
    }

    generateAnalyticsData() {
        // Generate realistic learning analytics data
        const currentDate = new Date();
        
        // Week data (last 7 days)
        const weekData = {
            labels: [],
            studyHours: [],
            coursesCompleted: []
        };
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            weekData.labels.push(date.toLocaleDateString('en', { weekday: 'short' }));
            
            // Generate realistic study hours (0-8 hours per day)
            const studyHours = Math.floor(Math.random() * 6) + (i < 2 ? 2 : 0); // More recent days have more activity
            weekData.studyHours.push(studyHours);
            
            // Generate course completions (0-3 per day)
            const coursesCompleted = studyHours > 4 ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2);
            weekData.coursesCompleted.push(coursesCompleted);
        }
        
        // Month data (last 4 weeks)
        const monthData = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            studyHours: [28, 35, 22, 42],
            coursesCompleted: [8, 12, 6, 15]
        };
        
        // Year data (last 12 months)
        const yearData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            studyHours: [45, 52, 38, 65, 72, 58, 80, 75, 68, 85, 92, 78],
            coursesCompleted: [12, 15, 10, 18, 22, 16, 25, 20, 18, 28, 30, 24]
        };
        
        return {
            week: weekData,
            month: monthData,
            year: yearData
        };
    }

    setupAnalyticsControls() {
        // Enhanced chart period buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            if (!btn.hasAttribute('data-analytics-setup')) {
                btn.setAttribute('data-analytics-setup', 'true');
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    const period = btn.dataset.period;
                    this.updateAnalyticsChart(period);
                });
            }
        });
        
        // Add analytics export button
        this.addAnalyticsExportButton();
    }

    updateAnalyticsChart(period) {
        if (!this.charts.analytics || !this.analyticsData[period]) return;
        
        console.log(`📊 Updating analytics chart for period: ${period}`);
        
        const data = this.analyticsData[period];
        
        // Update chart data with animation
        this.charts.analytics.data.labels = data.labels;
        this.charts.analytics.data.datasets[0].data = data.studyHours;
        this.charts.analytics.data.datasets[1].data = data.coursesCompleted;
        
        // Update chart title based on period
        const titles = {
            week: 'This Week\'s Learning Progress',
            month: 'Monthly Learning Overview',
            year: 'Yearly Learning Journey'
        };
        
        // Update analytics summary
        this.updateAnalyticsSummary(period, data);
        
        // Animate chart update
        this.charts.analytics.update('active');
        
        console.log(`✅ Analytics updated for ${period}`);
    }

    renderAnalyticsSummary() {
        // Add analytics summary below the chart
        const chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) return;
        
        let summaryContainer = chartContainer.querySelector('.analytics-summary');
        if (!summaryContainer) {
            summaryContainer = document.createElement('div');
            summaryContainer.className = 'analytics-summary';
            chartContainer.appendChild(summaryContainer);
        }
        
        this.updateAnalyticsSummary('week', this.analyticsData.week);
    }

    updateAnalyticsSummary(period, data) {
        const summaryContainer = document.querySelector('.analytics-summary');
        if (!summaryContainer) return;
        
        // Calculate totals
        const totalStudyHours = data.studyHours.reduce((sum, hours) => sum + hours, 0);
        const totalCoursesCompleted = data.coursesCompleted.reduce((sum, courses) => sum + courses, 0);
        const averageStudyHours = (totalStudyHours / data.studyHours.length).toFixed(1);
        
        // Calculate trends
        const recentHours = data.studyHours.slice(-3).reduce((sum, hours) => sum + hours, 0);
        const previousHours = data.studyHours.slice(0, 3).reduce((sum, hours) => sum + hours, 0);
        const trend = recentHours > previousHours ? 'up' : recentHours < previousHours ? 'down' : 'stable';
        
        const periodLabels = {
            week: 'This Week',
            month: 'This Month', 
            year: 'This Year'
        };
        
        summaryContainer.innerHTML = `
            <div class="analytics-summary-content">
                <h4>📈 ${periodLabels[period]} Summary</h4>
                <div class="analytics-stats">
                    <div class="analytics-stat-item">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-info">
                            <div class="stat-value">${totalStudyHours}h</div>
                            <div class="stat-label">Total Study Time</div>
                        </div>
                    </div>
                    <div class="analytics-stat-item">
                        <div class="stat-icon">📚</div>
                        <div class="stat-info">
                            <div class="stat-value">${totalCoursesCompleted}</div>
                            <div class="stat-label">Courses Completed</div>
                        </div>
                    </div>
                    <div class="analytics-stat-item">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <div class="stat-value">${averageStudyHours}h</div>
                            <div class="stat-label">Daily Average</div>
                        </div>
                    </div>
                    <div class="analytics-stat-item trend-${trend}">
                        <div class="stat-icon">${trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'}</div>
                        <div class="stat-info">
                            <div class="stat-value">${trend === 'up' ? '+' : trend === 'down' ? '-' : ''}${Math.abs(recentHours - previousHours)}h</div>
                            <div class="stat-label">Trend</div>
                        </div>
                    </div>
                </div>
                <div class="analytics-insights">
                    ${this.generateInsights(period, totalStudyHours, totalCoursesCompleted, trend)}
                </div>
            </div>
        `;
    }

    generateInsights(period, totalHours, totalCourses, trend) {
        const insights = [];
        
        if (period === 'week') {
            if (totalHours >= 20) {
                insights.push('🎉 Excellent! You\'re exceeding your weekly study goals.');
            } else if (totalHours >= 10) {
                insights.push('👍 Good progress! Keep up the consistent learning.');
            } else {
                insights.push('💪 Try to increase your study time for better progress.');
            }
            
            if (totalCourses >= 5) {
                insights.push('🏆 Amazing course completion rate this week!');
            }
        }
        
        if (trend === 'up') {
            insights.push('📈 Your learning activity is trending upward - great momentum!');
        } else if (trend === 'down') {
            insights.push('📉 Consider setting aside more time for learning this week.');
        }
        
        if (insights.length === 0) {
            insights.push('📚 Keep learning consistently to see your progress grow!');
        }
        
        return insights.map(insight => `<div class="insight-item">${insight}</div>`).join('');
    }

    addAnalyticsExportButton() {
        const chartHeader = document.querySelector('.analytics-card .card-header');
        if (!chartHeader || chartHeader.querySelector('.export-btn')) return;
        
        const exportBtn = document.createElement('button');
        exportBtn.className = 'export-btn';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Export';
        exportBtn.title = 'Export Analytics Data';
        exportBtn.addEventListener('click', () => this.exportAnalyticsData());
        
        chartHeader.appendChild(exportBtn);
    }

    exportAnalyticsData() {
        const data = {
            exportDate: new Date().toISOString(),
            user: this.user?.email || 'demo-user',
            analytics: this.analyticsData
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `learning-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('📊 Analytics data exported successfully!');
        this.addActivity('achievement', 'Exported Learning Analytics', 'Downloaded comprehensive learning data and insights', '📊');
    }

    setupEventListeners() {
        // Profile edit button
        document.querySelector('.edit-profile-btn').addEventListener('click', () => {
            this.openProfileModal();
        });

        // Activity filter
        document.getElementById('activity-filter').addEventListener('change', (e) => {
            this.filterActivities(e.target.value);
        });

        // Profile modal
        this.setupProfileModal();
    }

    openProfileModal() {
        const modal = document.getElementById('profile-modal');
        modal.style.display = 'block';
        
        // Populate form with current data
        document.getElementById('display-name').value = this.userData?.displayName || '';
        document.getElementById('bio').value = this.userData?.profile?.bio || '';
        document.getElementById('location').value = this.userData?.profile?.location || '';
        document.getElementById('website').value = this.userData?.profile?.website || '';
        
        // Set preferences
        document.getElementById('email-notifications').checked = this.userData?.preferences?.notifications !== false;
        document.getElementById('course-reminders').checked = this.userData?.preferences?.courseReminders !== false;
        document.getElementById('marketing-emails').checked = this.userData?.preferences?.marketing !== false;
    }

    setupProfileModal() {
        const modal = document.getElementById('profile-modal');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const form = document.getElementById('profile-form');

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveProfile();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    async saveProfile() {
        try {
            const formData = {
                displayName: document.getElementById('display-name').value,
                profile: {
                    bio: document.getElementById('bio').value,
                    location: document.getElementById('location').value,
                    website: document.getElementById('website').value
                },
                preferences: {
                    notifications: document.getElementById('email-notifications').checked,
                    courseReminders: document.getElementById('course-reminders').checked,
                    marketing: document.getElementById('marketing-emails').checked
                }
            };

            // Update Firebase
            await db.collection('users').doc(this.user.uid).update(formData);
            
            // Update local data
            this.userData = { ...this.userData, ...formData };
            
            // Update display
            this.updateProfile();
            
            // Close modal
            document.getElementById('profile-modal').style.display = 'none';
            
            // Show success message
            this.showSuccess('Profile updated successfully!');
            
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showError('Failed to save profile');
        }
    }

    filterActivities(filter) {
        console.log(`🔍 Filtering activities by: ${filter}`);
        
        const filteredActivities = filter === 'all' 
            ? this.activities 
            : this.activities.filter(activity => activity.type === filter);
        
        const container = document.getElementById('activity-list');
        
        if (filteredActivities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-filter" style="font-size: 3rem; color: #e9ecef; margin-bottom: 15px;"></i>
                        <h3 style="color: #666; margin-bottom: 10px;">No ${filter === 'all' ? '' : filter} activities found</h3>
                        <p style="color: #999; margin-bottom: 20px;">Try a different filter or start learning</p>
                        <button class="cta-btn" onclick="document.getElementById('activity-filter').value='all'; window.dashboardManager.filterActivities('all')">
                            Show All Activities
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        const activitiesHTML = filteredActivities.map((activity, index) => `
            <div class="activity-item" data-activity-id="${activity.id}" style="animation-delay: ${index * 0.1}s">
                <div class="activity-icon ${activity.type}">
                    ${activity.icon}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">
                        <i class="fas fa-clock"></i>
                        ${activity.time}
                    </div>
                </div>
                <div class="activity-actions">
                    <button class="activity-action-btn" onclick="window.dashboardManager.viewActivityDetails('${activity.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="activity-action-btn delete" onclick="window.dashboardManager.deleteActivity('${activity.id}')" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = activitiesHTML;
        
        // Add fade-in animation
        setTimeout(() => {
            const items = container.querySelectorAll('.activity-item');
            items.forEach(item => item.classList.add('fade-in'));
        }, 100);
        
        console.log(`✅ Filtered to ${filteredActivities.length} activities`);
    }

    // Auto-activation methods with progress tracking
    async autoActivateDashboardWithProgress() {
        console.log('🚀 Auto-activating dashboard features with progress...');
        
        try {
            // Step 2: Request media permissions
            this.updateLoadingProgress(2, 'active', '🎥 Requesting camera and microphone permissions...');
            await this.delay(300); // Brief delay to show the step
            const permissionsGranted = await this.requestMediaPermissions();
            this.updateLoadingProgress(2, 'completed');
            await this.delay(400); // Brief pause after completion
            
            // Step 3: Activate audio system
            this.updateLoadingProgress(3, 'active', '🎤 Initializing audio system and microphone...');
            await this.delay(1000); // Realistic audio setup time
            this.updateLoadingProgress(3, 'completed');
            await this.delay(300);
            
            // Step 4: Start live session
            this.updateLoadingProgress(4, 'active', '📹 Starting live video session...');
            if (permissionsGranted) {
                await this.autoStartLiveSession();
                await this.delay(800); // Time for video to initialize
            } else {
                await this.delay(600); // Brief delay for consistency
            }
            this.updateLoadingProgress(4, 'completed');
            await this.delay(300);
            
            // Step 5: Prepare notes
            this.updateLoadingProgress(5, 'active', '📝 Setting up notes editor and templates...');
            await this.delay(400);
            this.prepareNotesForSession();
            await this.delay(700);
            this.updateLoadingProgress(5, 'completed');
            await this.delay(300);
            
            // Show activation success with enhanced message
            this.showActivationSuccess();
            
        } catch (error) {
            console.error('❌ Auto-activation failed:', error);
            this.showActivationError(error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async autoActivateDashboard() {
        console.log('🚀 Auto-activating dashboard features...');
        
        try {
            // 1. Auto-request camera and microphone permissions
            await this.requestMediaPermissions();
            
            // 2. Auto-start live session if permissions granted
            await this.autoStartLiveSession();
            
            // 3. Initialize notes for immediate use
            this.prepareNotesForSession();
            
            // 4. Show activation success
            this.showActivationSuccess();
            
        } catch (error) {
            console.error('❌ Auto-activation failed:', error);
            this.showActivationError(error);
        }
    }

    async requestMediaPermissions() {
        console.log('🎥 Requesting camera and microphone permissions...');
        
        try {
            // Request permissions without starting stream yet
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            // Store stream for later use
            this.mediaStream = stream;
            
            // Update UI to show permissions granted
            this.updatePermissionStatus(true);
            
            console.log('✅ Media permissions granted');
            return true;
            
        } catch (error) {
            console.error('❌ Media permissions denied:', error);
            this.updatePermissionStatus(false, error.message);
            return false;
        }
    }

    async autoStartLiveSession() {
        if (!this.mediaStream) {
            console.log('⚠️ No media stream available, skipping auto-start');
            return;
        }
        
        console.log('🎬 Auto-starting live session...');
        
        try {
            // Set up learner video with the existing stream
            const learnerVideo = document.getElementById('learner-video');
            if (learnerVideo) {
                learnerVideo.srcObject = this.mediaStream;
                learnerVideo.play();
            }
            
            // Simulate instructor video
            this.simulateInstructorVideo();
            
            // Update UI for active session
            const startBtn = document.getElementById('start-session-btn');
            const endBtn = document.getElementById('end-session-btn');
            const sessionInfo = document.getElementById('session-info');
            
            if (startBtn) startBtn.style.display = 'none';
            if (endBtn) endBtn.style.display = 'flex';
            if (sessionInfo) sessionInfo.style.display = 'flex';
            
            // Start session timer
            this.startSessionTimer();
            
            // Update current session info
            this.updateCurrentSessionInfo();
            
            // Initialize notes for this session
            this.initializeSessionNotes();
            
            // Update UI for live session
            this.updateNotesUIForSession();
            
            // Set session data
            this.liveSession = {
                startTime: new Date(),
                stream: this.mediaStream,
                active: true,
                sessionId: 'session-' + Date.now(),
                topic: 'Auto-Started Learning Session',
                autoStarted: true
            };
            
            console.log('✅ Live session auto-started successfully');
            
        } catch (error) {
            console.error('❌ Failed to auto-start live session:', error);
            throw error;
        }
    }

    prepareNotesForSession() {
        console.log('📝 Preparing notes for immediate use...');
        
        const editor = document.getElementById('notes-editor');
        if (!editor) return;
        
        // Create welcome session header
        const welcomeHeader = `
            <div style="background: linear-gradient(45deg, #28a745, #20c997); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
                <h3 style="margin: 0; font-size: 1.2rem;">🎉 Welcome to Your Learning Session!</h3>
                <p style="margin: 8px 0 0 0; font-size: 0.95rem; opacity: 0.9;">Dashboard activated at ${new Date().toLocaleTimeString()}</p>
                <p style="margin: 5px 0 0 0; font-size: 0.85rem; opacity: 0.8;">Camera, audio, and video are ready. Start taking notes!</p>
            </div>
            <div><strong>📚 Session Notes:</strong></div>
            <div><br></div>
        `;
        
        editor.innerHTML = welcomeHeader;
        this.currentNote = welcomeHeader;
        this.updateWordCount();
        
        // Update status
        const statusElement = document.getElementById('auto-save-status');
        if (statusElement) {
            statusElement.innerHTML = '<span style="color: #28a745;">● READY</span> Auto-save active';
        }
    }

    updatePermissionStatus(granted, errorMessage = '') {
        // Update permission indicators in the UI
        const permissionIndicator = document.getElementById('permission-status');
        if (permissionIndicator) {
            if (granted) {
                permissionIndicator.innerHTML = `
                    <span style="color: #28a745;">
                        <i class="fas fa-check-circle"></i> Camera & Audio Ready
                    </span>
                `;
            } else {
                permissionIndicator.innerHTML = `
                    <span style="color: #dc3545;">
                        <i class="fas fa-exclamation-triangle"></i> Permissions Required
                    </span>
                `;
            }
        }
    }

    showActivationSuccess() {
        // Show enhanced success notification with more details
        const permissionStatus = this.mediaStream ? 'with full camera and audio access' : 'with limited access';
        this.showSuccess(`🎉 Dashboard fully activated ${permissionStatus}! All learning features are ready to use.`);
        
        // Add activation badge to profile
        this.addActivationBadge();
        
        // Update online status indicator
        this.updateOnlineStatusIndicator(true);
        
        // Add completion celebration effect
        this.showCompletionCelebration();
    }

    showCompletionCelebration() {
        // Create a brief celebration overlay
        const celebration = document.createElement('div');
        celebration.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(45deg, #28a745, #20c997);
                color: white;
                padding: 20px 30px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3);
                z-index: 10001;
                text-align: center;
                animation: celebrationPop 2s ease-out;
                pointer-events: none;
            ">
                <div style="font-size: 2rem; margin-bottom: 10px;">🎉</div>
                <div style="font-weight: 600; font-size: 1.1rem;">Dashboard Active!</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">Ready for learning</div>
            </div>
            <style>
                @keyframes celebrationPop {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    40% { transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
                }
            </style>
        `;
        
        document.body.appendChild(celebration);
        
        // Remove after animation
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.remove();
            }
        }, 2000);
    }

    showActivationError(error) {
        let message = 'Dashboard partially activated. ';
        
        if (error.name === 'NotAllowedError') {
            message += 'Camera/microphone access was denied. You can still use notes and other features.';
        } else if (error.name === 'NotFoundError') {
            message += 'No camera or microphone found. You can still use notes and other features.';
        } else {
            message += 'Some features may not be available.';
        }
        
        this.showError(message);
        this.updateOnlineStatusIndicator(true, 'limited');
    }

    addActivationBadge() {
        const badgesContainer = document.querySelector('.profile-badges');
        if (badgesContainer) {
            // Remove any existing activation badge
            const existingBadge = badgesContainer.querySelector('.activation-badge');
            if (existingBadge) existingBadge.remove();
            
            // Add new activation badge
            const activationBadge = document.createElement('span');
            activationBadge.className = 'badge activation-badge';
            activationBadge.innerHTML = '🟢 Active Now';
            activationBadge.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            activationBadge.style.color = 'white';
            activationBadge.style.animation = 'pulse 2s infinite';
            
            badgesContainer.appendChild(activationBadge);
        }
    }

    updateOnlineStatusIndicator(isOnline, status = 'full') {
        // Update the main status indicator
        let statusHTML = '';
        
        if (isOnline) {
            if (status === 'full') {
                statusHTML = `
                    <div style="display: flex; align-items: center; gap: 8px; color: #28a745; font-weight: 600;">
                        <span class="status-dot" style="width: 10px; height: 10px; background: #28a745; border-radius: 50%; animation: pulse 2s infinite;"></span>
                        Online & Active
                    </div>
                `;
            } else {
                statusHTML = `
                    <div style="display: flex; align-items: center; gap: 8px; color: #ffc107; font-weight: 600;">
                        <span class="status-dot" style="width: 10px; height: 10px; background: #ffc107; border-radius: 50%; animation: pulse 2s infinite;"></span>
                        Online (Limited)
                    </div>
                `;
            }
        } else {
            statusHTML = `
                <div style="display: flex; align-items: center; gap: 8px; color: #6c757d; font-weight: 600;">
                    <span class="status-dot" style="width: 10px; height: 10px; background: #6c757d; border-radius: 50%;"></span>
                    Offline
                </div>
            `;
        }
        
        // Update status in profile section
        const profileDetails = document.querySelector('.profile-details');
        if (profileDetails) {
            let statusElement = profileDetails.querySelector('.online-status');
            if (!statusElement) {
                statusElement = document.createElement('div');
                statusElement.className = 'online-status';
                statusElement.style.marginTop = '10px';
                profileDetails.appendChild(statusElement);
            }
            statusElement.innerHTML = statusHTML;
        }
    }

    setUserOnlineStatus(isOnline) {
        // Update user's online status in Firebase (if available)
        if (window.SimpleFirebase?.isReady() && this.user) {
            try {
                db.collection('users').doc(this.user.uid).update({
                    isOnline: isOnline,
                    lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
                    dashboardActive: isOnline
                });
                console.log('✅ User online status updated in Firebase');
            } catch (error) {
                console.error('❌ Failed to update online status:', error);
            }
        }
        
        // Update local status
        this.userOnlineStatus = isOnline;
        this.updateOnlineStatusIndicator(isOnline);
    }

    showLoadingState() {
        // Show enhanced loading overlay with progress steps
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'dashboard-loading';
        loadingOverlay.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.95); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                <div style="text-align: center; padding: 50px 40px; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 500px; width: 90%;">
                    <!-- Main Loading Spinner -->
                    <div style="width: 80px; height: 80px; border: 4px solid #f3f3f3; border-top: 4px solid #FFD700; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 30px;"></div>
                    
                    <!-- Main Title -->
                    <h2 style="color: #333; margin-bottom: 15px; font-size: 1.8rem; font-weight: 700;">
                        🚀 Activating Dashboard
                    </h2>
                    
                    <!-- Current Step Display -->
                    <div id="loading-step" style="color: #667eea; margin-bottom: 25px; font-size: 1.1rem; font-weight: 600; min-height: 30px;">
                        Initializing system...
                    </div>
                    
                    <!-- Progress Steps List -->
                    <div style="text-align: left; background: #f8f9fa; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
                        <h4 style="color: #333; margin-bottom: 15px; text-align: center; font-size: 1rem;">
                            📋 Activation Progress
                        </h4>
                        <div class="progress-steps">
                            <div id="step-1" class="progress-step pending">
                                <span class="step-icon">⏳</span>
                                <span class="step-text">Loading user profile</span>
                            </div>
                            <div id="step-2" class="progress-step pending">
                                <span class="step-icon">⏳</span>
                                <span class="step-text">Setting up dashboard interface</span>
                            </div>
                            <div id="step-3" class="progress-step pending">
                                <span class="step-icon">⏳</span>
                                <span class="step-text">Preparing learning systems</span>
                            </div>
                            <div id="step-4" class="progress-step pending">
                                <span class="step-icon">⏳</span>
                                <span class="step-text">Setting up notes system</span>
                            </div>
                            <div id="step-5" class="progress-step pending">
                                <span class="step-icon">⏳</span>
                                <span class="step-text">Activating dashboard sections</span>
                            </div>
                            <div id="step-6" class="progress-step pending">
                                <span class="step-icon">⏳</span>
                                <span class="step-text">Setting online status</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tips Section -->
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 15px; border-radius: 10px; border-left: 4px solid #FFD700;">
                        <p style="color: #666; margin: 0; font-size: 0.9rem; line-height: 1.5;">
                            💡 <strong>Tip:</strong> Click "Start Session" when ready to begin live learning with camera and audio
                        </p>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .progress-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .progress-step {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                }
                
                .progress-step.pending {
                    background: rgba(108, 117, 125, 0.1);
                    color: #6c757d;
                }
                
                .progress-step.active {
                    background: rgba(255, 215, 0, 0.2);
                    color: #333;
                    font-weight: 600;
                    transform: translateX(5px);
                }
                
                .progress-step.completed {
                    background: rgba(40, 167, 69, 0.1);
                    color: #28a745;
                    font-weight: 500;
                }
                
                .progress-step.error {
                    background: rgba(220, 53, 69, 0.1);
                    color: #dc3545;
                    font-weight: 500;
                }
                
                .step-icon {
                    font-size: 1rem;
                    width: 20px;
                    text-align: center;
                }
                
                .step-text {
                    flex: 1;
                }
                
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.6; }
                    100% { opacity: 1; }
                }
                
                .progress-step.active .step-icon {
                    animation: pulse 1.5s infinite;
                }
            </style>
        `;
        document.body.appendChild(loadingOverlay);
        
        // Store reference for progress updates
        this.loadingOverlay = loadingOverlay;
    }

    updateLoadingProgress(stepNumber, status, message) {
        const stepElement = document.getElementById(`step-${stepNumber}`);
        const loadingStepDisplay = document.getElementById('loading-step');
        
        if (stepElement) {
            // Remove all status classes
            stepElement.classList.remove('pending', 'active', 'completed', 'error');
            
            // Add new status with animation
            stepElement.classList.add(status);
            
            // Update icon based on status
            const iconElement = stepElement.querySelector('.step-icon');
            if (iconElement) {
                switch (status) {
                    case 'active':
                        iconElement.textContent = '🔄';
                        // Add subtle shake animation for active steps
                        stepElement.style.animation = 'stepActive 0.5s ease-out';
                        break;
                    case 'completed':
                        iconElement.textContent = '✅';
                        // Add completion bounce animation
                        stepElement.style.animation = 'stepCompleted 0.6s ease-out';
                        // Brief success sound effect (visual)
                        this.showStepCompletionEffect(stepElement);
                        break;
                    case 'error':
                        iconElement.textContent = '❌';
                        stepElement.classList.add('error');
                        stepElement.style.animation = 'stepError 0.5s ease-out';
                        break;
                    default:
                        iconElement.textContent = '⏳';
                        stepElement.style.animation = '';
                }
            }
        }
        
        // Update main step display with enhanced formatting
        if (loadingStepDisplay && message) {
            loadingStepDisplay.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <span style="font-size: 1.2rem;">${status === 'active' ? '🔄' : status === 'completed' ? '✅' : '⏳'}</span>
                    <span>${message}</span>
                </div>
            `;
        }
    }

    showStepCompletionEffect(stepElement) {
        // Create a brief green glow effect
        const originalBoxShadow = stepElement.style.boxShadow;
        stepElement.style.boxShadow = '0 0 15px rgba(40, 167, 69, 0.5)';
        stepElement.style.transition = 'box-shadow 0.3s ease';
        
        setTimeout(() => {
            stepElement.style.boxShadow = originalBoxShadow;
        }, 800);
    }

    hideLoadingState() {
        const loadingOverlay = document.getElementById('dashboard-loading');
        if (loadingOverlay) {
            // Add fade out animation
            loadingOverlay.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                if (loadingOverlay.parentNode) {
                    loadingOverlay.remove();
                }
            }, 500);
        }
        this.loadingOverlay = null;
    }

    // Dashboard Section Management
    initializeDashboardSections() {
        try {
            console.log('🎛️ Initializing dashboard sections...');
            
            // Make all sections visible and interactive
            this.dashboardActive = true;
            console.log('✅ Dashboard marked as active');
            
            // Setup section navigation
            console.log('🔗 Setting up section navigation...');
            this.setupSectionNavigation();
            console.log('✅ Section navigation setup complete');
            
            // Initialize all interactive elements
            console.log('🎯 Initializing interactive elements...');
            this.initializeInteractiveElements();
            console.log('✅ Interactive elements initialized');
            
            // Show default section (overview)
            console.log('📱 Showing default section...');
            this.showSection('overview');
            console.log('✅ Default section displayed');
            
            console.log('🎉 Dashboard sections initialization complete!');
        } catch (error) {
            console.error('❌ Error initializing dashboard sections:', error);
            // Set basic active state even if detailed setup fails
            this.dashboardActive = true;
            document.body.classList.add('dashboard-active');
        }
    }

    setupSectionNavigation() {
        try {
            console.log('🔗 Setting up section navigation...');
            // Add click handlers for all navigation elements
            const navItems = document.querySelectorAll('.nav-menu a, .action-btn, .view-all-btn');
            console.log(`📊 Found ${navItems.length} navigation items`);
            
            navItems.forEach((item, index) => {
                try {
                    if (!item.hasAttribute('data-nav-setup')) {
                        item.setAttribute('data-nav-setup', 'true');
                        item.addEventListener('click', (e) => {
                            const href = item.getAttribute('href');
                            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                                // Allow normal navigation for external links
                                return;
                            }
                            // Handle internal dashboard navigation
                            this.handleNavigation(e, item);
                        });
                        console.log(`✅ Setup navigation for item ${index + 1}`);
                    }
                } catch (itemError) {
                    console.error(`❌ Error setting up navigation item ${index}:`, itemError);
                }
            });
            console.log('✅ Section navigation setup complete');
        } catch (error) {
            console.error('❌ Error in setupSectionNavigation:', error);
        }
    }

    handleNavigation(e, element) {
        const href = element.getAttribute('href');
        const onclick = element.getAttribute('onclick');
        
        // Handle different types of navigation
        if (href === 'lessons.html' || element.textContent.includes('Browse Courses')) {
            // Don't prevent - allow normal navigation
            return;
        }
        
        if (href === 'cart.html' || element.textContent.includes('View Cart')) {
            // Don't prevent - allow normal navigation
            return;
        }
        
        if (href === 'orders.html' || element.textContent.includes('Order History')) {
            // Don't prevent - allow normal navigation
            return;
        }
        
        // For dashboard-specific actions, handle them here
        if (onclick || element.classList.contains('action-btn')) {
            // Let the onclick handler run
            return;
        }
    }

    initializeInteractiveElements() {
        try {
            console.log('🔧 Setting up interactive elements...');
            
            // Profile edit button
            try {
                const editProfileBtn = document.querySelector('.edit-profile-btn');
                if (editProfileBtn && !editProfileBtn.hasAttribute('data-setup')) {
                    editProfileBtn.setAttribute('data-setup', 'true');
                    editProfileBtn.addEventListener('click', () => this.openProfileModal());
                    console.log('✅ Profile edit button setup');
                } else if (!editProfileBtn) {
                    console.log('⚠️ Profile edit button not found');
                }
            } catch (error) {
                console.error('❌ Error setting up profile edit button:', error);
            }
            
            // Activity filter
            try {
                const activityFilter = document.getElementById('activity-filter');
                if (activityFilter && !activityFilter.hasAttribute('data-setup')) {
                    activityFilter.setAttribute('data-setup', 'true');
                    activityFilter.addEventListener('change', (e) => this.filterActivities(e.target.value));
                    console.log('✅ Activity filter setup');
                } else if (!activityFilter) {
                    console.log('⚠️ Activity filter not found');
                }
            } catch (error) {
                console.error('❌ Error setting up activity filter:', error);
            }
            
            // Chart controls
            try {
                const chartBtns = document.querySelectorAll('.chart-btn');
                console.log(`📊 Found ${chartBtns.length} chart buttons`);
                chartBtns.forEach((btn, index) => {
                    try {
                        if (!btn.hasAttribute('data-setup')) {
                            btn.setAttribute('data-setup', 'true');
                            btn.addEventListener('click', () => {
                                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                                btn.classList.add('active');
                                
                                const period = btn.dataset.period;
                                if (this.charts && this.charts.analytics) {
                                    const data = this.getChartData();
                                    this.charts.analytics.data.labels = data[period].labels;
                                    this.charts.analytics.data.datasets[0].data = data[period].data;
                                    this.charts.analytics.update();
                                }
                            });
                            console.log(`✅ Chart button ${index + 1} setup`);
                        }
                    } catch (btnError) {
                        console.error(`❌ Error setting up chart button ${index}:`, btnError);
                    }
                });
            } catch (error) {
                console.error('❌ Error setting up chart controls:', error);
            }
            
            // Live session controls (but don't auto-start)
            try {
                console.log('🎥 Setting up live session controls...');
                this.setupLiveSessionControls();
                console.log('✅ Live session controls setup');
            } catch (error) {
                console.error('❌ Error setting up live session controls:', error);
            }
            
            // Notes controls
            try {
                console.log('📝 Setting up notes controls...');
                this.setupNotesControls();
                console.log('✅ Notes controls setup');
            } catch (error) {
                console.error('❌ Error setting up notes controls:', error);
            }
            
            console.log('🎉 Interactive elements initialization complete!');
        } catch (error) {
            console.error('❌ Error in initializeInteractiveElements:', error);
        }
    }

    setupNotesControls() {
        const newNoteBtn = document.getElementById('new-note-btn');
        const saveNotesBtn = document.getElementById('save-notes-btn');
        const viewAllNotesBtn = document.getElementById('view-all-notes-btn');
        
        if (newNoteBtn && !newNoteBtn.hasAttribute('data-setup')) {
            newNoteBtn.setAttribute('data-setup', 'true');
            newNoteBtn.addEventListener('click', () => this.createNewNote());
        }
        
        if (saveNotesBtn && !saveNotesBtn.hasAttribute('data-setup')) {
            saveNotesBtn.setAttribute('data-setup', 'true');
            saveNotesBtn.addEventListener('click', () => this.saveCurrentNote());
        }
        
        if (viewAllNotesBtn && !viewAllNotesBtn.hasAttribute('data-setup')) {
            viewAllNotesBtn.setAttribute('data-setup', 'true');
            viewAllNotesBtn.addEventListener('click', () => this.showAllNotes());
        }
    }

    activateAllSections() {
        console.log('🎯 Activating all dashboard sections...');
        
        // Remove any hidden states from sections
        const sections = document.querySelectorAll('.dashboard-card');
        sections.forEach(section => {
            section.style.display = 'block';
            section.style.visibility = 'visible';
            section.style.opacity = '1';
        });
        
        // Ensure all interactive elements are enabled
        const buttons = document.querySelectorAll('button, .action-btn, .view-all-btn');
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.style.pointerEvents = 'auto';
        });
        
        // Mark dashboard as fully active
        this.dashboardActive = true;
        document.body.classList.add('dashboard-active');
    }

    showSection(sectionName) {
        console.log(`📱 Showing section: ${sectionName}`);
        // For now, just ensure all sections are visible
        // This can be expanded for section-specific navigation
    }

    showDashboardReady() {
        // Show success message without auto-starting camera
        this.showSuccess('🎉 Dashboard is ready! All sections are active. Click "Start Session" to begin live learning.');
        
        // Add ready badge to profile
        this.addReadyBadge();
        
        // Update online status
        this.updateOnlineStatusIndicator(true);
        
        // Add dashboard activation activity
        this.addActivity('login', 'Dashboard Activated', 'Successfully logged in and activated all dashboard features', '🚀');
    }

    addReadyBadge() {
        const badgesContainer = document.querySelector('.profile-badges');
        if (badgesContainer) {
            // Remove any existing ready badge
            const existingBadge = badgesContainer.querySelector('.ready-badge');
            if (existingBadge) existingBadge.remove();
            
            // Add new ready badge
            const readyBadge = document.createElement('span');
            readyBadge.className = 'badge ready-badge';
            readyBadge.innerHTML = '✅ Ready';
            readyBadge.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            readyBadge.style.color = 'white';
            
            badgesContainer.appendChild(readyBadge);
        }
    }

    getChartData() {
        return {
            week: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                data: [2, 3, 1, 4, 2, 5, 3]
            },
            month: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                data: [15, 22, 18, 25]
            },
            year: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                data: [45, 52, 38, 65, 72, 58, 80, 75, 68, 85, 92, 78]
            }
        };
    }

    async activateDemoUserDashboard() {
        // Step 1: Load user data
        this.updateLoadingProgress(1, 'active', '👤 Loading demo user profile...');
        this.loadUserData();
        this.updateLoadingProgress(1, 'completed');
        
        // Step 2: Setup dashboard (NO AUTO PERMISSIONS)
        this.updateLoadingProgress(2, 'active', '🎛️ Setting up dashboard interface...');
        try {
            console.log('🔧 Starting demo dashboard interface setup...');
            
            this.renderDashboard();
            console.log('✅ Demo dashboard rendered');
            
            this.setupEventListeners();
            console.log('✅ Demo event listeners setup');
            
            this.initializeDashboardSections();
            console.log('✅ Demo dashboard sections initialized');
            
            this.updateLoadingProgress(2, 'completed');
        } catch (error) {
            console.error('❌ Error in demo step 2:', error);
            this.updateLoadingProgress(2, 'error', '❌ Dashboard interface setup failed');
            
            // Fallback for demo user
            try {
                console.log('🔄 Attempting demo fallback activation...');
                this.dashboardActive = true;
                document.body.classList.add('dashboard-active');
                
                const sections = document.querySelectorAll('.dashboard-card');
                sections.forEach(section => {
                    section.style.display = 'block';
                    section.style.visibility = 'visible';
                    section.style.opacity = '1';
                });
                
                console.log('✅ Demo fallback activation successful');
                this.updateLoadingProgress(2, 'completed', '🎛️ Dashboard interface ready (fallback mode)');
            } catch (fallbackError) {
                console.error('❌ Demo fallback activation failed:', fallbackError);
            }
        }
        
        // Step 3: Prepare systems
        this.updateLoadingProgress(3, 'active', '⚙️ Preparing learning systems...');
        this.initializeLiveFeatures();
        this.updateLoadingProgress(3, 'completed');
        
        // Step 4: Setup notes
        this.updateLoadingProgress(4, 'active', '📝 Setting up notes system...');
        this.setupNotesEditor();
        this.setupNotesLibrary();
        this.updateLoadingProgress(4, 'completed');
        
        // Step 5: Activate sections
        this.updateLoadingProgress(5, 'active', '🎯 Activating dashboard sections...');
        this.activateAllSections();
        this.updateLoadingProgress(5, 'completed');
        
        // Step 6: Set online status
        this.updateLoadingProgress(6, 'active', '🌐 Setting online status...');
        this.setUserOnlineStatus(true);
        this.updateLoadingProgress(6, 'completed');
        
        // Final step
        setTimeout(() => {
            this.hideLoadingState();
            this.showDashboardReady();
            console.log('✅ Dashboard activated for demo user:', this.user.displayName || this.user.email);
        }, 1000);
    }

    showSuccess(message) {
        if (window.showToast) {
            window.showToast(message, 'success');
        } else {
            // Create custom toast notification
            this.showCustomToast(message, 'success');
        }
    }

    showError(message) {
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            // Create custom toast notification
            this.showCustomToast(message, 'error');
        }
    }

    showCustomToast(message, type = 'info') {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.custom-toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        
        const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8';
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle';
        
        toast.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${bgColor};
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 400px;
                animation: slideInRight 0.3s ease-out;
            ">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
            <style>
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    // Live Session Management
    initializeLiveFeatures() {
        this.setupLiveSessionControls();
        this.setupNotesEditor();
        this.setupNotesLibrary();
        this.updateNotesUIForSession();
    }

    updateNotesUIForSession() {
        const notesCard = document.querySelector('.notes-card');
        const saveBtn = document.getElementById('save-notes-btn');
        
        if (this.liveSession?.active) {
            // Add live session styling
            if (notesCard) notesCard.classList.add('live-session');
            if (saveBtn) saveBtn.classList.add('live-active');
            
            // Update card header
            const cardHeader = notesCard?.querySelector('.card-header h3');
            if (cardHeader) {
                cardHeader.innerHTML = '📝 Learning Notes <span style="color: #dc3545; font-size: 0.8rem;">● LIVE SESSION</span>';
            }
        } else {
            // Remove live session styling
            if (notesCard) notesCard.classList.remove('live-session');
            if (saveBtn) saveBtn.classList.remove('live-active');
            
            // Reset card header
            const cardHeader = notesCard?.querySelector('.card-header h3');
            if (cardHeader) {
                cardHeader.innerHTML = '📝 Learning Notes';
            }
        }
    }

    setupLiveSessionControls() {
        const startBtn = document.getElementById('start-session-btn');
        const endBtn = document.getElementById('end-session-btn');

        if (startBtn) startBtn.addEventListener('click', () => this.startLiveSession());
        if (endBtn) endBtn.addEventListener('click', () => this.endLiveSession());

        // Video control buttons
        const instructorAudio = document.getElementById('toggle-instructor-audio');
        const instructorVideo = document.getElementById('toggle-instructor-video');
        const learnerAudio = document.getElementById('toggle-learner-audio');
        const learnerVideo = document.getElementById('toggle-learner-video');

        if (instructorAudio) instructorAudio.addEventListener('click', () => this.toggleAudio('instructor'));
        if (instructorVideo) instructorVideo.addEventListener('click', () => this.toggleVideo('instructor'));
        if (learnerAudio) learnerAudio.addEventListener('click', () => this.toggleAudio('learner'));
        if (learnerVideo) learnerVideo.addEventListener('click', () => this.toggleVideo('learner'));
    }

    async startLiveSession() {
        try {
            console.log('🎥 Starting live session...');
            
            // Request camera and microphone permissions
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            // Set up learner video
            const learnerVideo = document.getElementById('learner-video');
            if (learnerVideo) {
                learnerVideo.srcObject = stream;
            }
            
            // Simulate instructor video (in real implementation, this would come from WebRTC)
            this.simulateInstructorVideo();
            
            // Update UI
            const startBtn = document.getElementById('start-session-btn');
            const endBtn = document.getElementById('end-session-btn');
            const sessionInfo = document.getElementById('session-info');
            
            if (startBtn) startBtn.style.display = 'none';
            if (endBtn) endBtn.style.display = 'flex';
            if (sessionInfo) sessionInfo.style.display = 'flex';
            
            // Start session timer
            this.startSessionTimer();
            
            // Update current session info
            this.updateCurrentSessionInfo();
            
            // Initialize notes for this session
            this.initializeSessionNotes();
            
            // Update UI for live session
            this.updateNotesUIForSession();
            
            this.liveSession = {
                startTime: new Date(),
                stream: stream,
                active: true,
                sessionId: 'session-' + Date.now(),
                topic: 'Machine Learning Basics'
            };
            
            // Add activity for starting live session
            this.addActivity('course', 'Started Live Learning Session', 'Activated camera and microphone for interactive learning', '📹');
            
            this.showSuccess('Live session started successfully! Notes are ready.');
            console.log('✅ Live session started');
            
        } catch (error) {
            console.error('❌ Error starting live session:', error);
            this.showError('Failed to start live session. Please check camera permissions.');
        }
    }

    simulateInstructorVideo() {
        // In a real implementation, this would be a WebRTC connection
        const instructorVideo = document.getElementById('instructor-video');
        if (!instructorVideo) return;
        
        // Create a canvas for simulated instructor video
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        // Simple animation
        let frame = 0;
        const animate = () => {
            if (!this.liveSession?.active) return;
            
            // Create gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add instructor placeholder
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('👨‍🏫 Instructor', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillText('(Simulated)', canvas.width / 2, canvas.height / 2 + 20);
            
            // Add moving element
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(
                canvas.width / 2 + Math.sin(frame * 0.05) * 100,
                canvas.height / 2 + Math.cos(frame * 0.03) * 50,
                20,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            frame++;
            requestAnimationFrame(animate);
        };
        
        animate();
        
        // Convert canvas to video stream
        const stream = canvas.captureStream(30);
        instructorVideo.srcObject = stream;
    }

    endLiveSession() {
        if (this.liveSession?.stream) {
            // Stop all tracks
            this.liveSession.stream.getTracks().forEach(track => track.stop());
        }
        
        // Auto-save current notes before ending session
        if (this.currentNote.trim()) {
            this.autoSaveNote();
        }
        
        // Clear video sources
        const learnerVideo = document.getElementById('learner-video');
        const instructorVideo = document.getElementById('instructor-video');
        
        if (learnerVideo) learnerVideo.srcObject = null;
        if (instructorVideo) instructorVideo.srcObject = null;
        
        // Update UI
        const startBtn = document.getElementById('start-session-btn');
        const endBtn = document.getElementById('end-session-btn');
        const sessionInfo = document.getElementById('session-info');
        
        if (startBtn) startBtn.style.display = 'flex';
        if (endBtn) endBtn.style.display = 'none';
        if (sessionInfo) sessionInfo.style.display = 'none';
        
        // Stop session timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        
        // Finalize session notes
        this.finalizeSessionNotes();
        
        this.liveSession = null;
        
        // Update UI for session end
        this.updateNotesUIForSession();
        
        this.showSuccess('Live session ended. Notes have been saved automatically.');
        console.log('🛑 Live session ended');
    }

    startSessionTimer() {
        const durationElement = document.getElementById('session-duration');
        if (!durationElement) return;
        
        const startTime = new Date();
        
        this.sessionTimer = setInterval(() => {
            const now = new Date();
            const elapsed = Math.floor((now - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            durationElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    updateCurrentSessionInfo() {
        const topicElement = document.getElementById('current-topic');
        const timeElement = document.getElementById('current-session-time');
        
        // In a real implementation, this would come from the session data
        if (topicElement) topicElement.textContent = 'Machine Learning Basics';
        if (timeElement) timeElement.textContent = `Started at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    initializeSessionNotes() {
        const editor = document.getElementById('notes-editor');
        if (!editor) return;
        
        // Create session header in notes
        const sessionHeader = `
            <div style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 1.1rem;">📹 Live Session: ${this.liveSession?.topic || 'Learning Session'}</h3>
                <p style="margin: 5px 0 0 0; font-size: 0.9rem; opacity: 0.9;">Started at ${new Date().toLocaleTimeString()}</p>
            </div>
            <div><strong>📝 Session Notes:</strong></div>
            <div><br></div>
        `;
        
        editor.innerHTML = sessionHeader;
        this.currentNote = sessionHeader;
        this.updateWordCount();
        
        // Update status
        const statusElement = document.getElementById('auto-save-status');
        if (statusElement) {
            statusElement.textContent = 'Session notes ready';
            statusElement.style.color = '#28a745';
        }
    }

    finalizeSessionNotes() {
        if (!this.currentNote.trim()) return;
        
        const editor = document.getElementById('notes-editor');
        if (!editor) return;
        
        // Add session summary footer
        const sessionFooter = `
            <div><br></div>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; border-left: 4px solid #FFD700; margin-top: 15px;">
                <strong>📊 Session Summary:</strong><br>
                Session ended at ${new Date().toLocaleTimeString()}<br>
                Duration: ${this.getSessionDuration()}<br>
                Total words: ${this.getWordCount(this.currentNote)}
            </div>
        `;
        
        editor.innerHTML += sessionFooter;
        this.currentNote = editor.innerHTML;
        this.updateWordCount();
        
        // Auto-save the finalized notes
        this.saveCurrentNote();
    }

    getSessionDuration() {
        if (!this.liveSession?.startTime) return '0:00';
        
        const now = new Date();
        const elapsed = Math.floor((now - this.liveSession.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    toggleAudio(type) {
        const btn = document.getElementById(`toggle-${type}-audio`);
        if (!btn) return;
        
        const icon = btn.querySelector('i');
        
        if (type === 'learner' && this.liveSession?.stream) {
            const audioTracks = this.liveSession.stream.getAudioTracks();
            if (audioTracks.length > 0) {
                const track = audioTracks[0];
                track.enabled = !track.enabled;
                
                if (track.enabled) {
                    icon.className = 'fas fa-microphone';
                    btn.classList.remove('muted');
                } else {
                    icon.className = 'fas fa-microphone-slash';
                    btn.classList.add('muted');
                }
            }
        } else {
            // Toggle instructor audio (simulated)
            if (icon.className.includes('microphone-slash')) {
                icon.className = 'fas fa-microphone';
                btn.classList.remove('muted');
            } else {
                icon.className = 'fas fa-microphone-slash';
                btn.classList.add('muted');
            }
        }
    }

    toggleVideo(type) {
        const btn = document.getElementById(`toggle-${type}-video`);
        if (!btn) return;
        
        const icon = btn.querySelector('i');
        const video = document.getElementById(`${type}-video`);
        
        if (type === 'learner' && this.liveSession?.stream) {
            const videoTracks = this.liveSession.stream.getVideoTracks();
            if (videoTracks.length > 0) {
                const track = videoTracks[0];
                track.enabled = !track.enabled;
                
                if (track.enabled) {
                    icon.className = 'fas fa-video';
                    if (video) video.style.opacity = '1';
                } else {
                    icon.className = 'fas fa-video-slash';
                    if (video) video.style.opacity = '0.3';
                }
            }
        } else {
            // Toggle instructor video (simulated)
            if (icon.className.includes('video-slash')) {
                icon.className = 'fas fa-video';
                if (video) video.style.opacity = '1';
            } else {
                icon.className = 'fas fa-video-slash';
                if (video) video.style.opacity = '0.3';
            }
        }
    }

    // Notes Editor Management
    setupNotesEditor() {
        const editor = document.getElementById('notes-editor');
        const saveBtn = document.getElementById('save-notes-btn');
        const newNoteBtn = document.getElementById('new-note-btn');
        const viewAllBtn = document.getElementById('view-all-notes-btn');
        
        if (!editor) return;
        
        // Auto-save functionality
        editor.addEventListener('input', () => {
            this.currentNote = editor.innerHTML;
            this.updateWordCount();
            this.scheduleAutoSave();
            
            // Update session status if live
            if (this.liveSession?.active) {
                this.updateSessionStatus();
            }
        });
        
        // Toolbar buttons
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                if (command) {
                    document.execCommand(command, false, null);
                    editor.focus();
                }
            });
        });
        
        // Special toolbar buttons
        const timestampBtn = document.getElementById('insert-timestamp');
        const highlightBtn = document.getElementById('insert-highlight');
        
        if (timestampBtn) timestampBtn.addEventListener('click', () => this.insertTimestamp());
        if (highlightBtn) highlightBtn.addEventListener('click', () => this.insertHighlight());
        
        // Control buttons
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveCurrentNote());
        if (newNoteBtn) newNoteBtn.addEventListener('click', () => this.createNewNote());
        if (viewAllBtn) viewAllBtn.addEventListener('click', () => this.showAllNotes());
        
        // Load current note if exists
        this.loadCurrentNote();
    }

    updateSessionStatus() {
        const statusElement = document.getElementById('auto-save-status');
        if (statusElement && this.liveSession?.active) {
            statusElement.innerHTML = `
                <span style="color: #dc3545;">● LIVE</span> 
                <span style="color: #28a745;">Auto-saving</span>
            `;
        }
    }

    scheduleAutoSave() {
        if (this.autoSaveInterval) {
            clearTimeout(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setTimeout(() => {
            this.autoSaveNote();
        }, 2000); // Auto-save after 2 seconds of inactivity
    }

    async autoSaveNote() {
        if (!this.currentNote.trim()) return;
        
        try {
            const statusElement = document.getElementById('auto-save-status');
            if (statusElement) {
                statusElement.textContent = 'Saving...';
                statusElement.style.color = '#ffc107';
            }
            
            await this.saveNoteToStorage(this.currentNote, true);
            
            if (statusElement) {
                statusElement.textContent = 'Auto-saved';
                statusElement.style.color = '#28a745';
            }
            
        } catch (error) {
            console.error('Auto-save failed:', error);
            const statusElement = document.getElementById('auto-save-status');
            if (statusElement) {
                statusElement.textContent = 'Save failed';
                statusElement.style.color = '#dc3545';
            }
        }
    }

    async saveCurrentNote() {
        const editor = document.getElementById('notes-editor');
        if (!editor) return;
        
        const content = editor.innerHTML.trim();
        
        if (!content) {
            this.showError('Cannot save empty note');
            return;
        }
        
        try {
            await this.saveNoteToStorage(content, false);
            this.showSuccess('Note saved successfully!');
            await this.loadNotes();
            this.renderNotes();
        } catch (error) {
            console.error('Error saving note:', error);
            this.showError('Failed to save note');
        }
    }

    async saveNoteToStorage(content, isAutoSave = false) {
        const topicElement = document.getElementById('current-topic');
        
        const noteData = {
            content: content,
            title: this.extractTitleFromContent(content),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sessionTopic: topicElement ? topicElement.textContent : 'General Session',
            tags: this.extractTagsFromContent(content),
            wordCount: this.getWordCount(content),
            isAutoSave: isAutoSave
        };
        
        if (window.SimpleFirebase?.isReady()) {
            // Save to Firebase
            await db.collection('users').doc(this.user.uid).collection('notes').add(noteData);
        } else {
            // Save to localStorage
            const notes = JSON.parse(localStorage.getItem(`targstar_notes_${this.user.uid}`) || '[]');
            noteData.id = Date.now().toString();
            notes.unshift(noteData);
            localStorage.setItem(`targstar_notes_${this.user.uid}`, JSON.stringify(notes));
        }
    }

    extractTitleFromContent(content) {
        // Remove HTML tags and get first line or first 50 characters
        const text = content.replace(/<[^>]*>/g, '').trim();
        const firstLine = text.split('\n')[0];
        return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine || 'Untitled Note';
    }

    extractTagsFromContent(content) {
        // Extract hashtags from content
        const text = content.replace(/<[^>]*>/g, '');
        const hashtags = text.match(/#\w+/g);
        return hashtags ? hashtags.map(tag => tag.substring(1)) : [];
    }

    getWordCount(content) {
        const text = content.replace(/<[^>]*>/g, '').trim();
        return text ? text.split(/\s+/).length : 0;
    }

    updateWordCount() {
        const editor = document.getElementById('notes-editor');
        const wordCountElement = document.getElementById('word-count');
        
        if (editor && wordCountElement) {
            const count = this.getWordCount(editor.innerHTML);
            wordCountElement.textContent = `${count} words`;
        }
    }

    insertTimestamp() {
        const editor = document.getElementById('notes-editor');
        if (!editor) return;
        
        const timestamp = new Date().toLocaleString();
        const sessionTime = this.liveSession?.active ? ` | Session: ${this.getSessionDuration()}` : '';
        const timestampHTML = `<span style="background: #fff3cd; padding: 2px 6px; border-radius: 4px; font-size: 0.85em;">[${timestamp}${sessionTime}]</span>&nbsp;`;
        
        document.execCommand('insertHTML', false, timestampHTML);
        editor.focus();
    }

    insertHighlight() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (!range.collapsed) {
                document.execCommand('hiliteColor', false, '#ffeb3b');
            }
        }
        const editor = document.getElementById('notes-editor');
        if (editor) editor.focus();
    }

    createNewNote() {
        const editor = document.getElementById('notes-editor');
        if (!editor) return;
        
        editor.innerHTML = '';
        this.currentNote = '';
        this.updateWordCount();
        editor.focus();
        
        // Update status
        const statusElement = document.getElementById('auto-save-status');
        if (statusElement) {
            statusElement.textContent = 'New note';
            statusElement.style.color = '#6c757d';
        }
    }

    loadCurrentNote() {
        // Load the most recent note or create new
        if (this.notes.length > 0) {
            const latestNote = this.notes[0];
            if (latestNote.isAutoSave) {
                const editor = document.getElementById('notes-editor');
                if (editor) {
                    editor.innerHTML = latestNote.content;
                    this.currentNote = latestNote.content;
                    this.updateWordCount();
                }
            }
        }
    }

    showAllNotes() {
        // Scroll to notes library section
        const notesLibrary = document.querySelector('.notes-library-card');
        if (notesLibrary) {
            notesLibrary.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    setupNotesLibrary() {
        const searchInput = document.getElementById('notes-search');
        const filterSelect = document.getElementById('notes-filter');
        
        if (searchInput) searchInput.addEventListener('input', () => this.filterNotes());
        if (filterSelect) filterSelect.addEventListener('change', () => this.filterNotes());
    }

    filterNotes() {
        const searchInput = document.getElementById('notes-search');
        const filterSelect = document.getElementById('notes-filter');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const filter = filterSelect ? filterSelect.value : 'all';
        
        let filteredNotes = [...this.notes];
        
        // Apply search filter
        if (searchTerm) {
            filteredNotes = filteredNotes.filter(note => 
                (note.title?.toLowerCase().includes(searchTerm)) ||
                (note.content?.toLowerCase().includes(searchTerm)) ||
                (note.tags?.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }
        
        // Apply category filter
        if (filter !== 'all') {
            filteredNotes = filteredNotes.filter(note => {
                switch (filter) {
                    case 'recent':
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return new Date(note.createdAt) > weekAgo;
                    case 'favorites':
                        return note.favorite;
                    case 'archived':
                        return note.archived;
                    default:
                        return true;
                }
            });
        }
        
        this.renderFilteredNotes(filteredNotes);
    }

    renderFilteredNotes(notes) {
        const container = document.getElementById('notes-grid');
        if (!container) return;
        
        if (notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No notes found matching your criteria</p>
                </div>
            `;
            return;
        }
        
        const notesHTML = notes.map(note => `
            <div class="note-card" onclick="window.dashboardManager.openNote('${note.id}')">
                <div class="note-header">
                    <h4 class="note-title">${note.title || 'Untitled Note'}</h4>
                    <div class="note-actions">
                        <button class="note-action-btn favorite ${note.favorite ? 'active' : ''}" 
                                onclick="event.stopPropagation(); window.dashboardManager.toggleNoteFavorite('${note.id}')">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="note-action-btn delete" 
                                onclick="event.stopPropagation(); window.dashboardManager.deleteNote('${note.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-preview">${this.getPreviewText(note.content)}</div>
                <div class="note-meta">
                    <div class="note-date">
                        <i class="fas fa-clock"></i>
                        ${this.formatDate(note.updatedAt || note.createdAt)}
                    </div>
                    <div class="note-tags">
                        ${note.tags ? note.tags.map(tag => `<span class="note-tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = notesHTML;
    }

    openNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            const editor = document.getElementById('notes-editor');
            if (editor) {
                editor.innerHTML = note.content;
                this.currentNote = note.content;
                this.updateWordCount();
                
                // Scroll to editor
                const notesCard = document.querySelector('.notes-card');
                if (notesCard) {
                    notesCard.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        }
    }

    async toggleNoteFavorite(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            note.favorite = !note.favorite;
            note.updatedAt = new Date().toISOString();
            
            try {
                if (window.SimpleFirebase?.isReady()) {
                    await db.collection('users').doc(this.user.uid).collection('notes').doc(noteId).update({
                        favorite: note.favorite,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    localStorage.setItem(`targstar_notes_${this.user.uid}`, JSON.stringify(this.notes));
                }
                
                this.renderNotes();
                this.showSuccess(note.favorite ? 'Added to favorites' : 'Removed from favorites');
                
            } catch (error) {
                console.error('Error updating note:', error);
                this.showError('Failed to update note');
            }
        }
    }

    async deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) return;
        
        try {
            if (window.SimpleFirebase?.isReady()) {
                await db.collection('users').doc(this.user.uid).collection('notes').doc(noteId).delete();
            } else {
                this.notes = this.notes.filter(n => n.id !== noteId);
                localStorage.setItem(`targstar_notes_${this.user.uid}`, JSON.stringify(this.notes));
            }
            
            await this.loadNotes();
            this.renderNotes();
            this.showSuccess('Note deleted successfully');
            
        } catch (error) {
            console.error('Error deleting note:', error);
            this.showError('Failed to delete note');
        }
    }
}

// Global functions for dashboard actions
window.openProfileSettings = function() {
    if (window.dashboardManager) {
        window.dashboardManager.openProfileModal();
    }
};

window.downloadCertificate = function() {
    alert('Certificate download feature coming soon!');
};

// Global functions for notes quick actions
window.insertQuickNote = function(type) {
    const editor = document.getElementById('notes-editor');
    if (!editor) return;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sessionDuration = window.dashboardManager?.getSessionDuration() || '0:00';
    
    let template = '';
    switch (type) {
        case 'Key Point':
            template = `<div style="background: rgba(255, 215, 0, 0.1); padding: 8px; border-left: 4px solid #FFD700; margin: 10px 0;"><strong>🔑 Key Point [${timestamp} - ${sessionDuration}]:</strong> </div><div><br></div>`;
            break;
        case 'Question':
            template = `<div style="background: rgba(23, 162, 184, 0.1); padding: 8px; border-left: 4px solid #17a2b8; margin: 10px 0;"><strong>❓ Question [${timestamp} - ${sessionDuration}]:</strong> </div><div><br></div>`;
            break;
        case 'Important':
            template = `<div style="background: rgba(220, 53, 69, 0.1); padding: 8px; border-left: 4px solid #dc3545; margin: 10px 0;"><strong>⚠️ Important [${timestamp} - ${sessionDuration}]:</strong> </div><div><br></div>`;
            break;
        case 'To Review':
            template = `<div style="background: rgba(40, 167, 69, 0.1); padding: 8px; border-left: 4px solid #28a745; margin: 10px 0;"><strong>📖 To Review [${timestamp} - ${sessionDuration}]:</strong> </div><div><br></div>`;
            break;
        default:
            template = `<div><strong>${type}:</strong> </div><div><br></div>`;
    }
    
    document.execCommand('insertHTML', false, template);
    editor.focus();
    
    // Update current note
    if (window.dashboardManager) {
        window.dashboardManager.currentNote = editor.innerHTML;
        window.dashboardManager.updateWordCount();
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase and other dependencies
    setTimeout(() => {
        console.log('🚀 Initializing Dashboard Manager...');
        window.dashboardManager = new DashboardManager();
        console.log('✅ Dashboard Manager initialized');
    }, 1000);
});

// Global error handler for dashboard
window.addEventListener('error', (event) => {
    console.error('Dashboard Error:', event.error);
    if (window.dashboardManager) {
        window.dashboardManager.showError('An error occurred. Please refresh the page if issues persist.');
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.dashboardManager) {
        if (document.hidden) {
            // Page is hidden - pause auto-save
            if (window.dashboardManager.autoSaveInterval) {
                clearTimeout(window.dashboardManager.autoSaveInterval);
            }
        } else {
            // Page is visible - resume auto-save
            if (window.dashboardManager.currentNote) {
                window.dashboardManager.scheduleAutoSave();
            }
        }
    }
});

// Global functions for notes quick actions
window.insertQuickNote = function(type) {
    const editor = document.getElementById('notes-editor');
    if (!editor) return;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sessionDuration = window.dashboardManager?.getSessionDuration() || '0:00';
    
    let template = '';
    switch (type) {
        case 'Key Point':
            template = `<div style="background: rgba(255, 215, 0, 0.1); padding: 8px; border-left: 4px solid #FFD700; margin: 10px 0;"><strong>🔑 Key Point [${timestamp} - ${sessionDuration}]:</strong> </div><div><br></div>`;
            break;
        case 'Question':
            template = `<div style="background: rgba(23, 162, 184, 0.1); padding: 8px; border-left: 4px solid #17a2b8; margin: 10px 0;"><strong>❓ Question [${timestamp} - ${sessionDuration}]:</strong> </div><div><br></div>`;
            break;
        case 'Important':
            template = `<div style="background: rgba(220, 53, 69, 0.1); padding: 8px; border-left: 4px solid #dc3545; margin: 10px 0;"><strong>⚠️ Important [${timestamp} - ${sessionDuration}]:</strong> </div><div><br></div>`;
            break;
        case 'To Review':
            template = `<div style="background: rgba(40, 167, 69, 0.1); padding: 8px; border-left: 4px solid #28a745; margin: 10px 0;"><strong>📖 To Review [${timestamp} - ${sessionDuration}]:</strong> </div><div><br></div>`;
            break;
        default:
            template = `<div><strong>${type}:</strong> </div><div><br></div>`;
    }
    
    document.execCommand('insertHTML', false, template);
    editor.focus();
    
    // Update current note
    if (window.dashboardManager) {
        window.dashboardManager.currentNote = editor.innerHTML;
        window.dashboardManager.updateWordCount();
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
    console.log('📊 Dashboard initialized successfully!');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.dashboardManager) {
        if (document.hidden) {
            // User switched away from dashboard
            window.dashboardManager.setUserOnlineStatus(false);
            console.log('👤 User went offline (tab hidden)');
        } else {
            // User returned to dashboard
            window.dashboardManager.setUserOnlineStatus(true);
            console.log('👤 User came back online (tab visible)');
        }
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.dashboardManager) {
        // Set user offline and cleanup
        window.dashboardManager.setUserOnlineStatus(false);
        
        // Stop media streams
        if (window.dashboardManager.liveSession?.stream) {
            window.dashboardManager.liveSession.stream.getTracks().forEach(track => track.stop());
        }
        
        // Auto-save current notes
        if (window.dashboardManager.currentNote?.trim()) {
            window.dashboardManager.autoSaveNote();
        }
        
        console.log('👋 Dashboard cleanup completed');
    }
});
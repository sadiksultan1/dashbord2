// Enhanced Authentication functionality with demo accounts
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoggingOut = false; // Flag to prevent modal opening during logout
        this.demoUsers = [
            {
                uid: 'demo-user-1',
                email: 'demo@targstar.com',
                displayName: 'Demo User',
                password: 'demo123',
                enrolledCourses: ['nlp', 'ml', 'dl'],
                completedHours: 24,
                averageProgress: 75
            },
            {
                uid: 'demo-user-2', 
                email: 'student@targstar.com',
                displayName: 'AI Student',
                password: 'student123',
                enrolledCourses: ['nlp'],
                completedHours: 8,
                averageProgress: 45
            },
            {
                uid: 'demo-user-3',
                email: 'learner@targstar.com', 
                displayName: 'Tech Learner',
                password: 'learner123',
                enrolledCourses: ['ml', 'cv'],
                completedHours: 16,
                averageProgress: 60
            }
        ];
        this.initializeAuth();
        this.setupEventListeners();
    }

    initializeAuth() {
        // Load saved theme immediately
        this.loadSavedTheme();
        
        // Check for saved user session
        const savedUser = localStorage.getItem('targstar_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateUI(this.currentUser);
                console.log('🔐 User session restored:', this.currentUser.displayName);
            } catch (error) {
                console.error('Error restoring user session:', error);
                localStorage.removeItem('targstar_user');
            }
        }
        
        // Listen for authentication state changes (Firebase fallback)
        if (window.auth) {
            auth.onAuthStateChanged((user) => {
                if (user && !this.currentUser) {
                    this.currentUser = user;
                    this.updateUI(user);
                    
                    if (user) {
                        // Create user document if it doesn't exist
                        window.FirebaseHelpers?.createUserDocument(user);
                    }
                }
            });
        }
    }

    setupEventListeners() {
        // Wait for DOM elements to be available and try multiple times if needed
        let attempts = 0;
        const maxAttempts = 5;
        
        const tryBinding = () => {
            attempts++;
            const signUpBtn = document.getElementById('sign-up-btn');
            if (signUpBtn) {
                this.bindEventListeners();
            } else if (attempts < maxAttempts) {
                setTimeout(tryBinding, 100);
            }
        };
        
        // Start trying immediately and also after a short delay
        tryBinding();
        setTimeout(tryBinding, 500);
    }

    bindEventListeners() {
        // Modal controls
        const modal = document.getElementById('auth-modal');
        const signInBtn = document.getElementById('sign-in-btn');
        const signUpBtn = document.getElementById('sign-up-btn');
        const signupDropdown = document.querySelector('.signup-dropdown');
        const dropdownMenu = document.getElementById('signup-dropdown-menu');
        const logoutBtn = document.getElementById('logout-btn');
        const closeBtn = modal?.querySelector('.close');
        const switchToSignup = document.getElementById('switch-to-signup');
        const switchToSignin = document.getElementById('switch-to-signin');

        // Form elements
        const signinFormElement = document.getElementById('signin-form');
        const signupFormElement = document.getElementById('signup-form');

        // Open modal events
        if (signInBtn) {
            signInBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('signin');
            });
        }

        // Enhanced signup dropdown functionality - ONLY dropdown, no signup modal
        if (signUpBtn) {
            signUpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Always toggle dropdown, regardless of login status
                this.toggleDropdown();
            });
        }
        
        // Close dropdown when clicking outside
        if (signupDropdown) {
            document.addEventListener('click', (e) => {
                if (!signupDropdown.contains(e.target)) {
                    this.closeDropdown();
                }
            });
            
            // Prevent dropdown from closing when clicking inside
            if (dropdownMenu) {
                dropdownMenu.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        }

        // Logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.logout();
            });
        }

        // Close modal events
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (modal) {
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    this.closeModal();
                }
            });
        }

        // Switch between forms
        if (switchToSignup) {
            switchToSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm('signup');
            });
        }

        if (switchToSignin) {
            switchToSignin.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm('signin');
            });
        }

        // Form submissions
        if (signinFormElement) {
            signinFormElement.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignIn();
            });
        }

        if (signupFormElement) {
            signupFormElement.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignUp();
            });
        }
    }

    openModal(type = 'signin') {
        // Prevent modal opening if we're in the middle of logout process
        if (this.isLoggingOut) {
            console.log('Modal opening prevented during logout process');
            return;
        }
        
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            this.switchForm(type);
            
            // Focus on first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input[type="email"]');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    closeModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
            this.clearForms();
            this.clearMessages();
        }
    }

    switchForm(type) {
        const signInForm = document.getElementById('sign-in-form');
        const signUpForm = document.getElementById('sign-up-form');

        if (signInForm && signUpForm) {
            if (type === 'signup') {
                signInForm.style.display = 'none';
                signUpForm.style.display = 'block';
            } else {
                signInForm.style.display = 'block';
                signUpForm.style.display = 'none';
            }
            this.clearMessages();
        }
    }

    async handleSignIn() {
        const emailInput = document.getElementById('signin-email');
        const passwordInput = document.getElementById('signin-password');
        const submitBtn = document.querySelector('#signin-form button[type="submit"]');

        if (!emailInput || !passwordInput) {
            this.showError('signin', 'Form elements not found.');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            this.showError('signin', 'Please fill in all fields.');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('signin', 'Please enter a valid email address.');
            return;
        }

        try {
            this.setLoading(submitBtn, true);
            
            // Check demo users first
            const demoUser = this.demoUsers.find(user => 
                user.email === email && user.password === password
            );
            
            if (demoUser) {
                // Demo login successful
                this.currentUser = demoUser;
                localStorage.setItem('targstar_user', JSON.stringify(demoUser));
                
                this.showSuccess('signin', `Welcome back, ${demoUser.displayName}! 🎉`);
                
                // Log demo analytics event
                this.logDemoEvent('login', {
                    method: 'demo',
                    user_type: 'demo'
                });
                
                setTimeout(() => {
                    this.closeModal();
                    this.updateUI(demoUser);
                    
                    // Show welcome toast
                    if (window.showToast) {
                        window.showToast(`🎉 Welcome back, ${demoUser.displayName}!`, 'success');
                    }
                    
                    // Auto-redirect to dashboard for immediate activation
                    setTimeout(() => {
                        if (window.location.pathname !== '/dashboard.html') {
                            window.location.href = 'dashboard.html';
                        }
                    }, 1000);
                }, 1500);
                
                return;
            }
            
            // Try Firebase authentication as fallback
            if (window.auth) {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                
                this.showSuccess('signin', 'Successfully signed in!');
                
                // Log analytics event
                if (window.FirebaseHelpers) {
                    window.FirebaseHelpers.logEvent('login', {
                        method: 'email'
                    });
                }
                
                setTimeout(() => {
                    this.closeModal();
                    
                    // Auto-redirect to dashboard for immediate activation
                    setTimeout(() => {
                        if (window.location.pathname !== '/dashboard.html') {
                            window.location.href = 'dashboard.html';
                        }
                    }, 1000);
                }, 1500);
            } else {
                // No Firebase, show demo account info
                this.showError('signin', `
                    <div style="text-align: left;">
                        <strong>Demo Accounts Available:</strong><br>
                        📧 demo@targstar.com | 🔑 demo123<br>
                        📧 student@targstar.com | 🔑 student123<br>
                        📧 learner@targstar.com | 🔑 learner123
                    </div>
                `);
            }
            
        } catch (error) {
            console.error('Sign in error:', error);
            this.showError('signin', this.getErrorMessage(error.code));
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    // Google Sign-In functionality
    async handleGoogleSignIn() {
        try {
            if (!window.auth) {
                this.showError('signin', 'Firebase authentication not available.');
                return;
            }

            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');
            
            // Set custom parameters
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            const result = await auth.signInWithPopup(provider);
            const user = result.user;
            const credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);

            // Create or update user document
            if (window.FirebaseHelpers) {
                await window.FirebaseHelpers.createUserDocument(user, {
                    signInMethod: 'google',
                    googleCredential: {
                        accessToken: credential.accessToken,
                        idToken: credential.idToken
                    }
                });
            }

            this.currentUser = user;
            localStorage.setItem('targstar_user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                signInMethod: 'google'
            }));

            this.showSuccess('signin', `Welcome, ${user.displayName}! 🎉`);
            
            // Log analytics event
            if (window.FirebaseHelpers) {
                window.FirebaseHelpers.logEvent('login', {
                    method: 'google'
                });
            }

            setTimeout(() => {
                this.closeModal();
                this.updateUI(user);
                
                // Show welcome toast
                if (window.showToast) {
                    window.showToast(`🎉 Welcome to TARG STAR, ${user.displayName}!`, 'success');
                }
            }, 1500);

        } catch (error) {
            console.error('Google sign in error:', error);
            
            if (error.code === 'auth/popup-closed-by-user') {
                this.showError('signin', 'Sign-in was cancelled. Please try again.');
            } else if (error.code === 'auth/popup-blocked') {
                this.showError('signin', 'Pop-up was blocked. Please allow pop-ups and try again.');
            } else {
                this.showError('signin', 'Google sign-in failed. Please try again.');
            }
        }
    }

    async handleSignUp() {
        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const submitBtn = document.querySelector('#signup-form button[type="submit"]');

        if (!nameInput || !emailInput || !passwordInput) {
            this.showError('signup', 'Form elements not found.');
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!name || !email || !password) {
            this.showError('signup', 'Please fill in all fields.');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('signup', 'Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            this.showError('signup', 'Password must be at least 6 characters long.');
            return;
        }

        try {
            this.setLoading(submitBtn, true);
            
            // Check if demo email already exists
            const existingDemoUser = this.demoUsers.find(user => user.email === email);
            if (existingDemoUser) {
                this.showError('signup', 'This email is already registered. Please sign in instead.');
                return;
            }
            
            // Create new demo user
            const newUser = {
                uid: 'demo-user-' + Date.now(),
                email: email,
                displayName: name,
                password: password,
                enrolledCourses: [],
                completedHours: 0,
                averageProgress: 0,
                createdAt: new Date().toISOString()
            };
            
            // Add to demo users (in real app, this would be saved to database)
            this.demoUsers.push(newUser);
            this.currentUser = newUser;
            localStorage.setItem('targstar_user', JSON.stringify(newUser));
            
            this.showSuccess('signup', `Account created successfully! Welcome, ${name}! 🎉`);
            
            // Log demo analytics event
            this.logDemoEvent('sign_up', {
                method: 'demo',
                user_type: 'new_demo'
            });
            
            setTimeout(() => {
                this.closeModal();
                this.updateUI(newUser);
                
                // Show welcome toast
                if (window.showToast) {
                    window.showToast(`🎉 Welcome to TARG STAR, ${name}!`, 'success');
                }
                
                // Auto-redirect to dashboard for immediate activation
                setTimeout(() => {
                    if (window.location.pathname !== '/dashboard.html') {
                        window.location.href = 'dashboard.html';
                    }
                }, 2000);
            }, 1500);
            
            // Try Firebase as fallback
            if (window.auth) {
                try {
                    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                    
                    // Update user profile with name
                    await userCredential.user.updateProfile({
                        displayName: name
                    });

                    // Create user document in Firestore
                    await window.FirebaseHelpers.createUserDocument(userCredential.user, {
                        displayName: name
                    });

                    // Log analytics event
                    if (window.FirebaseHelpers) {
                        window.FirebaseHelpers.logEvent('sign_up', {
                            method: 'email'
                        });
                    }
                } catch (firebaseError) {
                    console.log('Firebase signup failed, using demo mode:', firebaseError.message);
                }
            }
            
        } catch (error) {
            console.error('Sign up error:', error);
            this.showError('signup', this.getErrorMessage(error.code));
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    // Google Sign-Up functionality (same as sign-in for Google)
    async handleGoogleSignUp() {
        return this.handleGoogleSignIn(); // Google handles both sign-in and sign-up
    }

    async handleLogout() {
        // Show confirmation dialog
        const confirmLogout = await this.showLogoutConfirmation();
        if (!confirmLogout) return;
        
        try {
            // Set logout flag to prevent any modal opening
            this.isLoggingOut = true;
            
            // Add loading state to logout button
            const logoutBtn = document.querySelector('.logout-item');
            if (logoutBtn) {
                logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Signing out...</span>';
                logoutBtn.style.pointerEvents = 'none';
            }
            
            // Close any open dropdowns and modals immediately
            this.closeDropdown();
            this.closeModal();
            
            const userMenu = document.getElementById('user-menu');
            if (userMenu) {
                userMenu.classList.remove('active');
            }
            
            // Clear demo user session
            this.currentUser = null;
            localStorage.removeItem('targstar_user');
            
            // Try Firebase signout as fallback
            if (window.auth && auth.currentUser) {
                await auth.signOut();
            }
            
            // Clear local storage
            localStorage.removeItem('targstar_cart');
            localStorage.removeItem('targstar_user_preferences');
            localStorage.removeItem('user-seen-dropdown');
            
            // Log demo analytics event
            this.logDemoEvent('logout');
            
            // Update UI immediately
            this.updateUI(null);
            
            // Show success message
            if (window.showToast) {
                window.showToast('👋 Successfully signed out. See you soon!', 'success');
            }
            
            // Redirect to home if on protected pages
            const protectedPages = ['dashboard', 'orders', 'profile'];
            const currentPage = window.location.pathname.toLowerCase();
            
            if (protectedPages.some(page => currentPage.includes(page))) {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
            
            // Clear logout flag after a delay to allow UI to settle
            setTimeout(() => {
                this.isLoggingOut = false;
            }, 2000);
            
        } catch (error) {
            console.error('Logout error:', error);
            
            // Reset logout flag on error
            this.isLoggingOut = false;
            
            // Reset logout button
            const logoutBtn = document.querySelector('.logout-item');
            if (logoutBtn) {
                logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Sign Out</span>';
                logoutBtn.style.pointerEvents = 'auto';
            }
            
            if (window.showToast) {
                window.showToast('❌ Error signing out. Please try again.', 'error');
            }
        }
    }

    showLogoutConfirmation() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px; text-align: center;">
                    <div class="auth-form">
                        <div style="font-size: 3rem; margin-bottom: 20px;">👋</div>
                        <h2 style="margin-bottom: 15px;">Sign Out?</h2>
                        <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
                            Are you sure you want to sign out? Your progress will be saved.
                        </p>
                        <div style="display: flex; gap: 15px; justify-content: center;">
                            <button id="cancel-logout" style="padding: 12px 25px; background: #f8f9fa; color: #333; border: 2px solid #dee2e6; border-radius: 25px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
                                Cancel
                            </button>
                            <button id="confirm-logout" style="padding: 12px 25px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            const cancelBtn = modal.querySelector('#cancel-logout');
            const confirmBtn = modal.querySelector('#confirm-logout');
            
            const cleanup = () => {
                modal.remove();
                document.body.style.overflow = '';
            };
            
            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });
            
            confirmBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });
            
            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    cleanup();
                    resolve(false);
                }
            });
            
            // Close on Escape key
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', escapeHandler);
                    cleanup();
                    resolve(false);
                }
            };
            document.addEventListener('keydown', escapeHandler);
        });
    }

    updateUI(user) {
        const signInBtn = document.getElementById('sign-in-btn');
        const signUpBtn = document.getElementById('sign-up-btn');
        const signupDropdown = document.querySelector('.signup-dropdown');
        const logoutBtn = document.getElementById('logout-btn');
        const logoutDivider = document.getElementById('logout-divider');
        const signupModalBtn = document.querySelector('.signup-modal-btn');
        const profileBtn = document.querySelector('.profile-btn');
        const dropdownTitle = document.querySelector('.dropdown-title');
        const userMenu = document.getElementById('user-menu');
        const userName = document.getElementById('user-name');

        if (user) {
            // User is signed in
            if (signInBtn) signInBtn.style.display = 'none';
            if (signUpBtn) {
                signUpBtn.innerHTML = `👤 ${user.displayName || user.email.split('@')[0]}`;
                signUpBtn.classList.add('user-logged-in');
                // Add first login indicator for new users
                if (!localStorage.getItem('user-seen-dropdown')) {
                    signUpBtn.classList.add('first-login');
                    localStorage.setItem('user-seen-dropdown', 'true');
                }
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'block';
            }
            if (logoutDivider) logoutDivider.style.display = 'block';
            if (signupModalBtn) {
                signupModalBtn.style.display = 'none'; // Hide signup option when logged in
            }
            if (profileBtn) {
                profileBtn.style.display = 'block'; // Show profile option when logged in
            }
            if (dropdownTitle) {
                dropdownTitle.innerHTML = `👤 ${user.displayName || user.email.split('@')[0]}`;
            }
            
            if (userMenu) {
                userMenu.style.display = 'none'; // Hide old user menu
            }
            
        } else {
            // User is signed out - ensure clean state
            if (signInBtn) signInBtn.style.display = 'block';
            if (signUpBtn) {
                signUpBtn.innerHTML = 'Menu';
                signUpBtn.classList.remove('user-logged-in', 'first-login');
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }
            if (logoutDivider) logoutDivider.style.display = 'none';
            if (signupModalBtn) {
                signupModalBtn.style.display = 'block'; // Show signup option when logged out
            }
            if (profileBtn) {
                profileBtn.style.display = 'none'; // Hide profile option when logged out
            }
            if (dropdownTitle) {
                dropdownTitle.innerHTML = 'Menu';
            }
            if (userMenu) {
                userMenu.style.display = 'none';
                userMenu.classList.remove('welcome', 'active');
                userMenu.innerHTML = ''; // Clear enhanced menu
            }
            
            // Close dropdown if open and ensure clean state
            this.closeDropdown();
            
            // Clear any modal states
            const authModal = document.getElementById('auth-modal');
            if (authModal) {
                authModal.style.display = 'none';
            }
            document.body.style.overflow = ''; // Restore scrolling
            
            // Reinitialize dropdown behavior to ensure it works correctly
            setTimeout(() => {
                this.reinitializeDropdown();
            }, 100);
        }
    }

    createEnhancedUserMenu(user, userMenu) {
        const displayName = user.displayName || user.email.split('@')[0];
        const userInitial = displayName.charAt(0).toUpperCase();
        const userEmail = user.email;
        
        userMenu.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar">${userInitial}</div>
                <div class="user-info">
                    <div id="user-name">${displayName}</div>
                    <div class="user-status">Online</div>
                </div>
                <i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>
            <div class="profile-dropdown">
                <div class="dropdown-header">
                    <div class="dropdown-avatar">${userInitial}</div>
                    <div class="dropdown-user-name">${displayName}</div>
                    <div class="dropdown-user-email">${userEmail}</div>
                </div>
                
                <div class="profile-stats">
                    <div class="stat-item">
                        <span class="stat-number">5</span>
                        <span class="stat-label">Courses</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">12</span>
                        <span class="stat-label">Hours</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">85%</span>
                        <span class="stat-label">Progress</span>
                    </div>
                </div>
                
                <div class="theme-selector">
                    <div class="theme-selector-title">Choose Theme</div>
                    <div class="theme-colors">
                        <div class="theme-color theme-gold active" data-theme="gold" title="Gold Theme"></div>
                        <div class="theme-color theme-blue" data-theme="blue" title="Blue Theme"></div>
                        <div class="theme-color theme-green" data-theme="green" title="Green Theme"></div>
                        <div class="theme-color theme-purple" data-theme="purple" title="Purple Theme"></div>
                        <div class="theme-color theme-orange" data-theme="orange" title="Orange Theme"></div>
                        <div class="theme-color theme-red" data-theme="red" title="Red Theme"></div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <div class="quick-actions-title">Quick Actions</div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="window.location.href='lessons.html'">
                            <i class="fas fa-book"></i> Learn
                        </button>
                        <button class="action-btn" onclick="window.location.href='cart.html'">
                            <i class="fas fa-shopping-cart"></i> Cart
                        </button>
                        <button class="action-btn" onclick="window.location.href='orders.html'">
                            <i class="fas fa-receipt"></i> Orders
                        </button>
                    </div>
                </div>
                
                <div class="dropdown-menu">
                    <a href="dashboard.html" class="dropdown-item">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="lessons.html" class="dropdown-item">
                        <i class="fas fa-graduation-cap"></i>
                        <span>My Courses</span>
                    </a>
                    <a href="orders.html" class="dropdown-item">
                        <i class="fas fa-shopping-bag"></i>
                        <span>Order History</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item" onclick="window.authManager.showProfileSettings(event)">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </a>
                    <a href="#" class="dropdown-item" onclick="window.authManager.showHelpCenter(event)">
                        <i class="fas fa-question-circle"></i>
                        <span>Help Center</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item logout-item" onclick="window.authManager.handleLogout()">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        `;
        
        // Add click handler for dropdown toggle
        const userProfile = userMenu.querySelector('.user-profile');
        if (userProfile) {
            userProfile.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenu.classList.toggle('active');
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
            }
        });
        
        // Add theme selector functionality
        const themeColors = userMenu.querySelectorAll('.theme-color');
        themeColors.forEach(color => {
            color.addEventListener('click', (e) => {
                e.stopPropagation();
                this.changeTheme(color.dataset.theme);
                
                // Update active state
                themeColors.forEach(c => c.classList.remove('active'));
                color.classList.add('active');
            });
        });
        
        // Load saved theme
        this.loadSavedTheme();
        
        // Load user stats
        this.loadUserStats(user);
    }

    changeTheme(themeName) {
        // Remove existing theme classes
        document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-red');
        
        // Add new theme class (except for default gold)
        if (themeName !== 'gold') {
            document.body.classList.add(`theme-${themeName}`);
        }
        
        // Save theme preference
        localStorage.setItem('targstar_theme', themeName);
        
        // Show theme change notification
        if (window.showToast) {
            const themeNames = {
                gold: '🌟 Gold',
                blue: '💙 Blue', 
                green: '💚 Green',
                purple: '💜 Purple',
                orange: '🧡 Orange',
                red: '❤️ Red'
            };
            window.showToast(`Theme changed to ${themeNames[themeName]}!`, 'success');
        }
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('targstar_theme') || 'gold';
        
        // Apply saved theme
        if (savedTheme !== 'gold') {
            document.body.classList.add(`theme-${savedTheme}`);
        }
        
        // Update active theme color in dropdown
        setTimeout(() => {
            const themeColors = document.querySelectorAll('.theme-color');
            themeColors.forEach(color => {
                color.classList.remove('active');
                if (color.dataset.theme === savedTheme) {
                    color.classList.add('active');
                }
            });
        }, 100);
    }

    async loadUserStats(user) {
        try {
            // Use demo user data or try Firebase
            let userData = {};
            
            if (user.enrolledCourses !== undefined) {
                // Demo user data
                userData = {
                    enrolledCourses: user.enrolledCourses || [],
                    completedHours: user.completedHours || 0,
                    averageProgress: user.averageProgress || 0
                };
            } else if (window.db && user.uid) {
                // Try Firebase data
                const doc = await db.collection('users').doc(user.uid).get();
                if (doc.exists) {
                    const firebaseData = doc.data();
                    userData = {
                        enrolledCourses: firebaseData.enrolledCourses || [],
                        completedHours: firebaseData.completedHours || 0,
                        averageProgress: firebaseData.averageProgress || 0
                    };
                }
            }
            
            // Update stats in the dropdown
            const statNumbers = document.querySelectorAll('.stat-number');
            if (statNumbers.length >= 3) {
                statNumbers[0].textContent = userData.enrolledCourses.length;
                statNumbers[1].textContent = Math.round(userData.completedHours);
                statNumbers[2].textContent = Math.round(userData.averageProgress) + '%';
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    // Demo analytics logging
    logDemoEvent(eventName, parameters = {}) {
        console.log('📊 Demo Analytics Event:', eventName, parameters);
        
        // Try real analytics if available
        if (window.FirebaseHelpers && window.FirebaseHelpers.logEvent) {
            window.FirebaseHelpers.logEvent(eventName, parameters);
        }
    }

    showProfileSettings(event) {
        event.preventDefault();
        
        // Create comprehensive settings modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
                <span class="close">&times;</span>
                <div class="settings-container">
                    <div class="settings-header">
                        <div class="settings-avatar">${this.currentUser?.displayName?.charAt(0).toUpperCase() || this.currentUser?.email?.charAt(0).toUpperCase()}</div>
                        <h2>Profile Settings</h2>
                        <p>Manage your account preferences and information</p>
                    </div>
                    
                    <div class="settings-tabs">
                        <button class="tab-btn active" data-tab="profile">
                            <i class="fas fa-user"></i> Profile
                        </button>
                        <button class="tab-btn" data-tab="account">
                            <i class="fas fa-cog"></i> Account
                        </button>
                        <button class="tab-btn" data-tab="preferences">
                            <i class="fas fa-sliders-h"></i> Preferences
                        </button>
                        <button class="tab-btn" data-tab="privacy">
                            <i class="fas fa-shield-alt"></i> Privacy
                        </button>
                        <button class="tab-btn" data-tab="notifications">
                            <i class="fas fa-bell"></i> Notifications
                        </button>
                    </div>
                    
                    <div class="settings-content">
                        <!-- Profile Tab -->
                        <div class="tab-content active" id="profile-tab">
                            <h3><i class="fas fa-user-edit"></i> Personal Information</h3>
                            <form id="profile-form" class="settings-form">
                                <div class="form-group">
                                    <label for="display-name">Display Name</label>
                                    <input type="text" id="display-name" placeholder="Enter your display name" value="${this.currentUser?.displayName || ''}" required>
                                    <small>This name will be visible to other users</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="email">Email Address</label>
                                    <input type="email" id="email" value="${this.currentUser?.email || ''}" disabled>
                                    <small>Email cannot be changed for security reasons</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="bio">Bio</label>
                                    <textarea id="bio" placeholder="Tell us about yourself..." rows="3"></textarea>
                                    <small>Optional: Share a bit about your learning journey</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="location">Location</label>
                                    <input type="text" id="location" placeholder="City, Country">
                                    <small>Optional: Where are you learning from?</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="learning-goals">Learning Goals</label>
                                    <select id="learning-goals" multiple>
                                        <option value="career-change">Career Change</option>
                                        <option value="skill-upgrade">Skill Upgrade</option>
                                        <option value="personal-interest">Personal Interest</option>
                                        <option value="academic">Academic</option>
                                        <option value="entrepreneurship">Entrepreneurship</option>
                                    </select>
                                    <small>Select your primary learning objectives</small>
                                </div>
                                
                                <button type="submit" class="save-btn">
                                    <i class="fas fa-save"></i> Save Profile
                                </button>
                            </form>
                        </div>
                        
                        <!-- Account Tab -->
                        <div class="tab-content" id="account-tab">
                            <h3><i class="fas fa-key"></i> Account Security</h3>
                            
                            <div class="security-section">
                                <h4>Password</h4>
                                <form id="password-form" class="settings-form">
                                    <div class="form-group">
                                        <label for="current-password">Current Password</label>
                                        <input type="password" id="current-password" placeholder="Enter current password">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="new-password">New Password</label>
                                        <input type="password" id="new-password" placeholder="Enter new password">
                                        <small>Minimum 6 characters</small>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="confirm-password">Confirm New Password</label>
                                        <input type="password" id="confirm-password" placeholder="Confirm new password">
                                    </div>
                                    
                                    <button type="submit" class="save-btn">
                                        <i class="fas fa-lock"></i> Update Password
                                    </button>
                                </form>
                            </div>
                            
                            <div class="security-section">
                                <h4>Account Actions</h4>
                                <div class="action-buttons">
                                    <button class="action-btn secondary" onclick="window.authManager.sendPasswordReset()">
                                        <i class="fas fa-envelope"></i> Send Password Reset Email
                                    </button>
                                    <button class="action-btn danger" onclick="window.authManager.showDeleteAccountConfirmation()">
                                        <i class="fas fa-trash"></i> Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Preferences Tab -->
                        <div class="tab-content" id="preferences-tab">
                            <h3><i class="fas fa-palette"></i> Display & Learning Preferences</h3>
                            
                            <div class="preference-section">
                                <h4>Theme</h4>
                                <div class="radio-group">
                                    <label class="radio-option">
                                        <input type="radio" name="theme" value="light" checked>
                                        <span class="radio-custom"></span>
                                        <div class="option-content">
                                            <strong>Light Theme</strong>
                                            <small>Clean and bright interface</small>
                                        </div>
                                    </label>
                                    <label class="radio-option">
                                        <input type="radio" name="theme" value="dark">
                                        <span class="radio-custom"></span>
                                        <div class="option-content">
                                            <strong>Dark Theme</strong>
                                            <small>Easy on the eyes for long sessions</small>
                                        </div>
                                    </label>
                                    <label class="radio-option">
                                        <input type="radio" name="theme" value="auto">
                                        <span class="radio-custom"></span>
                                        <div class="option-content">
                                            <strong>Auto</strong>
                                            <small>Follow system preference</small>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="preference-section">
                                <h4>Language</h4>
                                <select id="language-preference" class="form-control">
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                    <option value="zh">中文</option>
                                    <option value="ja">日本語</option>
                                </select>
                            </div>
                            
                            <div class="preference-section">
                                <h4>Learning Preferences</h4>
                                <div class="checkbox-group">
                                    <label class="checkbox-option">
                                        <input type="checkbox" id="auto-play-videos" checked>
                                        <span class="checkbox-custom"></span>
                                        <div class="option-content">
                                            <strong>Auto-play videos</strong>
                                            <small>Automatically start video lessons</small>
                                        </div>
                                    </label>
                                    
                                    <label class="checkbox-option">
                                        <input type="checkbox" id="show-subtitles">
                                        <span class="checkbox-custom"></span>
                                        <div class="option-content">
                                            <strong>Show subtitles</strong>
                                            <small>Display captions for video content</small>
                                        </div>
                                    </label>
                                    
                                    <label class="checkbox-option">
                                        <input type="checkbox" id="progress-reminders" checked>
                                        <span class="checkbox-custom"></span>
                                        <div class="option-content">
                                            <strong>Progress reminders</strong>
                                            <small>Get reminded to continue learning</small>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <button class="save-btn" onclick="window.authManager.savePreferences()">
                                <i class="fas fa-save"></i> Save Preferences
                            </button>
                        </div>
                        
                        <!-- Privacy Tab -->
                        <div class="tab-content" id="privacy-tab">
                            <h3><i class="fas fa-user-shield"></i> Privacy Settings</h3>
                            
                            <div class="privacy-section">
                                <h4>Profile Visibility</h4>
                                <div class="radio-group">
                                    <label class="radio-option">
                                        <input type="radio" name="profile-visibility" value="public" checked>
                                        <span class="radio-custom"></span>
                                        <div class="option-content">
                                            <strong>Public</strong>
                                            <small>Your profile is visible to all users</small>
                                        </div>
                                    </label>
                                    <label class="radio-option">
                                        <input type="radio" name="profile-visibility" value="private">
                                        <span class="radio-custom"></span>
                                        <div class="option-content">
                                            <strong>Private</strong>
                                            <small>Only you can see your profile</small>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="privacy-section">
                                <h4>Data & Analytics</h4>
                                <div class="checkbox-group">
                                    <label class="checkbox-option">
                                        <input type="checkbox" id="analytics-tracking" checked>
                                        <span class="checkbox-custom"></span>
                                        <div class="option-content">
                                            <strong>Analytics tracking</strong>
                                            <small>Help us improve by sharing usage data</small>
                                        </div>
                                    </label>
                                    
                                    <label class="checkbox-option">
                                        <input type="checkbox" id="personalized-recommendations" checked>
                                        <span class="checkbox-custom"></span>
                                        <div class="option-content">
                                            <strong>Personalized recommendations</strong>
                                            <small>Get course suggestions based on your activity</small>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <button class="save-btn" onclick="window.authManager.savePrivacySettings()">
                                <i class="fas fa-shield-alt"></i> Save Privacy Settings
                            </button>
                        </div>
                        
                        <!-- Notifications Tab -->
                        <div class="tab-content" id="notifications-tab">
                            <h3><i class="fas fa-bell"></i> Notification Preferences</h3>
                            
                            <div class="notification-section">
                                <h4>Email Notifications</h4>
                                <div class="checkbox-group">
                                    <label class="checkbox-option">
                                        <input type="checkbox" id="course-updates" checked>
                                        <span class="checkbox-custom"></span>
                                        <div class="option-content">
                                            <strong>Course updates</strong>
                                            <small>New lessons and course announcements</small>
                                        </div>
                                    </label>
                                    
                                    <label class="checkbox-option">
                                        <input type="checkbox" id="progress-reports" checked>
                                        <span class="checkbox-custom"></span>
                                        <div class="option-content">
                                            <strong>Weekly progress reports</strong>
                                            <small>Summary of your learning activity</small>
                                        </div>
                                    </label>
                                    
                                    <label class="checkbox-option">
                                        <input type="checkbox" id="promotional-emails">
                                        <span class="checkbox-custom"></span>
                                        <div class="option-content">
                                            <strong>Promotional emails</strong>
                                            <small>Special offers and new course announcements</small>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="notification-section">
                                <h4>Push Notifications</h4>
                                <div class="checkbox-group">
                                    <label class="checkbox-option">
                                        <input type="checkbox" id="study-reminders" checked>
                                        <span class="checkbox-custom"></span>
                                        <div class="option-content">
                                            <strong>Study reminders</strong>
                                            <small>Daily reminders to continue learning</small>
                                        </div>
                                    </label>
                                    
                                    <label class="checkbox-option">
                                        <input type="checkbox" id="achievement-notifications" checked>
                                        <span class="checkbox-custom"></span>
                                        <div class="option-content">
                                            <strong>Achievement notifications</strong>
                                            <small>When you complete milestones</small>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <button class="save-btn" onclick="window.authManager.saveNotificationSettings()">
                                <i class="fas fa-bell"></i> Save Notification Settings
                            </button>
                        </div>
                    </div>
                    
                    <div class="settings-footer">
                        <div class="footer-actions">
                            <button class="action-btn secondary" onclick="window.authManager.exportUserData()">
                                <i class="fas fa-download"></i> Export My Data
                            </button>
                            <button class="action-btn danger" onclick="window.authManager.handleLogout()">
                                <i class="fas fa-sign-out-alt"></i> Sign Out
                            </button>
                        </div>
                        <p class="footer-text">
                            Need help? <a href="contact.html" target="_blank">Contact Support</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add settings styles
        this.addSettingsStyles();
        
        // Initialize settings functionality
        this.initializeSettings(modal);
        
        // Load user data
        this.loadUserSettings();
        
        // Close modal handlers
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
    }

    showHelpCenter(event) {
        event.preventDefault();
        // Create help center modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <span class="close">&times;</span>
                <div class="auth-form">
                    <h2>Help Center</h2>
                    <div style="text-align: left; padding: 20px 0;">
                        <h3 style="color: #FFD700; margin-bottom: 15px;">Frequently Asked Questions</h3>
                        
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #333; margin-bottom: 8px;">How do I enroll in a course?</h4>
                            <p style="color: #666; line-height: 1.6;">Browse our courses, click "Add to Cart", then proceed to checkout to enroll.</p>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #333; margin-bottom: 8px;">How do I track my progress?</h4>
                            <p style="color: #666; line-height: 1.6;">Visit your Dashboard to see detailed progress for all enrolled courses.</p>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #333; margin-bottom: 8px;">Can I get a refund?</h4>
                            <p style="color: #666; line-height: 1.6;">Yes, we offer a 30-day money-back guarantee for all courses.</p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="contact.html" style="display: inline-block; padding: 12px 25px; background: linear-gradient(45deg, #FFD700, #FFA500); color: white; text-decoration: none; border-radius: 25px; font-weight: 600;">Contact Support</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Close modal handlers
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
    }

    setLoading(button, loading) {
        if (!button) return;
        
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            button.dataset.originalText = button.textContent;
            button.textContent = 'Loading...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.textContent = button.dataset.originalText || 
                (button.closest('#signin-form') ? 'Sign In' : 'Sign Up');
        }
    }

    showError(formType, message) {
        this.clearMessages();
        const form = document.getElementById(`${formType}-form`);
        if (form) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            form.insertBefore(errorDiv, form.querySelector('form'));
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 5000);
        }
    }

    showSuccess(formType, message) {
        this.clearMessages();
        const form = document.getElementById(`${formType}-form`);
        if (form) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            form.insertBefore(successDiv, form.querySelector('form'));
        }
    }

    clearMessages() {
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
    }

    clearForms() {
        const signinForm = document.getElementById('signin-form');
        const signupForm = document.getElementById('signup-form');
        
        if (signinForm) signinForm.reset();
        if (signupForm) signupForm.reset();
        
        // Clear any loading states
        const buttons = document.querySelectorAll('#auth-modal button[type="submit"]');
        buttons.forEach(btn => this.setLoading(btn, false));
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
            'auth/invalid-credential': 'Invalid login credentials.',
            'auth/user-token-expired': 'Your session has expired. Please sign in again.',
            'auth/requires-recent-login': 'Please sign in again to complete this action.'
        };

        return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
    }

    // Utility methods
    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Password reset functionality
    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            return { success: true, message: 'Password reset email sent!' };
        } catch (error) {
            return { success: false, message: this.getErrorMessage(error.code) };
        }
    }

    // Show forgot password modal
    showForgotPassword() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <span class="close">&times;</span>
                <div class="auth-form">
                    <h2>Reset Password</h2>
                    <p style="color: #666; margin-bottom: 20px; text-align: center;">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <div class="auth-message" id="forgot-message"></div>
                    <form id="forgot-password-form">
                        <input type="email" id="forgot-email" placeholder="Enter your email" required>
                        <button type="submit">Send Reset Link</button>
                    </form>
                    <div style="text-align: center; margin-top: 15px;">
                        <a href="#" onclick="this.closest('.modal').remove(); window.authManager?.openModal('signin')">
                            Back to Sign In
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Handle form submission
        const form = modal.querySelector('#forgot-password-form');
        const emailInput = modal.querySelector('#forgot-email');
        const messageDiv = modal.querySelector('#forgot-message');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            if (!email) {
                this.showForgotMessage(messageDiv, 'Please enter your email address.', 'error');
                return;
            }
            
            if (!this.isValidEmail(email)) {
                this.showForgotMessage(messageDiv, 'Please enter a valid email address.', 'error');
                return;
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            this.setLoading(submitBtn, true);
            
            try {
                if (window.auth) {
                    const result = await this.resetPassword(email);
                    if (result.success) {
                        this.showForgotMessage(messageDiv, result.message, 'success');
                        setTimeout(() => {
                            modal.remove();
                            document.body.style.overflow = '';
                            this.openModal('signin');
                        }, 2000);
                    } else {
                        this.showForgotMessage(messageDiv, result.message, 'error');
                    }
                } else {
                    this.showForgotMessage(messageDiv, 'Password reset is not available in demo mode. Please contact support.', 'error');
                }
            } catch (error) {
                this.showForgotMessage(messageDiv, 'An error occurred. Please try again.', 'error');
            } finally {
                this.setLoading(submitBtn, false);
            }
        });
        
        // Close modal handlers
        const closeBtn = modal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
            document.body.style.overflow = '';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
        
        // Focus on email input
        setTimeout(() => emailInput.focus(), 100);
    }

    showForgotMessage(messageDiv, message, type) {
        messageDiv.innerHTML = message;
        messageDiv.className = `auth-message ${type}`;
        messageDiv.style.display = 'block';
    }

    // Dropdown functionality methods
    toggleDropdown() {
        const signupDropdown = document.querySelector('.signup-dropdown');
        if (signupDropdown) {
            signupDropdown.classList.toggle('active');
        }
    }

    closeDropdown() {
        const signupDropdown = document.querySelector('.signup-dropdown');
        if (signupDropdown) {
            signupDropdown.classList.remove('active');
        }
    }

    logout() {
        this.handleLogout();
        this.closeDropdown();
    }
    
    // Method to reinitialize dropdown behavior after logout
    reinitializeDropdown() {
        const signUpBtn = document.getElementById('sign-up-btn');
        if (signUpBtn) {
            // Remove any existing event listeners by cloning the element
            const newSignUpBtn = signUpBtn.cloneNode(true);
            signUpBtn.parentNode.replaceChild(newSignUpBtn, signUpBtn);
            
            // Add the correct event listener
            newSignUpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Always toggle dropdown, regardless of login status
                this.toggleDropdown();
            });
        }
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check for signin hash in URL (from dashboard redirect)
    if (window.location.hash === '#signin') {
        setTimeout(() => {
            if (window.authManager) {
                window.authManager.openModal('signin');
            }
        }, 1500);
    }
    
    // Wait for Firebase to be ready
    if (typeof firebase !== 'undefined' && firebase.auth) {
        window.authManager = new AuthManager();
        console.log('🔐 Authentication manager initialized');
    } else {
        // Retry after a short delay
        setTimeout(() => {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                window.authManager = new AuthManager();
                console.log('🔐 Authentication manager initialized (delayed)');
            }
        }, 1000);
    }
});
      
// Global fallback function for signup
window.openSignupModal = function() {
    console.log('Global signup function called');
    if (window.authManager) {
        window.authManager.openModal('signup');
    } else {
        console.error('Auth manager not available');
        // Fallback: directly show modal
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'block';
            const signUpForm = document.getElementById('sign-up-form');
            const signInForm = document.getElementById('sign-in-form');
            if (signUpForm && signInForm) {
                signInForm.style.display = 'none';
                signUpForm.style.display = 'block';
            }
        }
    }
};

// Test function to verify signup modal works
window.testSignupModal = function() {
    console.log('Testing signup modal...');
    window.openSignupModal();
};

console.log('🔐 Auth manager global functions loaded');
// Test function to simulate login
window.testLogin = function() {
    console.log('Testing login...');
    const testUser = {
        uid: 'test-user',
        email: 'test@example.com',
        displayName: 'Test User'
    };
    
    if (window.authManager) {
        window.authManager.currentUser = testUser;
        localStorage.setItem('targstar_user', JSON.stringify(testUser));
        window.authManager.updateUI(testUser);
        console.log('Test login completed');
    }
};

// Test function to check logout button visibility
window.checkLogoutButton = function() {
    const logoutBtn = document.getElementById('logout-btn');
    const directLogoutBtn = document.getElementById('direct-logout-btn');
    const signUpBtn = document.getElementById('sign-up-btn');
    
    console.log('=== Logout Button Status ===');
    console.log('Dropdown logout button:', logoutBtn ? 'Found' : 'Not found');
    console.log('Dropdown logout visible:', logoutBtn ? logoutBtn.style.display : 'N/A');
    console.log('Direct logout button:', directLogoutBtn ? 'Found' : 'Not found');
    console.log('Direct logout visible:', directLogoutBtn ? directLogoutBtn.style.display : 'N/A');
    console.log('Signup button text:', signUpBtn ? signUpBtn.innerHTML : 'N/A');
    console.log('Current user:', window.authManager?.currentUser);
    console.log('========================');
};

// Global function to test dropdown functionality
window.testDropdown = function() {
    console.log('=== Testing Dropdown Functionality ===');
    
    if (window.authManager) {
        const result = window.authManager.ensureDropdownWorks();
        if (result) {
            console.log('✅ Dropdown elements found, testing toggle...');
            window.authManager.toggleDropdown();
        } else {
            console.log('❌ Dropdown elements missing');
        }
    } else {
        console.log('❌ AuthManager not found');
    }
    
    console.log('=====================================');
};

// Global function to manually toggle dropdown
window.toggleDropdown = function() {
    if (window.authManager) {
        window.authManager.toggleDropdown();
    } else {
        console.error('AuthManager not available');
    }
};

console.log('🧪 Auth test functions loaded. Use testLogin() and checkLogoutButton() to debug.');
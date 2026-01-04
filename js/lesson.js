// Enhanced Lesson page functionality with demo login
document.addEventListener('DOMContentLoaded', function() {
    // Initialize lesson page
    initializeLessonPage();

    function initializeLessonPage() {
        setupModuleExpansion();
        checkUserEnrollment();
        setupVideoPreview();
        setupRelatedCourses();
        setupScrollAnimations();
        setupProgressTracking();
        setupEnhancedInteractions();
        setupDemoLoginHelper();
        setupCoursePreview();
        setupDemoBanner();
    }

    // Setup demo banner
    function setupDemoBanner() {
        const demoBanner = document.getElementById('demo-banner');
        if (!demoBanner) return;

        // Add body class for styling adjustments
        document.body.classList.add('demo-banner-visible');

        // Close button functionality
        const closeBtn = demoBanner.querySelector('.demo-banner-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                demoBanner.style.animation = 'slideOutUp 0.3s ease-out';
                document.body.classList.remove('demo-banner-visible');
                
                setTimeout(() => {
                    demoBanner.style.display = 'none';
                }, 300);
                
                // Save preference
                localStorage.setItem('demo-banner-dismissed', 'true');
            });
        }

        // Auto-hide after user logs in
        document.addEventListener('userLoggedIn', () => {
            setTimeout(() => {
                if (closeBtn) closeBtn.click();
            }, 2000);
        });

        // Check if previously dismissed
        if (localStorage.getItem('demo-banner-dismissed') === 'true') {
            demoBanner.style.display = 'none';
            document.body.classList.remove('demo-banner-visible');
        }

        // Add slide out animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideOutUp {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(-100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    function setupDemoLoginHelper() {
        const demoHelper = document.getElementById('demo-login-helper');
        if (!demoHelper) return;

        // Show demo helper after 3 seconds if not logged in
        setTimeout(() => {
            if (!window.authManager?.isAuthenticated()) {
                demoHelper.style.display = 'block';
            }
        }, 3000);

        // Close button
        const closeBtn = demoHelper.querySelector('.demo-helper-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                demoHelper.classList.add('hidden');
                setTimeout(() => {
                    demoHelper.style.display = 'none';
                }, 300);
            });
        }

        // Demo account clicks
        const demoAccounts = demoHelper.querySelectorAll('.demo-account');
        demoAccounts.forEach(account => {
            account.addEventListener('click', () => {
                const email = account.dataset.email;
                const password = account.dataset.password;
                
                // Auto-fill and submit login form
                autoLogin(email, password);
                
                // Hide demo helper
                demoHelper.classList.add('hidden');
                setTimeout(() => {
                    demoHelper.style.display = 'none';
                }, 300);
            });
        });

        // Hide when user logs in
        document.addEventListener('userLoggedIn', () => {
            demoHelper.style.display = 'none';
        });
    }

    // Auto login function
    function autoLogin(email, password) {
        // Fill login form
        const emailInput = document.getElementById('signin-email');
        const passwordInput = document.getElementById('signin-password');
        
        if (emailInput && passwordInput) {
            emailInput.value = email;
            passwordInput.value = password;
            
            // Open login modal and submit
            if (window.authManager) {
                window.authManager.openModal('signin');
                
                // Submit after a short delay
                setTimeout(() => {
                    window.authManager.handleSignIn();
                }, 500);
            }
        } else {
            // Direct login if form not available
            if (window.authManager) {
                const demoUser = window.authManager.demoUsers.find(user => 
                    user.email === email && user.password === password
                );
                
                if (demoUser) {
                    window.authManager.currentUser = demoUser;
                    localStorage.setItem('targstar_user', JSON.stringify(demoUser));
                    window.authManager.updateUI(demoUser);
                    
                    if (window.showToast) {
                        window.showToast(`🎉 Welcome, ${demoUser.displayName}!`, 'success');
                    }
                    
                    // Dispatch login event
                    document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: demoUser }));
                }
            }
        }
    }

    // Enhanced course preview setup
    function setupCoursePreview() {
        // Add enrollment status checking
        updateEnrollmentStatus();
        
        // Setup preview interactions
        setupPreviewInteractions();
        
        // Setup course progress display
        setupCourseProgress();
    }

    function updateEnrollmentStatus() {
        const enrollBtns = document.querySelectorAll('.enroll-btn, .enroll-now-btn');
        
        enrollBtns.forEach(btn => {
            if (window.authManager?.isAuthenticated()) {
                const user = window.authManager.getCurrentUser();
                const isEnrolled = user.enrolledCourses?.includes('nlp');
                
                if (isEnrolled) {
                    btn.innerHTML = '<i class="fas fa-play"></i> Continue Learning';
                    btn.classList.add('enrolled');
                    btn.onclick = () => {
                        showCourseContent();
                    };
                } else {
                    btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Enroll Now - $129';
                    btn.onclick = () => {
                        addToCart('NLP Course', 129);
                    };
                }
            }
        });
    }

    function setupPreviewInteractions() {
        // Enhanced preview card interactions
        const previewItems = document.querySelectorAll('.preview-item');
        previewItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            
            item.addEventListener('click', () => {
                if (window.authManager?.isAuthenticated()) {
                    const user = window.authManager.getCurrentUser();
                    if (user.enrolledCourses?.includes('nlp')) {
                        showLessonContent(item.querySelector('span').textContent);
                    } else {
                        showEnrollmentPrompt();
                    }
                } else {
                    showLoginPrompt();
                }
            });
        });
    }

    function setupCourseProgress() {
        if (window.authManager?.isAuthenticated()) {
            const user = window.authManager.getCurrentUser();
            if (user.enrolledCourses?.includes('nlp')) {
                showProgressIndicator(user.averageProgress || 0);
            }
        }
    }

    function showProgressIndicator(progress) {
        const heroSection = document.querySelector('.lesson-hero .container');
        if (heroSection && !document.querySelector('.progress-indicator')) {
            const progressIndicator = document.createElement('div');
            progressIndicator.className = 'progress-indicator';
            progressIndicator.innerHTML = `
                <div class="progress-header">
                    <i class="fas fa-chart-line"></i>
                    <span>Your Progress</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${progress}% Complete</div>
            `;
            
            // Add progress indicator styles
            const style = document.createElement('style');
            style.textContent = `
                .progress-indicator {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 15px;
                    padding: 20px;
                    margin-top: 30px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    animation: fadeInUp 1s ease-out 0.8s both;
                }
                
                .progress-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                    color: #FFD700;
                    font-weight: 600;
                }
                
                .progress-bar {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    height: 8px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }
                
                .progress-fill {
                    background: linear-gradient(90deg, #FFD700, #FFA500);
                    height: 100%;
                    border-radius: 10px;
                    transition: width 1s ease-out;
                    animation: shimmer 2s ease-in-out infinite;
                }
                
                .progress-text {
                    text-align: center;
                    font-size: 0.9rem;
                    opacity: 0.9;
                }
            `;
            document.head.appendChild(style);
            
            heroSection.appendChild(progressIndicator);
        }
    }

    function showLessonContent(lessonTitle) {
        const modal = document.createElement('div');
        modal.className = 'lesson-modal';
        modal.innerHTML = `
            <div class="lesson-modal-content">
                <span class="close-lesson">&times;</span>
                <div class="lesson-container">
                    <div class="lesson-header">
                        <i class="fas fa-play-circle"></i>
                        <h3>${lessonTitle}</h3>
                    </div>
                    <div class="lesson-video">
                        <div class="video-placeholder">
                            <div class="play-button">
                                <i class="fas fa-play"></i>
                            </div>
                            <p>Video content would be displayed here</p>
                        </div>
                    </div>
                    <div class="lesson-content">
                        <h4>Lesson Overview</h4>
                        <p>This lesson covers the fundamentals of ${lessonTitle.toLowerCase()}. You'll learn key concepts, practical applications, and hands-on techniques.</p>
                        
                        <h4>What You'll Learn</h4>
                        <ul>
                            <li>Core concepts and terminology</li>
                            <li>Practical implementation techniques</li>
                            <li>Real-world applications</li>
                            <li>Best practices and common pitfalls</li>
                        </ul>
                        
                        <div class="lesson-actions">
                            <button class="action-btn primary">
                                <i class="fas fa-check"></i> Mark as Complete
                            </button>
                            <button class="action-btn secondary">
                                <i class="fas fa-bookmark"></i> Bookmark
                            </button>
                            <button class="action-btn secondary">
                                <i class="fas fa-share"></i> Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add lesson modal styles
        const style = document.createElement('style');
        style.textContent = `
            .lesson-modal {
                display: block;
                position: fixed;
                z-index: 2000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                animation: fadeIn 0.3s ease-out;
            }
            
            .lesson-modal-content {
                position: relative;
                margin: 2% auto;
                width: 90%;
                max-width: 1000px;
                background: white;
                border-radius: 20px;
                overflow: hidden;
                animation: slideInDown 0.4s ease-out;
            }
            
            .close-lesson {
                position: absolute;
                top: 20px;
                right: 25px;
                font-size: 30px;
                font-weight: bold;
                color: #333;
                cursor: pointer;
                z-index: 1;
                transition: all 0.3s ease;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.1);
            }
            
            .close-lesson:hover {
                background: rgba(0, 0, 0, 0.2);
                transform: scale(1.1);
            }
            
            .lesson-container {
                padding: 0;
            }
            
            .lesson-header {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 30px;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .lesson-header i {
                font-size: 2rem;
                color: #FFD700;
            }
            
            .lesson-header h3 {
                font-size: 1.8rem;
                margin: 0;
            }
            
            .lesson-video {
                background: #f8f9fa;
                padding: 40px;
                text-align: center;
            }
            
            .video-placeholder {
                background: #333;
                border-radius: 15px;
                padding: 60px;
                color: white;
                position: relative;
            }
            
            .play-button {
                width: 80px;
                height: 80px;
                background: rgba(255, 215, 0, 0.2);
                border: 3px solid #FFD700;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .play-button:hover {
                background: rgba(255, 215, 0, 0.3);
                transform: scale(1.1);
            }
            
            .play-button i {
                font-size: 2rem;
                color: #FFD700;
                margin-left: 5px;
            }
            
            .lesson-content {
                padding: 40px;
            }
            
            .lesson-content h4 {
                color: #333;
                margin-bottom: 15px;
                font-size: 1.3rem;
            }
            
            .lesson-content p {
                color: #666;
                line-height: 1.6;
                margin-bottom: 25px;
            }
            
            .lesson-content ul {
                color: #666;
                line-height: 1.8;
                margin-bottom: 30px;
                padding-left: 20px;
            }
            
            .lesson-actions {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .action-btn {
                padding: 12px 20px;
                border: none;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .action-btn.primary {
                background: linear-gradient(45deg, #FFD700, #FFA500);
                color: white;
            }
            
            .action-btn.secondary {
                background: #f8f9fa;
                color: #333;
                border: 2px solid #dee2e6;
            }
            
            .action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.close-lesson');
        closeBtn.addEventListener('click', () => {
            modal.remove();
            style.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                style.remove();
            }
        });
        
        // Play button functionality
        const playBtn = modal.querySelector('.play-button');
        playBtn.addEventListener('click', () => {
            if (window.showToast) {
                window.showToast('🎥 Video would start playing here!', 'info');
            }
        });
    }

    function showEnrollmentPrompt() {
        if (window.showToast) {
            window.showToast('📚 Please enroll in the course to access this content', 'info');
        }
    }

    function showLoginPrompt() {
        if (window.showToast) {
            window.showToast('🔐 Please sign in to access course content', 'info');
        }
        
        // Show demo helper
        const demoHelper = document.getElementById('demo-login-helper');
        if (demoHelper) {
            demoHelper.style.display = 'block';
            demoHelper.classList.remove('hidden');
        }
    }

    function showCourseContent() {
        if (window.showToast) {
            window.showToast('🎓 Redirecting to course dashboard...', 'success');
        }
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    // Enhanced scroll animations
    function setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        const animateElements = document.querySelectorAll('.objective-item, .module-item, .project-card, .stat-item');
        animateElements.forEach(el => {
            el.classList.add('scroll-animate');
            observer.observe(el);
        });
    }

    // Enhanced interactions
    function setupEnhancedInteractions() {
        // Add hover sound effects (optional)
        const interactiveElements = document.querySelectorAll('.enroll-btn, .preview-btn, .module-header, .project-card');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = element.style.transform || '';
                // Add subtle vibration effect on supported devices
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            });
        });

        // Enhanced button interactions
        const enrollButtons = document.querySelectorAll('.enroll-btn, .enroll-now-btn');
        enrollButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Create ripple effect
                createRippleEffect(e, btn);
                
                // Track enrollment interaction
                if (window.gtag) {
                    gtag('event', 'enroll_click', {
                        'course_name': 'NLP Course',
                        'course_price': '129'
                    });
                }
            });
        });
    }

    // Create ripple effect for buttons
    function createRippleEffect(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        // Add ripple animation CSS if not exists
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Enhanced progress tracking
    function setupProgressTracking() {
        // Track scroll progress
        let scrollProgress = 0;
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #FFD700, #FFA500);
            z-index: 9999;
            transition: width 0.3s ease;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            scrollProgress = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollProgress + '%';
        });

        // Track time spent on page
        const startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            if (window.gtag) {
                gtag('event', 'page_engagement', {
                    'engagement_time_msec': timeSpent * 1000,
                    'page_title': 'NLP Course Page'
                });
            }
        });
    }

    // Enhanced module expansion functionality
    function setupModuleExpansion() {
        const moduleHeaders = document.querySelectorAll('.module-header');
        
        moduleHeaders.forEach((header, index) => {
            // Add staggered animation delay
            header.closest('.module-item').style.animationDelay = `${index * 0.1}s`;
            
            header.addEventListener('click', () => {
                const moduleItem = header.closest('.module-item');
                const isExpanded = moduleItem.classList.contains('expanded');
                const moduleContent = moduleItem.querySelector('.module-content');
                
                // Close all other modules with animation
                document.querySelectorAll('.module-item').forEach(m => {
                    if (m !== moduleItem && m.classList.contains('expanded')) {
                        m.classList.remove('expanded');
                        const content = m.querySelector('.module-content');
                        content.style.maxHeight = '0px';
                    }
                });
                
                // Toggle current module with smooth animation
                if (isExpanded) {
                    moduleItem.classList.remove('expanded');
                    moduleContent.style.maxHeight = '0px';
                } else {
                    moduleItem.classList.add('expanded');
                    moduleContent.style.maxHeight = moduleContent.scrollHeight + 'px';
                    
                    // Smooth scroll to module if needed
                    setTimeout(() => {
                        const rect = moduleItem.getBoundingClientRect();
                        if (rect.top < 100) {
                            moduleItem.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'start',
                                inline: 'nearest'
                            });
                        }
                    }, 300);
                }
                
                // Track module interaction
                if (window.gtag) {
                    gtag('event', 'module_interaction', {
                        'module_name': header.querySelector('h3').textContent,
                        'action': isExpanded ? 'collapse' : 'expand'
                    });
                }
            });
            
            // Add keyboard navigation
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                }
            });
            
            // Make headers focusable
            header.setAttribute('tabindex', '0');
            header.setAttribute('role', 'button');
            header.setAttribute('aria-expanded', 'false');
        });

        // Expand first module by default with animation
        const firstModule = document.querySelector('.module-item');
        if (firstModule) {
            setTimeout(() => {
                const header = firstModule.querySelector('.module-header');
                if (header) {
                    header.click();
                }
            }, 500);
        }
    }

    // Check if user is enrolled and show progress
    async function checkUserEnrollment() {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            return;
        }

        try {
            const user = window.authManager.getCurrentUser();
            const doc = await db.collection('users').doc(user.uid).get();
            
            if (doc.exists) {
                const userData = doc.data();
                const enrolledCourses = userData.enrolledCourses || [];
                
                // Check if user is enrolled in this course
                const courseId = getCourseIdFromUrl();
                const enrollment = enrolledCourses.find(course => course.id === courseId);
                
                if (enrollment) {
                    showProgressCard(enrollment.progress || 0);
                    unlockLessons(enrollment.completedLessons || []);
                    updateEnrollButton(true);
                }
            }
        } catch (error) {
            console.error('Error checking enrollment:', error);
        }
    }

    function getCourseIdFromUrl() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return filename.replace('lesson-', '').replace('.html', '');
    }

    function showProgressCard(progress) {
        const progressCard = document.getElementById('progress-card');
        if (progressCard) {
            progressCard.style.display = 'block';
            
            const progressFill = progressCard.querySelector('.progress-fill');
            const progressText = progressCard.querySelector('p');
            
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            
            if (progressText) {
                const totalModules = document.querySelectorAll('.module').length;
                const completedModules = Math.floor((progress / 100) * totalModules);
                progressText.textContent = `${progress}% Complete (${completedModules} of ${totalModules} modules)`;
            }
        }
    }

    function unlockLessons(completedLessons) {
        const lessons = document.querySelectorAll('.lesson');
        
        lessons.forEach((lesson, index) => {
            if (index < completedLessons.length + 3) { // Unlock first 3 lessons + completed ones
                lesson.classList.remove('locked');
                lesson.addEventListener('click', () => {
                    playLesson(lesson);
                });
            }
        });
    }

    function updateEnrollButton(isEnrolled) {
        const enrollBtn = document.querySelector('.enroll-btn');
        if (enrollBtn && isEnrolled) {
            enrollBtn.innerHTML = '<i class="fas fa-play"></i> Continue Learning';
            enrollBtn.onclick = () => {
                // Navigate to learning dashboard or first incomplete lesson
                window.location.href = '#learning-dashboard';
            };
        }
    }

    // Enhanced video preview functionality
    function setupVideoPreview() {
        const videoPlaceholder = document.querySelector('.video-placeholder');
        const previewBtn = document.querySelector('.preview-btn');
        
        // Add click handlers for both preview button and placeholder
        [videoPlaceholder, previewBtn].forEach(element => {
            if (element) {
                element.addEventListener('click', () => {
                    showVideoModal();
                });
            }
        });
        
        // Add preview cards interaction
        const previewItems = document.querySelectorAll('.preview-item');
        previewItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.addEventListener('click', () => {
                showVideoModal();
            });
        });
    }

    function showVideoModal() {
        // Create enhanced video modal
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-content">
                <span class="close-video">&times;</span>
                <div class="video-container">
                    <div class="video-placeholder-large">
                        <div class="video-play-button">
                            <i class="fas fa-play"></i>
                        </div>
                        <h3>NLP Course Preview</h3>
                        <p>Get a glimpse of what you'll learn in our comprehensive Natural Language Processing course.</p>
                        <div class="preview-highlights">
                            <div class="highlight-item">
                                <i class="fas fa-brain"></i>
                                <span>Advanced NLP Techniques</span>
                            </div>
                            <div class="highlight-item">
                                <i class="fas fa-code"></i>
                                <span>Hands-on Python Projects</span>
                            </div>
                            <div class="highlight-item">
                                <i class="fas fa-robot"></i>
                                <span>Build Real Chatbots</span>
                            </div>
                            <div class="highlight-item">
                                <i class="fas fa-certificate"></i>
                                <span>Industry Certification</span>
                            </div>
                        </div>
                        <button class="enroll-now-btn" onclick="addToCart('NLP Course', 129)">
                            <i class="fas fa-shopping-cart"></i>
                            Enroll Now - $129
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add enhanced styles
        const style = document.createElement('style');
        style.textContent = `
            .video-modal {
                display: block;
                position: fixed;
                z-index: 2000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(5px);
                animation: fadeIn 0.3s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .video-modal-content {
                position: relative;
                margin: 3% auto;
                width: 90%;
                max-width: 900px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                overflow: hidden;
                animation: slideInDown 0.4s ease-out;
            }
            
            @keyframes slideInDown {
                from {
                    transform: translateY(-50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .close-video {
                position: absolute;
                top: 20px;
                right: 25px;
                font-size: 30px;
                font-weight: bold;
                color: white;
                cursor: pointer;
                z-index: 1;
                transition: all 0.3s ease;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .close-video:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }
            
            .video-container {
                padding: 0;
            }
            
            .video-placeholder-large {
                min-height: 500px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                text-align: center;
                padding: 60px 40px;
                position: relative;
            }
            
            .video-play-button {
                width: 100px;
                height: 100px;
                background: rgba(255, 215, 0, 0.2);
                border: 3px solid #FFD700;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 30px;
                cursor: pointer;
                transition: all 0.3s ease;
                animation: pulse 2s ease-in-out infinite;
            }
            
            .video-play-button:hover {
                background: rgba(255, 215, 0, 0.3);
                transform: scale(1.1);
            }
            
            .video-play-button i {
                font-size: 2.5rem;
                color: #FFD700;
                margin-left: 5px;
            }
            
            .video-placeholder-large h3 {
                margin-bottom: 15px;
                font-size: 2.2rem;
                background: linear-gradient(45deg, #FFD700, #FFA500);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .video-placeholder-large p {
                margin-bottom: 30px;
                opacity: 0.9;
                font-size: 1.1rem;
                max-width: 500px;
            }
            
            .preview-highlights {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 30px 0;
                max-width: 400px;
            }
            
            .highlight-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                transition: all 0.3s ease;
            }
            
            .highlight-item:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
            }
            
            .highlight-item i {
                color: #FFD700;
                font-size: 1.2rem;
            }
            
            .highlight-item span {
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .enroll-now-btn {
                padding: 15px 30px;
                background: linear-gradient(45deg, #FFD700, #FFA500);
                color: white;
                border: none;
                border-radius: 30px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                margin-top: 20px;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .enroll-now-btn:hover {
                background: linear-gradient(45deg, #FFA500, #FF8C00);
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(255, 165, 0, 0.3);
            }
            
            @media (max-width: 768px) {
                .video-modal-content {
                    margin: 10% auto;
                    width: 95%;
                }
                
                .video-placeholder-large {
                    padding: 40px 20px;
                    min-height: 400px;
                }
                
                .preview-highlights {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
                
                .video-placeholder-large h3 {
                    font-size: 1.8rem;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);

        // Enhanced close modal functionality
        const closeBtn = modal.querySelector('.close-video');
        const playButton = modal.querySelector('.video-play-button');
        
        closeBtn.addEventListener('click', closeModal);
        
        playButton.addEventListener('click', () => {
            // In a real implementation, this would start the video
            showToast('Video preview would start here!', 'info');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', handleKeydown);

        function closeModal() {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
                document.removeEventListener('keydown', handleKeydown);
            }, 300);
        }

        function handleKeydown(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        }

        // Track modal interaction
        if (window.gtag) {
            gtag('event', 'video_preview_open', {
                'course_name': 'NLP Course'
            });
        }
    }

    // Related courses functionality
    function setupRelatedCourses() {
        const relatedCourses = document.querySelectorAll('.related-course');
        
        relatedCourses.forEach(course => {
            course.addEventListener('click', () => {
                const courseName = course.querySelector('h4').textContent;
                
                // Navigate to related course based on name
                const courseMap = {
                    'Deep Learning Mastery': 'lesson-dl.html',
                    'Natural Language Processing': 'lesson-nlp.html',
                    'Computer Vision': 'lesson-cv.html',
                    'AI Ethics and Bias': 'lesson-ethics.html',
                    'Reinforcement Learning': 'lesson-rl.html'
                };
                
                const courseUrl = courseMap[courseName];
                if (courseUrl) {
                    window.location.href = courseUrl;
                }
            });
        });
    }

    // Lesson playback functionality
    function playLesson(lessonElement) {
        const lessonTitle = lessonElement.querySelector('span').textContent;
        
        // Show lesson player modal
        showLessonPlayer(lessonTitle);
        
        // Track lesson progress
        trackLessonProgress(lessonTitle);
    }

    function showLessonPlayer(lessonTitle) {
        window.showToast(`Playing: ${lessonTitle}`, 'info');
        
        // In a real implementation, this would open a video player
        // For demo purposes, we'll show a placeholder
        console.log(`Playing lesson: ${lessonTitle}`);
    }

    async function trackLessonProgress(lessonTitle) {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            return;
        }

        try {
            const user = window.authManager.getCurrentUser();
            const courseId = getCourseIdFromUrl();
            
            // Update user's progress in Firebase
            await db.collection('users').doc(user.uid).update({
                [`courseProgress.${courseId}.lastLesson`]: lessonTitle,
                [`courseProgress.${courseId}.lastAccessed`]: firebase.firestore.FieldValue.serverTimestamp()
            });
            
        } catch (error) {
            console.error('Error tracking lesson progress:', error);
        }
    }

    // Enrollment tracking
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            // Track enrollment attempt
            if (window.trackEvent) {
                window.trackEvent('course_enrollment_attempt', {
                    course: getCourseIdFromUrl(),
                    price: e.target.getAttribute('data-price')
                });
            }
        }
    });

    // Continue learning button functionality
    const continueBtn = document.querySelector('.continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            // Find first incomplete lesson
            const lessons = document.querySelectorAll('.lesson:not(.locked)');
            if (lessons.length > 0) {
                playLesson(lessons[0]);
            }
        });
    }

    // Course rating functionality
    function setupCourseRating() {
        // Add rating widget for enrolled students
        if (window.authManager && window.authManager.isAuthenticated()) {
            // Check if user has completed the course
            checkCourseCompletion().then(isCompleted => {
                if (isCompleted) {
                    showRatingWidget();
                }
            });
        }
    }

    async function checkCourseCompletion() {
        try {
            const user = window.authManager.getCurrentUser();
            const doc = await db.collection('users').doc(user.uid).get();
            
            if (doc.exists) {
                const userData = doc.data();
                const courseId = getCourseIdFromUrl();
                const courseProgress = userData.courseProgress?.[courseId];
                
                return courseProgress?.completed || false;
            }
        } catch (error) {
            console.error('Error checking course completion:', error);
        }
        
        return false;
    }

    function showRatingWidget() {
        const reviewsSection = document.querySelector('.reviews');
        if (reviewsSection) {
            const ratingWidget = document.createElement('div');
            ratingWidget.className = 'rating-widget';
            ratingWidget.innerHTML = `
                <h4>Rate this course</h4>
                <div class="star-rating">
                    <i class="fas fa-star" data-rating="1"></i>
                    <i class="fas fa-star" data-rating="2"></i>
                    <i class="fas fa-star" data-rating="3"></i>
                    <i class="fas fa-star" data-rating="4"></i>
                    <i class="fas fa-star" data-rating="5"></i>
                </div>
                <textarea placeholder="Write your review..."></textarea>
                <button class="submit-rating">Submit Review</button>
            `;
            
            reviewsSection.insertBefore(ratingWidget, reviewsSection.firstChild);
            
            // Add rating functionality
            setupRatingInteraction(ratingWidget);
        }
    }

    function setupRatingInteraction(widget) {
        const stars = widget.querySelectorAll('.star-rating i');
        const textarea = widget.querySelector('textarea');
        const submitBtn = widget.querySelector('.submit-rating');
        let selectedRating = 0;

        stars.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.getAttribute('data-rating'));
                updateStarDisplay(stars, selectedRating);
            });
        });

        submitBtn.addEventListener('click', async () => {
            if (selectedRating === 0) {
                window.showToast('Please select a rating', 'warning');
                return;
            }

            const reviewText = textarea.value.trim();
            if (!reviewText) {
                window.showToast('Please write a review', 'warning');
                return;
            }

            try {
                await submitCourseReview(selectedRating, reviewText);
                window.showToast('Review submitted successfully!', 'success');
                widget.style.display = 'none';
            } catch (error) {
                window.showToast('Failed to submit review', 'error');
            }
        });
    }

    function updateStarDisplay(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#FFD700';
            } else {
                star.style.color = '#ddd';
            }
        });
    }

    async function submitCourseReview(rating, reviewText) {
        const user = window.authManager.getCurrentUser();
        const courseId = getCourseIdFromUrl();
        
        const reviewData = {
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            courseId: courseId,
            rating: rating,
            review: reviewText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('course-reviews').add(reviewData);
    }

    // Initialize additional features
    setupCourseRating();

    console.log('Lesson page initialized successfully!');
});
// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Animate hamburger
            const spans = hamburger.querySelectorAll('span');
            if (hamburger.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Close menu when clicking on a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                
                // Reset hamburger animation
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                
                // Reset hamburger animation
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Course card click handlers
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't navigate if clicking on add to cart button
            if (e.target.classList.contains('add-to-cart')) {
                return;
            }
            
            const courseType = this.getAttribute('data-course');
            if (courseType) {
                window.location.href = `lesson-${courseType}.html`;
            }
        });
    });

    // CTA button functionality
    const ctaBtn = document.querySelector('.cta-btn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            window.location.href = 'lessons.html';
        });
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });

    // Mobile-specific optimizations
    if (window.innerWidth <= 768) {
        // Show floating chat button on mobile
        const floatingChatBtn = document.getElementById('floating-chat-btn');
        if (floatingChatBtn) {
            floatingChatBtn.style.display = 'flex';
            floatingChatBtn.addEventListener('click', () => {
                if (window.chatManager) {
                    window.chatManager.openChat();
                }
            });
        }
        
        // Optimize touch interactions
        document.querySelectorAll('button, .btn, .auth-btn').forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.minWidth = '44px';
        });
        
        // Prevent zoom on input focus for iOS
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.style.fontSize === '' || parseFloat(input.style.fontSize) < 16) {
                input.style.fontSize = '16px';
            }
        });
    }

    // Handle window resize for responsive features
    window.addEventListener('resize', () => {
        const floatingChatBtn = document.getElementById('floating-chat-btn');
        if (floatingChatBtn) {
            if (window.innerWidth <= 768) {
                floatingChatBtn.style.display = 'flex';
            } else {
                floatingChatBtn.style.display = 'none';
            }
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .course-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Form validation helper
    window.validateForm = function(formElement) {
        const inputs = formElement.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }

            // Email validation
            if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    input.classList.add('error');
                    isValid = false;
                }
            }
        });

        return isValid;
    };

    // Loading state helper
    window.setLoadingState = function(button, loading) {
        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    };

    // Toast notification system
    window.showToast = function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Mobile adjustments
        if (window.innerWidth <= 480) {
            toast.style.cssText += `
                right: 10px;
                left: 10px;
                max-width: none;
                top: 80px;
            `;
        }

        // Set background color based on type
        const colors = {
            success: 'linear-gradient(45deg, #00b894, #00a085)',
            error: 'linear-gradient(45deg, #e74c3c, #c0392b)',
            warning: 'linear-gradient(45deg, #f39c12, #e67e22)',
            info: 'linear-gradient(45deg, #3498db, #2980b9)'
        };
        toast.style.background = colors[type] || colors.info;

        document.body.appendChild(toast);

        // Remove after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    };

    function getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Utility function to format currency
    window.formatCurrency = function(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Utility function to format date
    window.formatDate = function(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    };

    // Local storage helper
    window.storage = {
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Error saving to localStorage:', e);
                return false;
            }
        },
        get: function(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Error reading from localStorage:', e);
                return defaultValue;
            }
        },
        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Error removing from localStorage:', e);
                return false;
            }
        }
    };

    // Analytics helper (placeholder for future implementation)
    window.trackEvent = function(eventName, properties = {}) {
        console.log('Event tracked:', eventName, properties);
        // Implement actual analytics tracking here
    };

    // Error handling
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        // You can send this to an error tracking service
    });

    // Performance monitoring
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });

    // Viewport height fix for mobile browsers
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    // Initialize tooltips (if using a tooltip library)
    if (typeof tippy !== 'undefined') {
        tippy('[data-tippy-content]');
    }

    console.log('TARG STAR website initialized successfully!');
});
// Global Toast Notification System
window.showToast = function(message, type = 'info', duration = 4000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    
    // Toast icons
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        </div>
    `;

    // Add styles if not already added
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-notification {
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 10000;
                min-width: 300px;
                max-width: 400px;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                backdrop-filter: blur(10px);
                animation: toastSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 500;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .toast-success {
                background: linear-gradient(135deg, rgba(0, 184, 148, 0.95), rgba(0, 160, 133, 0.95));
                color: white;
                border-left: 4px solid #00b894;
            }
            
            .toast-error {
                background: linear-gradient(135deg, rgba(231, 76, 60, 0.95), rgba(192, 57, 43, 0.95));
                color: white;
                border-left: 4px solid #e74c3c;
            }
            
            .toast-warning {
                background: linear-gradient(135deg, rgba(255, 193, 7, 0.95), rgba(255, 165, 0, 0.95));
                color: #333;
                border-left: 4px solid #ffc107;
            }
            
            .toast-info {
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95));
                color: white;
                border-left: 4px solid #667eea;
            }
            
            .toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .toast-icon {
                font-size: 18px;
                flex-shrink: 0;
            }
            
            .toast-message {
                flex: 1;
                line-height: 1.4;
            }
            
            .toast-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s ease;
                flex-shrink: 0;
            }
            
            .toast-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            @keyframes toastSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes toastSlideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
            
            .toast-notification.toast-exit {
                animation: toastSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @media (max-width: 480px) {
                .toast-notification {
                    left: 20px;
                    right: 20px;
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Add to DOM
    document.body.appendChild(toast);

    // Close button functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });

    // Auto-remove after duration
    setTimeout(() => {
        if (toast.parentNode) {
            removeToast(toast);
        }
    }, duration);

    // Click to dismiss
    toast.addEventListener('click', (e) => {
        if (e.target !== closeBtn) {
            removeToast(toast);
        }
    });

    function removeToast(toastElement) {
        toastElement.classList.add('toast-exit');
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.remove();
            }
        }, 300);
    }
};

// Enhanced Auth Integration
document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth manager to be ready
    const waitForAuth = () => {
        if (window.authManager) {
            console.log('🔐 Auth manager ready on', window.location.pathname);
            
            // Add welcome message for new users
            auth.onAuthStateChanged((user) => {
                if (user) {
                    // Check if this is a new session
                    const lastWelcome = localStorage.getItem('lastWelcome');
                    const now = Date.now();
                    
                    if (!lastWelcome || (now - parseInt(lastWelcome)) > 24 * 60 * 60 * 1000) {
                        setTimeout(() => {
                            const userName = user.displayName || user.email.split('@')[0];
                            window.showToast(`👋 Welcome back, ${userName}!`, 'success');
                            localStorage.setItem('lastWelcome', now.toString());
                        }, 1000);
                    }
                }
            });
        } else {
            setTimeout(waitForAuth, 100);
        }
    };
    
    waitForAuth();
});

// Global utility functions
window.utils = {
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },
    
    // Format date
    formatDate: (date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Copy to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            window.showToast('📋 Copied to clipboard!', 'success');
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            window.showToast('❌ Failed to copy', 'error');
            return false;
        }
    },
    
    // Generate random ID
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    }
};

console.log('🚀 Main.js loaded successfully with enhanced auth integration!');
// Enhanced Add to Cart functionality
window.addToCart = function(itemName, price, image = null) {
    // Ensure cart manager is available
    if (!window.cartManager) {
        console.error('Cart manager not initialized');
        window.showToast('❌ Cart system not ready. Please refresh the page.', 'error');
        return;
    }

    // Create item object
    const item = {
        id: generateItemId(itemName),
        name: itemName,
        price: parseFloat(price),
        image: image || getDefaultCourseImage(itemName),
        quantity: 1,
        addedAt: new Date().toISOString()
    };

    try {
        // Add to cart
        window.cartManager.addToCart(item);
        
        // Show success notification with enhanced UI
        showEnhancedCartNotification(item);
        
        // Track analytics
        if (window.gtag) {
            gtag('event', 'add_to_cart', {
                currency: 'USD',
                value: item.price,
                items: [{
                    item_id: item.id,
                    item_name: item.name,
                    category: 'Course',
                    price: item.price,
                    quantity: 1
                }]
            });
        }
        
        console.log('✅ Item added to cart:', item);
        
    } catch (error) {
        console.error('❌ Error adding to cart:', error);
        window.showToast('❌ Failed to add item to cart. Please try again.', 'error');
    }
};

// Generate consistent item ID
function generateItemId(itemName) {
    return itemName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        + '-course';
}

// Get default course image based on course name
function getDefaultCourseImage(itemName) {
    const courseImages = {
        'nlp': 'images/nlp-course.jpg',
        'machine learning': 'images/ml-course.jpg',
        'deep learning': 'images/dl-course.jpg',
        'computer vision': 'images/cv-course.jpg',
        'artificial intelligence': 'images/ai-course.jpg',
        'data science': 'images/ds-course.jpg'
    };
    
    const courseName = itemName.toLowerCase();
    for (const [key, image] of Object.entries(courseImages)) {
        if (courseName.includes(key)) {
            return image;
        }
    }
    
    return 'images/default-course.jpg';
}

// Enhanced cart notification with better UI
function showEnhancedCartNotification(item) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.cart-notification-enhanced');
    existingNotifications.forEach(notification => notification.remove());

    // Create enhanced notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification-enhanced';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="notification-details">
                <div class="notification-title">Added to Cart!</div>
                <div class="notification-item">${item.name}</div>
                <div class="notification-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="notification-actions">
                <button class="view-cart-btn" onclick="window.location.href='cart.html'">
                    <i class="fas fa-shopping-cart"></i> View Cart
                </button>
                <button class="continue-btn" onclick="closeCartNotification()">
                    Continue Shopping
                </button>
            </div>
        </div>
    `;

    // Add enhanced styles
    const style = document.createElement('style');
    style.id = 'cart-notification-styles-enhanced';
    if (!document.getElementById('cart-notification-styles-enhanced')) {
        style.textContent = `
            .cart-notification-enhanced {
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 10000;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                border: 2px solid #00b894;
                min-width: 350px;
                max-width: 400px;
                animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
            }
            
            .cart-notification-enhanced .notification-content {
                padding: 20px;
            }
            
            .cart-notification-enhanced .notification-icon {
                text-align: center;
                margin-bottom: 15px;
            }
            
            .cart-notification-enhanced .notification-icon i {
                font-size: 2.5rem;
                color: #00b894;
                animation: bounce 0.6s ease-in-out;
            }
            
            .notification-title {
                font-size: 1.2rem;
                font-weight: 600;
                color: #333;
                text-align: center;
                margin-bottom: 8px;
            }
            
            .notification-item {
                font-size: 1rem;
                color: #666;
                text-align: center;
                margin-bottom: 5px;
            }
            
            .notification-price {
                font-size: 1.1rem;
                font-weight: 700;
                color: #FFD700;
                text-align: center;
                margin-bottom: 20px;
            }
            
            .notification-actions {
                display: flex;
                gap: 10px;
            }
            
            .view-cart-btn, .continue-btn {
                flex: 1;
                padding: 12px 16px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                font-size: 0.9rem;
            }
            
            .view-cart-btn {
                background: linear-gradient(45deg, #FFD700, #FFA500);
                color: white;
            }
            
            .view-cart-btn:hover {
                background: linear-gradient(45deg, #FFA500, #FF8C00);
                transform: translateY(-1px);
            }
            
            .continue-btn {
                background: #f8f9fa;
                color: #333;
                border: 2px solid #dee2e6;
            }
            
            .continue-btn:hover {
                background: #e9ecef;
                border-color: #adb5bd;
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
            
            .cart-notification-enhanced.closing {
                animation: slideOutRight 0.3s ease-out;
            }
            
            @media (max-width: 480px) {
                .cart-notification-enhanced {
                    left: 20px;
                    right: 20px;
                    min-width: auto;
                    max-width: none;
                }
                
                .notification-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        closeCartNotification();
    }, 5000);
}

// Close cart notification
window.closeCartNotification = function() {
    const notification = document.querySelector('.cart-notification-enhanced');
    if (notification) {
        notification.classList.add('closing');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }
};

// Enhanced cart count update with animation
function updateCartCountWithAnimation() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement && window.cartManager) {
        const newCount = window.cartManager.getCartItemCount();
        const currentCount = parseInt(cartCountElement.textContent) || 0;
        
        if (newCount !== currentCount) {
            cartCountElement.style.transform = 'scale(1.3)';
            cartCountElement.style.color = '#FFD700';
            cartCountElement.textContent = newCount;
            
            setTimeout(() => {
                cartCountElement.style.transform = 'scale(1)';
                cartCountElement.style.color = '';
            }, 300);
        }
    }
}

// Override cart manager's updateCartCount method
document.addEventListener('DOMContentLoaded', function() {
    // Wait for cart manager to be ready
    const waitForCartManager = () => {
        if (window.cartManager) {
            // Override the updateCartCount method
            const originalUpdateCartCount = window.cartManager.updateCartCount;
            window.cartManager.updateCartCount = function() {
                originalUpdateCartCount.call(this);
                updateCartCountWithAnimation();
            };
            
            console.log('🛒 Enhanced cart functionality loaded!');
        } else {
            setTimeout(waitForCartManager, 100);
        }
    };
    
    waitForCartManager();
});

// Quick add to cart for common courses
window.quickAddCourse = function(courseType) {
    const courses = {
        'nlp': { name: 'NLP Course', price: 129 },
        'ml': { name: 'Machine Learning Course', price: 99 },
        'dl': { name: 'Deep Learning Course', price: 149 },
        'cv': { name: 'Computer Vision Course', price: 119 },
        'ai': { name: 'AI Fundamentals Course', price: 89 },
        'ds': { name: 'Data Science Course', price: 109 }
    };
    
    const course = courses[courseType.toLowerCase()];
    if (course) {
        addToCart(course.name, course.price);
    } else {
        window.showToast('❌ Course not found', 'error');
    }
};

console.log('🛒 Enhanced Add to Cart system loaded successfully!');
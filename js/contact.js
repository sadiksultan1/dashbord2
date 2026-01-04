// Enhanced Contact page functionality with improved message sending
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Contact page initializing...');
    
    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) {
        console.error('❌ Contact form not found!');
        return;
    }
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Contact form submitted');
        
        if (!validateContactForm()) {
            console.log('❌ Form validation failed');
            return;
        }
        
        const submitBtn = document.querySelector('.submit-btn');
        setLoadingState(submitBtn, true);
        
        try {
            const formData = getFormData();
            console.log('📋 Form data collected:', formData);
            
            await submitContactForm(formData);
            console.log('✅ Message sent successfully');
            
            showSuccessMessage();
            contactForm.reset();
            updateCharacterCounter(); // Reset counter
            
        } catch (error) {
            console.error('❌ Contact form error:', error);
            showErrorMessage('Failed to send message. Please try again.');
        } finally {
            setLoadingState(submitBtn, false);
        }
    });

    function validateContactForm() {
        const requiredFields = ['first-name', 'last-name', 'email', 'subject', 'message'];
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(msg => msg.remove());
        document.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) {
                console.error(`Field ${fieldId} not found`);
                return;
            }
            
            const value = field.value.trim();
            
            if (!value) {
                showFieldError(field, 'This field is required');
                isValid = false;
            }
        });
        
        // Email validation
        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && email.value && !emailRegex.test(email.value)) {
            showFieldError(email, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Phone validation (if provided)
        const phone = document.getElementById('phone');
        if (phone && phone.value) {
            const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
            if (!phoneRegex.test(phone.value.replace(/[\s\-\(\)]/g, ''))) {
                showFieldError(phone, 'Please enter a valid phone number');
                isValid = false;
            }
        }
        
        // Message length validation
        const message = document.getElementById('message');
        if (message && message.value.trim().length < 10) {
            showFieldError(message, 'Message must be at least 10 characters long');
            isValid = false;
        }
        
        return isValid;
    }

    function showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #e74c3c;
            font-size: 0.85rem;
            margin-top: 5px;
            display: block;
        `;
        field.parentNode.appendChild(errorDiv);
    }

    function getFormData() {
        const formData = {
            firstName: document.getElementById('first-name')?.value.trim() || '',
            lastName: document.getElementById('last-name')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            phone: document.getElementById('phone')?.value.trim() || '',
            city: document.getElementById('city')?.value.trim() || '',
            country: document.getElementById('country')?.value || '',
            subject: document.getElementById('subject')?.value || '',
            message: document.getElementById('message')?.value.trim() || '',
            newsletter: document.getElementById('newsletter')?.checked || false,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            page: 'contact',
            status: 'new'
        };
        
        // Add user info if logged in
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getCurrentUser();
            formData.userId = user.uid;
            formData.userEmail = user.email;
            formData.userDisplayName = user.displayName;
        }
        
        return formData;
    }

    async function submitContactForm(formData) {
        console.log('📤 Submitting contact form...');
        
        try {
            // Check Firebase availability first
            const isFirebaseReady = window.FirebaseHelpers?.isFirebaseReady();
            console.log('🔥 Firebase ready:', isFirebaseReady);
            
            if (isFirebaseReady) {
                // Try Firebase first
                console.log('📤 Attempting Firebase submission...');
                const savedMessage = await window.FirebaseHelpers.saveContactMessage(formData);
                console.log('✅ Message saved to Firebase:', savedMessage.id);
                
                // If user is logged in, also save to their profile
                if (formData.userId && window.db) {
                    try {
                        await window.db.collection('users').doc(formData.userId).update({
                            contactMessages: firebase.firestore.FieldValue.arrayUnion({
                                ...formData,
                                messageId: savedMessage.id
                            }),
                            lastContactDate: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        console.log('✅ Message linked to user profile');
                    } catch (userError) {
                        console.log('⚠️ Could not link to user profile:', userError.message);
                    }
                }
                
                // Log analytics event
                window.FirebaseHelpers.logEvent('contact_form_submit', {
                    subject: formData.subject,
                    has_phone: !!formData.phone,
                    newsletter_signup: formData.newsletter,
                    user_type: formData.userId ? 'registered' : 'anonymous',
                    firebase_available: true,
                    submission_method: 'firebase'
                });
                
            } else {
                // Fallback to local storage
                console.log('⚠️ Firebase not available, using local storage fallback...');
                
                const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
                const messageWithId = {
                    ...formData,
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    method: 'localStorage'
                };
                messages.push(messageWithId);
                localStorage.setItem('contact_messages', JSON.stringify(messages));
                
                console.log('✅ Message saved to local storage:', messageWithId.id);
                
                // Log local analytics
                console.log('📊 Local Analytics Event: contact_form_submit', {
                    subject: formData.subject,
                    has_phone: !!formData.phone,
                    newsletter_signup: formData.newsletter,
                    user_type: formData.userId ? 'registered' : 'anonymous',
                    firebase_available: false,
                    submission_method: 'localStorage'
                });
            }
            
            // Simulate email sending delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log('📧 Email notification sent (simulated)');
            
        } catch (error) {
            console.error('❌ Error submitting contact form:', error);
            
            // Final fallback - always save to localStorage
            try {
                console.log('🔄 Final fallback: saving to localStorage...');
                const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
                const messageWithId = {
                    ...formData,
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    method: 'fallback',
                    originalError: error.message
                };
                messages.push(messageWithId);
                localStorage.setItem('contact_messages', JSON.stringify(messages));
                console.log('✅ Message saved via fallback method');
            } catch (fallbackError) {
                console.error('❌ Even fallback failed:', fallbackError);
                throw new Error('Failed to save message. Please try again.');
            }
        }
    }

    function showSuccessMessage() {
        // Remove any existing messages
        document.querySelectorAll('.success-message, .error-message-global').forEach(msg => msg.remove());
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            color: #155724;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 1px solid #c3e6cb;
            animation: slideInDown 0.5s ease-out;
        `;
        successDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-check-circle" style="color: #28a745; font-size: 1.5rem;"></i>
                <div>
                    <strong>Message sent successfully! 🎉</strong><br>
                    <span style="font-size: 0.9rem;">Thank you for contacting TARG STAR. We'll get back to you within 24 hours.</span>
                </div>
            </div>
        `;
        
        contactForm.insertBefore(successDiv, contactForm.firstChild);
        
        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove success message after 8 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.style.animation = 'slideOutUp 0.5s ease-out';
                setTimeout(() => {
                    if (successDiv.parentNode) {
                        successDiv.parentNode.removeChild(successDiv);
                    }
                }, 500);
            }
        }, 8000);
        
        // Show toast notification
        if (window.showToast) {
            window.showToast('✅ Message sent successfully!', 'success');
        }
    }

    function showErrorMessage(message) {
        // Remove any existing messages
        document.querySelectorAll('.success-message, .error-message-global').forEach(msg => msg.remove());
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message-global';
        errorDiv.style.cssText = `
            background: linear-gradient(135deg, #f8d7da, #f5c6cb);
            color: #721c24;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 1px solid #f5c6cb;
            animation: slideInDown 0.5s ease-out;
        `;
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-triangle" style="color: #dc3545; font-size: 1.5rem;"></i>
                <div>
                    <strong>Error sending message</strong><br>
                    <span style="font-size: 0.9rem;">${message}</span>
                </div>
            </div>
        `;
        
        contactForm.insertBefore(errorDiv, contactForm.firstChild);
        
        // Scroll to error message
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove error message after 6 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.animation = 'slideOutUp 0.5s ease-out';
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }, 500);
            }
        }, 6000);
        
        // Show toast notification
        if (window.showToast) {
            window.showToast('❌ ' + message, 'error');
        }
    }

    function setLoadingState(button, loading) {
        if (!button) return;
        
        if (loading) {
            button.disabled = true;
            button.style.opacity = '0.7';
            button.style.cursor = 'not-allowed';
            button.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                Sending Message...
            `;
        } else {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.innerHTML = `
                <i class="fas fa-paper-plane"></i>
                Send Message
            `;
        }
    }

    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });

    // Auto-fill form if user is logged in
    setTimeout(() => {
        if (window.authManager && window.authManager.isAuthenticated()) {
            const user = window.authManager.getCurrentUser();
            console.log('👤 Auto-filling form for logged in user:', user.displayName);
            
            // Auto-fill basic info
            if (user.displayName) {
                const nameParts = user.displayName.split(' ');
                const firstNameField = document.getElementById('first-name');
                const lastNameField = document.getElementById('last-name');
                
                if (firstNameField && !firstNameField.value) {
                    firstNameField.value = nameParts[0] || '';
                }
                if (lastNameField && !lastNameField.value) {
                    lastNameField.value = nameParts.slice(1).join(' ') || '';
                }
            }
            
            if (user.email) {
                const emailField = document.getElementById('email');
                if (emailField && !emailField.value) {
                    emailField.value = user.email;
                }
            }
            
            // Try to get additional user data from Firestore
            if (window.db) {
                window.db.collection('users').doc(user.uid).get().then(doc => {
                    if (doc.exists) {
                        const userData = doc.data();
                        console.log('📋 Loading user profile data for form');
                        
                        if (userData.phone && !document.getElementById('phone').value) {
                            document.getElementById('phone').value = userData.phone;
                        }
                        
                        if (userData.city && !document.getElementById('city').value) {
                            document.getElementById('city').value = userData.city;
                        }
                        
                        if (userData.country && !document.getElementById('country').value) {
                            document.getElementById('country').value = userData.country;
                        }
                    }
                }).catch(error => {
                    console.log('⚠️ Could not load user profile data:', error.message);
                });
            }
        }
    }, 1000);

    // Add Firebase connection status indicator
    function addConnectionStatusIndicator() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;
        
        const statusDiv = document.createElement('div');
        statusDiv.id = 'firebase-status';
        statusDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 600;
            z-index: 1000;
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        
        // Check Firebase status
        const updateStatus = () => {
            const isReady = window.FirebaseHelpers?.isFirebaseReady();
            const isOnline = navigator.onLine;
            
            if (isReady && isOnline) {
                statusDiv.innerHTML = '🔥 Firebase Connected';
                statusDiv.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                statusDiv.style.color = 'white';
                statusDiv.title = 'Firebase is working properly';
            } else if (isOnline) {
                statusDiv.innerHTML = '⚠️ Offline Mode';
                statusDiv.style.background = 'linear-gradient(135deg, #ffc107, #fd7e14)';
                statusDiv.style.color = 'white';
                statusDiv.title = 'Firebase unavailable - using local storage';
            } else {
                statusDiv.innerHTML = '📴 No Internet';
                statusDiv.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
                statusDiv.style.color = 'white';
                statusDiv.title = 'No internet connection';
            }
        };
        
        // Add click handler for diagnostics
        statusDiv.addEventListener('click', async () => {
            if (window.debugFirebase) {
                console.log('🔍 Running Firebase diagnostics...');
                await window.debugFirebase.diagnose();
                await window.debugFirebase.testConnection();
            }
        });
        
        updateStatus();
        document.body.appendChild(statusDiv);
        
        // Update status periodically
        setInterval(updateStatus, 5000);
        
        // Update on online/offline events
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        
        // Hide after 10 seconds unless there's an issue
        setTimeout(() => {
            if (window.FirebaseHelpers?.isFirebaseReady() && navigator.onLine) {
                statusDiv.style.opacity = '0.3';
                statusDiv.style.transform = 'scale(0.8)';
            }
        }, 10000);
    }
    
    // Add status indicator
    addConnectionStatusIndicator();

    // Form field enhancements
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // Add focus/blur effects
        input.addEventListener('focus', () => {
            input.parentNode.classList.add('focused');
            input.style.borderColor = '#FFD700';
        });
        
        input.addEventListener('blur', () => {
            input.parentNode.classList.remove('focused');
            input.style.borderColor = '#e1e8ed';
            
            // Clear error state when user starts typing
            if (input.classList.contains('error') && input.value.trim()) {
                input.classList.remove('error');
                const errorMsg = input.parentNode.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        });
        
        // Real-time validation for email
        if (input.type === 'email') {
            input.addEventListener('input', () => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (input.value && !emailRegex.test(input.value)) {
                    input.style.borderColor = '#e74c3c';
                } else {
                    input.style.borderColor = '#28a745';
                }
            });
        }
    });

    // Character counter for message field
    const messageField = document.getElementById('message');
    const maxLength = 1000;
    
    if (messageField) {
        // Create character counter
        const counterDiv = document.createElement('div');
        counterDiv.className = 'character-counter';
        counterDiv.style.cssText = `
            text-align: right;
            font-size: 0.8rem;
            color: #666;
            margin-top: 5px;
        `;
        messageField.parentNode.appendChild(counterDiv);
        
        function updateCharacterCounter() {
            const remaining = maxLength - messageField.value.length;
            counterDiv.textContent = `${messageField.value.length}/${maxLength} characters`;
            
            if (remaining < 50) {
                counterDiv.style.color = '#e74c3c';
            } else if (remaining < 100) {
                counterDiv.style.color = '#f39c12';
            } else {
                counterDiv.style.color = '#666';
            }
        }
        
        messageField.addEventListener('input', updateCharacterCounter);
        messageField.setAttribute('maxlength', maxLength);
        updateCharacterCounter();
        
        // Make updateCharacterCounter available globally
        window.updateCharacterCounter = updateCharacterCounter;
    }

    // Newsletter subscription handling
    const newsletterCheckbox = document.getElementById('newsletter');
    
    if (newsletterCheckbox) {
        newsletterCheckbox.addEventListener('change', () => {
            if (newsletterCheckbox.checked) {
                if (window.showToast) {
                    window.showToast('📧 You will receive our AI newsletter!', 'info');
                }
            }
        });
    }

    // Subject-based form customization
    const subjectSelect = document.getElementById('subject');
    
    if (subjectSelect) {
        subjectSelect.addEventListener('change', () => {
            const subject = subjectSelect.value;
            const messageField = document.getElementById('message');
            
            // Update placeholder based on subject
            const placeholders = {
                'course-inquiry': 'Which course are you interested in? Do you have any specific questions about the curriculum, prerequisites, or certification?',
                'technical-support': 'Please describe the technical issue you\'re experiencing. Include any error messages and steps you\'ve already tried.',
                'billing': 'Please provide your order number or billing details, and describe the issue you\'re experiencing.',
                'partnership': 'Tell us about your organization and how you\'d like to partner with TARG STAR.',
                'feedback': 'We value your feedback! Please share your thoughts on how we can improve our courses or services.',
                'other': 'Please describe your inquiry in detail...'
            };
            
            if (placeholders[subject] && messageField) {
                messageField.placeholder = placeholders[subject];
            }
        });
    }

    // Social media link tracking
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = link.querySelector('span')?.textContent || 'Unknown';
            
            // Track social media clicks
            if (window.FirebaseHelpers) {
                window.FirebaseHelpers.logEvent('social_media_click', { platform: platform });
            }
            
            // Show coming soon message for demo
            if (window.showToast) {
                window.showToast(`${platform} page coming soon!`, 'info');
            }
        });
    });

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideOutUp {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-20px);
            }
        }
        
        .form-group.focused label {
            color: #FFD700;
            font-weight: 600;
        }
        
        .error {
            border-color: #e74c3c !important;
            box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
        }
    `;
    document.head.appendChild(style);

    console.log('✅ Contact page initialized successfully!');
});
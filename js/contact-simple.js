// Simplified Contact Form Handler
console.log('📝 Loading simple contact form handler...');

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) {
        console.error('❌ Contact form not found');
        return;
    }
    
    console.log('✅ Contact form found, setting up handler...');
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📤 Form submitted');
        
        // Get form data
        const formData = {
            firstName: document.getElementById('first-name')?.value || '',
            lastName: document.getElementById('last-name')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            city: document.getElementById('city')?.value || '',
            country: document.getElementById('country')?.value || '',
            subject: document.getElementById('subject')?.value || '',
            message: document.getElementById('message')?.value || '',
            newsletter: document.getElementById('newsletter')?.checked || false,
            timestamp: new Date().toISOString()
        };
        
        console.log('📋 Form data:', formData);
        
        // Validate required fields
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
            showMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        // Show loading
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Try to save message
            let result;
            if (window.SimpleFirebase && window.SimpleFirebase.isReady()) {
                console.log('🔥 Using Firebase to save message...');
                result = await window.SimpleFirebase.saveMessage(formData);
            } else {
                console.log('💾 Using localStorage to save message...');
                const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
                result = {
                    ...formData,
                    id: Date.now().toString(),
                    method: 'localStorage'
                };
                messages.push(result);
                localStorage.setItem('contact_messages', JSON.stringify(messages));
            }
            
            console.log('✅ Message saved:', result);
            
            // Show success message
            showMessage('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
            
            // Reset form
            contactForm.reset();
            
        } catch (error) {
            console.error('❌ Error sending message:', error);
            showMessage('Error sending message. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    function showMessage(text, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.innerHTML = text;
        
        // Style the message
        messageDiv.style.cssText = `
            padding: 15px;
            margin: 15px 0;
            border-radius: 8px;
            font-weight: 600;
            ${type === 'success' 
                ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
                : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
            }
        `;
        
        // Insert message at top of form
        contactForm.insertBefore(messageDiv, contactForm.firstChild);
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove message after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
    
    console.log('✅ Contact form handler ready');
});

// Add connection status indicator
function addStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'connection-status';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        z-index: 1000;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    function updateStatus() {
        const isFirebaseReady = window.SimpleFirebase?.isReady();
        const isOnline = navigator.onLine;
        
        if (isFirebaseReady && isOnline) {
            indicator.innerHTML = '🔥 Firebase Ready';
            indicator.style.background = '#28a745';
            indicator.style.color = 'white';
        } else if (isOnline) {
            indicator.innerHTML = '💾 Local Storage';
            indicator.style.background = '#ffc107';
            indicator.style.color = 'black';
        } else {
            indicator.innerHTML = '📴 Offline';
            indicator.style.background = '#dc3545';
            indicator.style.color = 'white';
        }
    }
    
    // Add click handler for status info
    indicator.addEventListener('click', () => {
        if (window.SimpleFirebase) {
            const status = window.SimpleFirebase.getStatus();
            console.log('📊 Firebase Status:', status);
            console.table(status);
        }
    });
    
    updateStatus();
    document.body.appendChild(indicator);
    
    // Update status every 5 seconds
    setInterval(updateStatus, 5000);
    
    // Update on network changes
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    
    // Hide after 8 seconds if everything is working
    setTimeout(() => {
        if (window.SimpleFirebase?.isReady() && navigator.onLine) {
            indicator.style.opacity = '0.3';
            indicator.style.transform = 'scale(0.8)';
        }
    }, 8000);
}

// Add status indicator when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addStatusIndicator);
} else {
    addStatusIndicator();
}

console.log('📝 Simple contact form handler loaded');
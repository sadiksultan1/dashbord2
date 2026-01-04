// Cart page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    let appliedPromoCode = null;
    let promoDiscount = 0;

    // Initialize cart page
    initializeCartPage();

    function initializeCartPage() {
        renderCartItems();
        updateCartSummary();
        setupEventListeners();
    }

    function setupEventListeners() {
        // Clear cart button
        document.getElementById('clear-cart').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                window.cartManager.clearCart();
                renderCartItems();
                updateCartSummary();
                window.showToast('Cart cleared successfully', 'info');
            }
        });

        // Promo code application
        document.getElementById('apply-promo').addEventListener('click', applyPromoCode);
        document.getElementById('promo-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyPromoCode();
            }
        });

        // Checkout button
        document.getElementById('checkout-btn').addEventListener('click', startCheckout);

        // Recommended items
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-recommended')) {
                const item = e.target.getAttribute('data-item');
                const price = parseFloat(e.target.getAttribute('data-price'));
                
                window.cartManager.addToCart({
                    id: window.cartManager.generateId(item),
                    name: item,
                    price: price,
                    image: 'images/default-course.jpg',
                    quantity: 1
                });
                
                renderCartItems();
                updateCartSummary();
                window.showToast('Item added to cart!', 'success');
            }
        });

        // Checkout modal steps
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('next-step-btn')) {
                const nextStep = parseInt(e.target.getAttribute('data-next'));
                goToStep(nextStep);
            }
            
            if (e.target.classList.contains('prev-step-btn')) {
                const prevStep = parseInt(e.target.getAttribute('data-prev'));
                goToStep(prevStep);
            }
        });

        // Payment method selection in checkout
        document.addEventListener('change', (e) => {
            if (e.target.name === 'checkout-payment') {
                updateCheckoutPaymentDetails();
            }
        });

        // Close checkout modal
        document.querySelector('#checkout-modal .close').addEventListener('click', () => {
            const modal = document.getElementById('checkout-modal');
            const modalContent = modal.querySelector('.modal-content');
            
            // Add exit animation
            if (modalContent) {
                modalContent.style.transition = 'all 0.3s ease';
                modalContent.style.opacity = '0';
                modalContent.style.transform = 'scale(0.9) translateY(-20px)';
                
                setTimeout(() => {
                    modal.style.display = 'none';
                    currentStep = 1;
                    
                    // Reset modal content
                    modalContent.style.opacity = '1';
                    modalContent.style.transform = 'scale(1) translateY(0)';
                }, 300);
            } else {
                modal.style.display = 'none';
                currentStep = 1;
            }
        });

        // Close modal when clicking outside
        document.getElementById('checkout-modal').addEventListener('click', (e) => {
            if (e.target.id === 'checkout-modal') {
                document.querySelector('#checkout-modal .close').click();
            }
        });
    }

    function renderCartItems() {
        const container = document.getElementById('cart-items');
        const cart = window.cartManager.getCart();

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Browse our courses and add them to your cart to get started.</p>
                    <a href="lessons.html" class="cta-btn">Browse Courses</a>
                </div>
            `;
            document.getElementById('checkout-btn').disabled = true;
            return;
        }

        document.getElementById('checkout-btn').disabled = false;

        const cartHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvdXJzZTwvdGV4dD48L3N2Zz4='">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-btn" onclick="removeCartItem('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        container.innerHTML = cartHTML;
    }

    function updateCartSummary() {
        const cart = window.cartManager.getCart();
        const subtotal = window.cartManager.getCartTotal();
        const itemCount = window.cartManager.getCartItemCount();
        
        // Apply promo discount
        const discount = subtotal * promoDiscount;
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.1; // 10% tax
        const total = afterDiscount + tax;

        document.getElementById('item-count').textContent = itemCount;
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('discount').textContent = discount > 0 ? `-$${discount.toFixed(2)}` : '$0.00';
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }

    function applyPromoCode() {
        const promoInput = document.getElementById('promo-input');
        const code = promoInput.value.trim().toUpperCase();

        if (!code) {
            window.showToast('Please enter a promo code', 'warning');
            return;
        }

        // Predefined promo codes
        const promoCodes = {
            'WELCOME10': { discount: 0.1, description: '10% off your first order' },
            'STUDENT20': { discount: 0.2, description: '20% student discount' },
            'SAVE15': { discount: 0.15, description: '15% off all courses' },
            'NEWUSER': { discount: 0.25, description: '25% off for new users' },
            'TARG50': { discount: 0.5, description: '50% off special offer' }
        };

        if (promoCodes[code]) {
            if (appliedPromoCode === code) {
                window.showToast('This promo code is already applied', 'info');
                return;
            }

            appliedPromoCode = code;
            promoDiscount = promoCodes[code].discount;
            
            updateCartSummary();
            promoInput.value = '';
            
            window.showToast(`Promo code applied! ${promoCodes[code].description}`, 'success');
            
            // Visual feedback
            const applyBtn = document.getElementById('apply-promo');
            applyBtn.textContent = 'Applied!';
            applyBtn.style.background = '#00b894';
            
            setTimeout(() => {
                applyBtn.textContent = 'Apply';
                applyBtn.style.background = '';
            }, 2000);
            
        } else {
            window.showToast('Invalid promo code', 'error');
            promoInput.focus();
        }
    }

    function startCheckout() {
        const cart = window.cartManager.getCart();
        
        if (cart.length === 0) {
            window.showToast('🛒 Your cart is empty! Add some courses first.', 'warning');
            return;
        }

        // Check if user is authenticated for better experience
        if (window.authManager && !window.authManager.isAuthenticated()) {
            const shouldContinue = confirm('💡 Sign in for a better checkout experience?\n\n✅ Save your order history\n✅ Faster future checkouts\n✅ Access course dashboard\n\nClick OK to sign in, or Cancel to continue as guest.');
            
            if (shouldContinue) {
                // Show sign in modal
                const authModal = document.getElementById('auth-modal');
                if (authModal) {
                    authModal.style.display = 'block';
                    return;
                }
            }
        }

        // Show checkout modal with enhanced animation
        const checkoutModal = document.getElementById('checkout-modal');
        if (checkoutModal) {
            checkoutModal.style.display = 'block';
            
            // Add entrance animation
            const modalContent = checkoutModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.opacity = '0';
                modalContent.style.transform = 'scale(0.9) translateY(-20px)';
                
                setTimeout(() => {
                    modalContent.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    modalContent.style.opacity = '1';
                    modalContent.style.transform = 'scale(1) translateY(0)';
                }, 50);
            }
        }
        
        currentStep = 1;
        goToStep(1);
        populateCheckoutReview();
        
        // Track checkout start
        console.log('🛒 Checkout started with', cart.length, 'items');
        window.showToast('🚀 Starting checkout process...', 'info');
    }

    function goToStep(step) {
        // Validate current step before proceeding
        if (currentStep === 1 && step === 2) {
            const cart = window.cartManager?.getCart() || [];
            if (cart.length === 0) {
                window.showToast('🛒 Your cart is empty. Add some courses first!', 'error');
                return;
            }
        }
        
        if (currentStep === 2 && step === 3) {
            const selectedPayment = document.querySelector('input[name="checkout-payment"]:checked');
            if (!selectedPayment) {
                window.showToast('💳 Please select a payment method to continue', 'warning');
                
                // Highlight payment methods
                const paymentGrid = document.querySelector('.payment-methods-grid');
                if (paymentGrid) {
                    paymentGrid.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                        paymentGrid.style.animation = '';
                    }, 500);
                }
                return;
            }
        }

        // Hide all steps
        document.querySelectorAll('.checkout-step').forEach(stepEl => {
            stepEl.style.display = 'none';
        });

        // Remove active class from all step indicators
        document.querySelectorAll('.step').forEach(stepEl => {
            stepEl.classList.remove('active');
        });

        // Show current step with animation
        const currentStepEl = document.getElementById(`step-${step}`);
        const stepIndicator = document.querySelector(`[data-step="${step}"]`);
        
        if (currentStepEl && stepIndicator) {
            currentStepEl.style.display = 'block';
            stepIndicator.classList.add('active');
            
            // Add entrance animation
            currentStepEl.style.opacity = '0';
            currentStepEl.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                currentStepEl.style.transition = 'all 0.3s ease';
                currentStepEl.style.opacity = '1';
                currentStepEl.style.transform = 'translateY(0)';
            }, 50);
        }

        currentStep = step;

        // Handle step-specific logic
        if (step === 1) {
            populateCheckoutReview();
        } else if (step === 2) {
            enhancePaymentLayout();
            updateCheckoutPaymentDetails();
        } else if (step === 3) {
            processOrder();
        }
        
        // Update progress indicator
        updateProgressIndicator(step);
    }

    function populateCheckoutReview() {
        const cart = window.cartManager.getCart();
        const container = document.getElementById('checkout-items-review');
        
        // Update item count badge
        const itemCountBadge = document.getElementById('review-item-count');
        if (itemCountBadge) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            itemCountBadge.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
        }
        
        // Create items HTML with enhanced styling
        const itemsHTML = cart.map(item => `
            <div class="checkout-item">
                <div class="checkout-item-image">
                    ${item.name.split(' ').map(word => word[0]).join('').substring(0, 3)}
                </div>
                <div class="checkout-item-details">
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-meta">
                        <span class="checkout-item-quantity">Qty: ${item.quantity}</span>
                        <span class="checkout-item-price">$${item.price.toFixed(2)} each</span>
                    </div>
                </div>
                <div class="checkout-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');

        // Find the container after the header
        const headerElement = container.querySelector('.review-header');
        if (headerElement) {
            // Remove existing items
            const existingItems = container.querySelectorAll('.checkout-item');
            existingItems.forEach(item => item.remove());
            
            // Insert new items after header
            headerElement.insertAdjacentHTML('afterend', itemsHTML);
        } else {
            // Fallback: replace entire container content
            container.innerHTML = `
                <div class="review-header">
                    <h3>Order Items<span class="item-count-badge">${cart.reduce((sum, item) => sum + item.quantity, 0)} items</span></h3>
                </div>
                ${itemsHTML}
            `;
        }

        // Update totals with enhanced styling
        const subtotal = window.cartManager.getCartTotal();
        const discount = subtotal * promoDiscount;
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.1;
        const total = afterDiscount + tax;

        // Update all total elements
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = `$${value.toFixed(2)}`;
        };

        updateElement('review-subtotal', subtotal);
        updateElement('review-tax', tax);
        updateElement('checkout-total', total);

        // Handle discount display
        const discountLine = document.getElementById('review-discount-line');
        const discountElement = document.getElementById('review-discount');
        const savingsHighlight = document.getElementById('savings-highlight');
        const savingsText = document.getElementById('savings-text');

        if (discount > 0) {
            if (discountLine) discountLine.style.display = 'flex';
            if (discountElement) discountElement.textContent = `-$${discount.toFixed(2)}`;
            if (savingsHighlight) savingsHighlight.style.display = 'flex';
            if (savingsText) savingsText.textContent = `You're saving $${discount.toFixed(2)}!`;
        } else {
            if (discountLine) discountLine.style.display = 'none';
            if (savingsHighlight) savingsHighlight.style.display = 'none';
        }
    }

    function updateCheckoutPaymentDetails() {
        const selectedMethod = document.querySelector('input[name="checkout-payment"]:checked')?.value || 'paypal';
        const detailsContainer = document.getElementById('checkout-payment-details');
        
        if (!detailsContainer) return;
        
        // Calculate current total for payment methods that need it
        const subtotal = window.cartManager.getCartTotal();
        const discount = subtotal * promoDiscount;
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.1;
        const total = afterDiscount + tax;
        
        const paymentDetails = {
            paypal: `
                <div class="payment-details">
                    <h4><i class="fab fa-paypal"></i> PayPal Secure Payment</h4>
                    <p>🔒 You will be redirected to PayPal's secure payment gateway to complete your transaction safely.</p>
                    <div class="payment-benefits">
                        <p><i class="fas fa-shield-alt"></i> Buyer protection included</p>
                        <p><i class="fas fa-bolt"></i> Instant payment confirmation</p>
                        <p><i class="fas fa-lock"></i> Bank-level security encryption</p>
                        <p><i class="fas fa-mobile-alt"></i> Pay with PayPal app or any card</p>
                        <p><i class="fas fa-undo"></i> Easy refunds and disputes</p>
                    </div>
                    <div class="payment-note">
                        <small><i class="fas fa-info-circle"></i> You'll be redirected to PayPal after clicking "Continue"</small>
                    </div>
                </div>
            `,
            bank: `
                <div class="payment-details">
                    <h4><i class="fas fa-university"></i> Bank Transfer Details</h4>
                    <div class="location-info">
                        <p><strong>🏦 Bank Name:</strong> TARG STAR Education Bank</p>
                        <p><strong>👤 Account Name:</strong> TARG STAR AI Education Ltd</p>
                        <p><strong>🔢 Account Number:</strong> <span class="highlight" onclick="copyToClipboard('1234567890')" title="Click to copy">1234567890</span></p>
                        <p><strong>🌍 SWIFT Code:</strong> <span class="highlight" onclick="copyToClipboard('TARGUS01')" title="Click to copy">TARGUS01</span></p>
                        <p><strong>💰 Amount:</strong> <span class="highlight">$${total.toFixed(2)}</span></p>
                        <p><strong>📝 Reference:</strong> Include your order number in transfer description</p>
                    </div>
                    <div class="payment-benefits">
                        <p><i class="fas fa-clock"></i> Processing time: 1-3 business days</p>
                        <p><i class="fas fa-receipt"></i> Keep your transfer receipt for records</p>
                        <p><i class="fas fa-phone"></i> Contact us after transfer for confirmation</p>
                        <p><i class="fas fa-envelope"></i> Email receipt to payments@targstar.com</p>
                    </div>
                </div>
            `,
            vodafone: `
                <div class="payment-details">
                    <h4><i class="fas fa-mobile-alt"></i> Vodafone Cash Payment</h4>
                    <p><strong>📱 Merchant Code:</strong> <span class="highlight" onclick="copyToClipboard('*9*123456#')" title="Click to copy">*9*123456#</span></p>
                    <div class="location-info">
                        <h5>💳 Payment Steps:</h5>
                        <ol>
                            <li>📞 Dial <strong>*9*123456#</strong> from your Vodafone line</li>
                            <li>💰 Enter payment amount: <strong>$${total.toFixed(2)}</strong></li>
                            <li>🔐 Enter your Vodafone Cash PIN to confirm</li>
                            <li>📱 Save the confirmation SMS as proof of payment</li>
                            <li>📲 Send SMS screenshot to our WhatsApp: <span class="highlight" onclick="copyToClipboard('+251911123456')" title="Click to copy">+251 911 123 456</span></li>
                        </ol>
                    </div>
                    <div class="payment-benefits">
                        <p><i class="fas fa-mobile-alt"></i> Instant payment processing</p>
                        <p><i class="fas fa-sms"></i> SMS confirmation provided</p>
                        <p><i class="fas fa-clock"></i> Available 24/7</p>
                        <p><i class="fas fa-headset"></i> WhatsApp support available</p>
                    </div>
                </div>
            `,
            cash: `
                <div class="payment-details">
                    <h4><i class="fas fa-money-bill-wave"></i> Cash Payment Locations</h4>
                    <div class="location-info">
                        <p><strong><i class="fas fa-map-marker-alt"></i> Main Center:</strong> Bole Sub City, Addis Ababa, Ethiopia</p>
                        <p><strong><i class="fas fa-building"></i> Address:</strong> Near Bole International Airport, TARG STAR Building</p>
                        <p><strong><i class="fas fa-clock"></i> Hours:</strong> Monday - Friday: 9:00 AM - 6:00 PM, Saturday: 9:00 AM - 2:00 PM</p>
                        <p><strong><i class="fas fa-phone"></i> Phone:</strong> <span class="highlight" onclick="copyToClipboard('+251911123456')" title="Click to copy">+251 911 123 456</span></p>
                        <p><strong><i class="fas fa-envelope"></i> Email:</strong> payments@targstar.com</p>
                        <p><strong>💰 Amount to Pay:</strong> <span class="highlight">$${total.toFixed(2)}</span></p>
                    </div>
                    <div class="payment-benefits">
                        <p><i class="fas fa-map-marker-alt"></i> Multiple payment centers available</p>
                        <p><i class="fas fa-id-card"></i> Bring printed order confirmation</p>
                        <p><i class="fas fa-receipt"></i> Get instant receipt and course access</p>
                        <p><i class="fas fa-handshake"></i> Meet our team in person</p>
                        <p><i class="fas fa-car"></i> Free parking available</p>
                    </div>
                    <div class="payment-note">
                        <small><i class="fas fa-info-circle"></i> Call ahead to confirm availability and get directions</small>
                    </div>
                </div>
            `
        };

        // Add entrance animation
        detailsContainer.style.opacity = '0';
        detailsContainer.innerHTML = paymentDetails[selectedMethod] || '';
        
        setTimeout(() => {
            detailsContainer.style.transition = 'opacity 0.3s ease';
            detailsContainer.style.opacity = '1';
        }, 50);
        
        console.log(`💳 Payment method selected: ${selectedMethod}, Total: $${total.toFixed(2)}`);
    }

    async function processOrder() {
        try {
            console.log('🛒 Starting enhanced order processing...');
            
            // Get cart and payment info
            const cart = window.cartManager.getCart();
            if (cart.length === 0) {
                window.showToast('❌ Your cart is empty', 'error');
                return;
            }

            const paymentMethod = document.querySelector('input[name="checkout-payment"]:checked')?.value || 'paypal';
            
            // Show loading state
            const confirmationContent = document.querySelector('#step-3 .confirmation-content');
            if (confirmationContent) {
                confirmationContent.innerHTML = `
                    <div class="loading-state">
                        <div class="loading-spinner"></div>
                        <h3>Processing your order...</h3>
                        <p>Please wait while we process your payment.</p>
                    </div>
                `;
            }

            // Generate order details
            const orderNumber = 'TS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
            const subtotal = window.cartManager.getCartTotal();
            const discount = subtotal * promoDiscount;
            const afterDiscount = subtotal - discount;
            const tax = afterDiscount * 0.1;
            const total = afterDiscount + tax;

            // Create order data
            const orderData = {
                orderNumber: orderNumber,
                items: cart,
                subtotal: subtotal,
                discount: discount,
                tax: tax,
                total: total,
                paymentMethod: paymentMethod,
                promoCode: appliedPromoCode,
                timestamp: new Date().toISOString(),
                status: 'completed'
            };

            // Save order locally (always works)
            try {
                if (window.authManager && window.authManager.isAuthenticated()) {
                    const user = window.authManager.getCurrentUser();
                    const userOrders = JSON.parse(localStorage.getItem(`orders_${user.uid}`) || '[]');
                    userOrders.push(orderData);
                    localStorage.setItem(`orders_${user.uid}`, JSON.stringify(userOrders));
                    
                    // Update user's enrolled courses
                    if (window.authManager.demoUsers) {
                        const demoUser = window.authManager.demoUsers.find(u => u.uid === user.uid);
                        if (demoUser) {
                            cart.forEach(item => {
                                const courseId = item.id.replace('-course', '');
                                if (!demoUser.enrolledCourses.includes(courseId)) {
                                    demoUser.enrolledCourses.push(courseId);
                                }
                            });
                            localStorage.setItem('targstar_user', JSON.stringify(demoUser));
                        }
                    }
                } else {
                    // Guest user
                    const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
                    guestOrders.push(orderData);
                    localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
                }
            } catch (error) {
                console.error('Local storage error:', error);
            }

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show success confirmation
            if (confirmationContent) {
                confirmationContent.innerHTML = `
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>🎉 Order Placed Successfully!</h3>
                    <p>Thank you for your purchase! You now have access to your courses.</p>
                    
                    <div class="order-details">
                        <div class="order-number">
                            <strong>📋 Order Number: ${orderNumber}</strong>
                            <button class="copy-btn" onclick="copyOrderNumber('${orderNumber}')" title="Copy">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        <div class="order-total">
                            <strong>💰 Total Paid: $${total.toFixed(2)}</strong>
                        </div>
                        <div class="payment-method-used">
                            <strong>💳 Payment Method: ${getPaymentMethodName(paymentMethod)}</strong>
                        </div>
                    </div>
                    
                    <div class="course-access">
                        <h4>🎓 Your Courses</h4>
                        <div class="enrolled-courses">
                            ${cart.map(item => `
                                <div class="enrolled-course">
                                    <i class="fas fa-graduation-cap"></i>
                                    <span>${item.name}</span>
                                    <button class="access-btn" onclick="accessCourse('${item.id}')">Access Now</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="continue-learning-btn" onclick="window.location.href='lessons.html'">
                            🎓 Start Learning
                        </button>
                        <button class="view-dashboard-btn" onclick="window.location.href='dashboard.html'">
                            📊 Dashboard
                        </button>
                    </div>
                `;
            }

            // Clear cart
            window.cartManager.clearCart();
            
            // Update cart display
            renderCartItems();
            updateCartSummary();
            
            // Show success toast
            window.showToast('🎉 Order placed successfully! You now have access to your courses.', 'success', 5000);
            
            console.log('✅ Order processed successfully:', orderData);
            
        } catch (error) {
            console.error('❌ Order processing error:', error);
            
            // Show error state
            const confirmationContent = document.querySelector('#step-3 .confirmation-content');
            if (confirmationContent) {
                confirmationContent.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3>⚠️ Order Processing Issue</h3>
                        <p>We encountered an issue. Please try again.</p>
                        
                        <div class="error-actions">
                            <button class="retry-btn" onclick="processOrder()">
                                <i class="fas fa-redo"></i> Try Again
                            </button>
                            <button class="contact-btn" onclick="window.location.href='contact.html'">
                                <i class="fas fa-headset"></i> Contact Support
                            </button>
                        </div>
                    </div>
                `;
            }
            
            window.showToast('⚠️ Order processing failed. Please try again.', 'error');
        }
    }

    function getPaymentMethodName(method) {
        const names = {
            paypal: 'PayPal',
            bank: 'Bank Transfer',
            vodafone: 'Vodafone Cash',
            cash: 'Cash Payment'
        };
        return names[method] || method;
    }

    function enhancePaymentLayout() {
        // Add payment method selection animations
        const paymentOptions = document.querySelectorAll('.payment-method-option');
        
        paymentOptions.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            const card = option.querySelector('.payment-method-card');
            
            // Add click handler
            option.addEventListener('click', (e) => {
                if (e.target.type !== 'radio') {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change'));
                }
            });
            
            // Add visual feedback
            option.addEventListener('mouseenter', () => {
                if (!radio.checked) {
                    card.style.transform = 'translateY(-2px) scale(1.02)';
                    card.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.2)';
                }
            });
            
            option.addEventListener('mouseleave', () => {
                if (!radio.checked) {
                    card.style.transform = 'translateY(0) scale(1)';
                    card.style.boxShadow = '';
                }
            });
            
            // Handle selection change
            radio.addEventListener('change', () => {
                // Remove selection from all cards
                paymentOptions.forEach(opt => {
                    const otherCard = opt.querySelector('.payment-method-card');
                    otherCard.style.transform = 'translateY(0) scale(1)';
                    otherCard.style.boxShadow = '';
                });
                
                // Highlight selected card
                if (radio.checked) {
                    card.style.transform = 'translateY(-2px) scale(1.02)';
                    card.style.boxShadow = '0 10px 30px rgba(255, 215, 0, 0.3)';
                    
                    // Update payment details
                    updateCheckoutPaymentDetails();
                    
                    // Show success feedback
                    window.showToast(`💳 ${card.querySelector('span').textContent} selected`, 'info');
                }
            });
        });
        
        // Auto-select first payment method if none selected
        setTimeout(() => {
            const selectedMethod = document.querySelector('input[name="checkout-payment"]:checked');
            if (!selectedMethod) {
                const firstMethod = document.querySelector('input[name="checkout-payment"]');
                if (firstMethod) {
                    firstMethod.checked = true;
                    firstMethod.dispatchEvent(new Event('change'));
                }
            }
        }, 100);
    }

    function updateProgressIndicator(currentStep) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            const stepEl = step.querySelector('.step-number');
            
            if (stepNumber < currentStep) {
                // Completed step
                stepEl.innerHTML = '<i class="fas fa-check"></i>';
                stepEl.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            } else if (stepNumber === currentStep) {
                // Current step
                stepEl.textContent = stepNumber;
                stepEl.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
            } else {
                // Future step
                stepEl.textContent = stepNumber;
                stepEl.style.background = '#dee2e6';
            }
        });
    }

    // Global functions for cart item management
    window.updateItemQuantity = function(itemId, newQuantity) {
        if (newQuantity <= 0) {
            window.cartManager.removeFromCart(itemId);
            window.showToast('Item removed from cart', 'info');
        } else {
            window.cartManager.updateQuantity(itemId, newQuantity);
        }
        renderCartItems();
        updateCartSummary();
    };

    window.removeCartItem = function(itemId) {
        window.cartManager.removeFromCart(itemId);
        renderCartItems();
        updateCartSummary();
        window.showToast('Item removed from cart', 'info');
    };

    // Auto-save cart state
    setInterval(() => {
        if (window.authManager && window.authManager.isAuthenticated()) {
            window.cartManager.saveCartToFirebase();
        }
    }, 30000); // Save every 30 seconds

    console.log('🛒 Cart page initialized successfully!');
});

// Enhanced copy to clipboard functionality
window.copyToClipboard = function(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            window.showToast(`📋 ${text} copied to clipboard!`, 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
};

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            window.showToast(`📋 ${text} copied!`, 'success');
        } else {
            window.showToast('❌ Failed to copy', 'error');
        }
    } catch (err) {
        window.showToast('❌ Copy not supported', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Enhanced order processing functions
window.copyOrderNumber = function(orderNumber) {
    window.copyToClipboard(orderNumber);
};

window.accessCourse = function(courseId) {
    // Redirect to the appropriate course page
    const courseMap = {
        'nlp-course': 'lesson-nlp.html',
        'ml-course': 'lesson-ml.html',
        'dl-course': 'lesson-dl.html',
        'cv-course': 'lesson-cv.html',
        'machine-learning-course': 'lesson-ml.html',
        'deep-learning-course': 'lesson-dl.html',
        'natural-language-processing-course': 'lesson-nlp.html',
        'computer-vision-course': 'lesson-cv.html'
    };
    
    const courseUrl = courseMap[courseId] || 'lessons.html';
    window.showToast(`🎓 Accessing ${courseId.replace('-course', '').toUpperCase()} course...`, 'info');
    
    setTimeout(() => {
        window.location.href = courseUrl;
    }, 1000);
};

window.showOrderDetails = function(orderNumber) {
    alert(`Order Details for ${orderNumber}\n\nThis feature will show detailed order information including:\n- Order items\n- Payment status\n- Delivery information\n- Course access links`);
};

// Add shake animation for validation feedback
const shakeKeyframes = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

// Inject shake animation if not already present
if (!document.querySelector('#shake-animation-style')) {
    const style = document.createElement('style');
    style.id = 'shake-animation-style';
    style.textContent = shakeKeyframes;
    document.head.appendChild(style);
}

console.log('🎨 Enhanced payment layout and UX improvements loaded successfully!');
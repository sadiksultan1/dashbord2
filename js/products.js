// Products page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Category filtering
    const categoryBtns = document.querySelectorAll('.category-btn');
    const productCards = document.querySelectorAll('.product-card');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');
            
            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (category === 'all' || cardCategory === category) {
                    card.classList.remove('hidden');
                    card.classList.add('show');
                } else {
                    card.classList.add('hidden');
                    card.classList.remove('show');
                }
            });
        });
    });

    // Enhanced add to cart with checkout modal
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            e.preventDefault();
            
            const item = e.target.getAttribute('data-item');
            const price = parseFloat(e.target.getAttribute('data-price'));
            
            // Check if user is logged in for certain products
            if (item.includes('Certification') || item.includes('Mentoring')) {
                if (window.authManager && !window.authManager.isAuthenticated()) {
                    window.showToast('Please sign in to purchase this product', 'warning');
                    document.getElementById('sign-in-btn').click();
                    return;
                }
            }
            
            // Show checkout modal
            showCheckoutModal(item, price);
        }
    });

    // Checkout modal functionality
    function showCheckoutModal(itemName, price) {
        const modal = document.getElementById('checkout-modal');
        const itemNameEl = document.getElementById('checkout-item-name');
        const priceEl = document.getElementById('checkout-price');
        
        itemNameEl.textContent = itemName;
        priceEl.textContent = `$${price}`;
        
        modal.style.display = 'block';
        
        // Update payment details based on selected method
        updatePaymentDetails();
    }

    // Payment method selection
    document.addEventListener('change', (e) => {
        if (e.target.name === 'payment-method') {
            updatePaymentDetails();
        }
    });

    function updatePaymentDetails() {
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
        const detailsContainer = document.getElementById('payment-details');
        
        const paymentDetails = {
            paypal: {
                title: 'PayPal Payment',
                content: `
                    <p>You will be redirected to PayPal to complete your payment securely.</p>
                    <p><strong>Benefits:</strong></p>
                    <ul>
                        <li>Buyer protection</li>
                        <li>Instant payment confirmation</li>
                        <li>Secure transaction</li>
                    </ul>
                `
            },
            bank: {
                title: 'Bank Transfer',
                content: `
                    <p>Transfer the payment to our bank account:</p>
                    <p><strong>Account Details:</strong></p>
                    <p>Bank: <span class="highlight">TARG STAR Bank</span></p>
                    <p>Account: <span class="highlight">1234567890</span></p>
                    <p>SWIFT: <span class="highlight">TARGUS01</span></p>
                    <p><em>Please include your order reference in the transfer description.</em></p>
                `
            },
            vodafone: {
                title: 'Vodafone Cash',
                content: `
                    <p>Send payment via Vodafone Cash:</p>
                    <p><strong>Merchant Code:</strong> <span class="highlight">*9*123456#</span></p>
                    <p><strong>Steps:</strong></p>
                    <ol>
                        <li>Dial *9*123456# from your Vodafone line</li>
                        <li>Enter the amount</li>
                        <li>Confirm the transaction</li>
                        <li>Send us the transaction ID</li>
                    </ol>
                `
            },
            cash: {
                title: 'Cash Payment',
                content: `
                    <p>Pay in cash at one of our authorized centers:</p>
                    <p><strong>Locations:</strong></p>
                    <ul>
                        <li>TARG STAR Center - 123 AI Street, Tech City</li>
                        <li>Partner Center - 456 Learning Ave, Education District</li>
                        <li>Campus Office - 789 University Blvd, Academic Zone</li>
                    </ul>
                    <p><em>Bring a printed copy of your order confirmation.</em></p>
                `
            }
        };
        
        const details = paymentDetails[selectedMethod];
        detailsContainer.innerHTML = `
            <h4>${details.title}</h4>
            ${details.content}
        `;
    }

    // Complete purchase
    document.getElementById('complete-purchase').addEventListener('click', async () => {
        const itemName = document.getElementById('checkout-item-name').textContent;
        const price = document.getElementById('checkout-price').textContent;
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        
        // Show loading state
        const btn = document.getElementById('complete-purchase');
        window.setLoadingState(btn, true);
        
        try {
            // Simulate payment processing
            await processPayment(itemName, price, paymentMethod);
            
            // Add to cart after successful payment simulation
            window.cartManager.addToCart({
                id: window.cartManager.generateId(itemName),
                name: itemName,
                price: parseFloat(price.replace('$', '')),
                image: 'images/default-product.jpg',
                quantity: 1
            });
            
            // Close modal
            document.getElementById('checkout-modal').style.display = 'none';
            
            // Show success message
            window.showToast(`Payment initiated for ${itemName}! Check your email for details.`, 'success');
            
            // Save purchase to Firebase if user is logged in
            if (window.authManager && window.authManager.isAuthenticated()) {
                await savePurchaseToFirebase(itemName, price, paymentMethod);
            }
            
        } catch (error) {
            console.error('Payment error:', error);
            window.showToast('Payment failed. Please try again.', 'error');
        } finally {
            window.setLoadingState(btn, false);
        }
    });

    async function processPayment(itemName, price, paymentMethod) {
        // Simulate payment processing delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 95% success rate
                if (Math.random() > 0.05) {
                    resolve();
                } else {
                    reject(new Error('Payment processing failed'));
                }
            }, 2000);
        });
    }

    async function savePurchaseToFirebase(itemName, price, paymentMethod) {
        try {
            const user = window.authManager.getCurrentUser();
            const purchaseData = {
                userId: user.uid,
                itemName: itemName,
                price: price,
                paymentMethod: paymentMethod,
                status: 'pending',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                orderId: generateOrderId()
            };
            
            await db.collection('purchases').add(purchaseData);
            
            // Update user's purchased items
            await db.collection('users').doc(user.uid).update({
                purchases: firebase.firestore.FieldValue.arrayUnion(purchaseData)
            });
            
        } catch (error) {
            console.error('Error saving purchase:', error);
        }
    }

    function generateOrderId() {
        return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // Close checkout modal
    document.querySelector('#checkout-modal .close').addEventListener('click', () => {
        document.getElementById('checkout-modal').style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('checkout-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Product card hover effects
    productCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Subscription handling for recurring products
    function handleSubscription(productName, price) {
        if (window.authManager && !window.authManager.isAuthenticated()) {
            window.showToast('Please sign in to subscribe', 'warning');
            document.getElementById('sign-in-btn').click();
            return;
        }
        
        // Show subscription confirmation
        const confirmed = confirm(`Subscribe to ${productName} for $${price}/month?`);
        if (confirmed) {
            // Process subscription
            processSubscription(productName, price);
        }
    }

    async function processSubscription(productName, price) {
        try {
            const user = window.authManager.getCurrentUser();
            const subscriptionData = {
                userId: user.uid,
                productName: productName,
                price: price,
                status: 'active',
                startDate: firebase.firestore.FieldValue.serverTimestamp(),
                nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            };
            
            await db.collection('subscriptions').add(subscriptionData);
            window.showToast(`Successfully subscribed to ${productName}!`, 'success');
            
        } catch (error) {
            console.error('Subscription error:', error);
            window.showToast('Subscription failed. Please try again.', 'error');
        }
    }

    // Handle subscription buttons
    document.addEventListener('click', (e) => {
        if (e.target.textContent === 'Subscribe') {
            e.preventDefault();
            const productCard = e.target.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const price = productCard.querySelector('.current-price').textContent.replace('$', '');
            
            handleSubscription(productName, price);
        }
    });

    // Initialize payment details on page load
    updatePaymentDetails();
    
    // Payment method interaction
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', () => {
            const paymentType = option.getAttribute('data-payment');
            showPaymentInfo(paymentType);
        });
    });

    function showPaymentInfo(paymentType) {
        const paymentInfo = {
            paypal: {
                title: 'PayPal Payment',
                description: 'PayPal offers secure online payments with buyer protection. You can pay using your PayPal balance, bank account, or credit/debit card.',
                benefits: ['Buyer Protection', 'Instant Payment', 'Secure Transactions', 'Global Acceptance']
            },
            bank: {
                title: 'Bank Transfer',
                description: 'Direct bank transfer is perfect for institutional purchases and bulk orders. Transfer funds directly from your bank account.',
                benefits: ['Lower Fees', 'Bulk Payments', 'Institutional Support', 'Secure Transfer']
            },
            vodafone: {
                title: 'Vodafone Cash',
                description: 'Mobile money payment system that allows you to pay using your mobile phone. Quick, convenient, and secure.',
                benefits: ['Mobile Convenience', 'Quick Payments', 'No Bank Account Needed', 'Instant Confirmation']
            },
            cash: {
                title: 'Cash Payment',
                description: 'Pay in cash at our authorized centers and partner locations. Perfect for those who prefer traditional payment methods.',
                benefits: ['No Online Transaction', 'Immediate Payment', 'Multiple Locations', 'Personal Service']
            }
        };

        const info = paymentInfo[paymentType];
        if (info) {
            window.showToast(`${info.title}: ${info.description}`, 'info');
        }
    }

    console.log('Products page initialized successfully!');
});
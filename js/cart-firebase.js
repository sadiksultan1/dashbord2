// Enhanced Cart Manager with Firebase Integration
class FirebaseCartManager {
    constructor() {
        this.cart = [];
        this.isInitialized = false;
        this.syncInProgress = false;
        this.initializeCart();
    }

    async initializeCart() {
        console.log('🛒 Initializing Firebase Cart Manager...');
        
        // Load cart from localStorage first (immediate)
        this.loadCartFromLocalStorage();
        
        // Wait for Firebase to be ready, then sync
        this.waitForFirebaseAndSync();
        
        this.setupEventListeners();
        this.updateCartCount();
        this.isInitialized = true;
        
        console.log('✅ Cart Manager initialized with', this.cart.length, 'items');
    }

    async waitForFirebaseAndSync() {
        // Check if Firebase is ready every second, up to 10 times
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkFirebase = async () => {
            attempts++;
            
            if (window.SimpleFirebase?.isReady()) {
                console.log('🔥 Firebase ready, syncing cart...');
                await this.syncWithFirebase();
                return;
            }
            
            if (attempts < maxAttempts) {
                setTimeout(checkFirebase, 1000);
            } else {
                console.log('⚠️ Firebase not available, using localStorage only');
            }
        };
        
        setTimeout(checkFirebase, 1000);
    }

    setupEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const item = e.target.getAttribute('data-item');
                const price = parseFloat(e.target.getAttribute('data-price'));
                const image = e.target.getAttribute('data-image') || 'images/default-course.jpg';
                
                this.addToCart({
                    id: this.generateId(item),
                    name: item,
                    price: price,
                    image: image,
                    quantity: 1
                });
            }
        });

        // Listen for auth state changes
        if (window.authManager) {
            // Check periodically for auth changes
            setInterval(() => {
                if (window.authManager.isAuthenticated() && !this.syncInProgress) {
                    this.syncWithFirebase();
                }
            }, 30000); // Sync every 30 seconds
        }
    }

    generateId(name) {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    async addToCart(item) {
        const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...item,
                addedAt: new Date().toISOString()
            });
        }
        
        await this.saveCart();
        this.updateCartCount();
        this.showAddToCartNotification(item.name);
        
        console.log('🛒 Added to cart:', item.name);
    }

    async removeFromCart(itemId) {
        const itemName = this.cart.find(item => item.id === itemId)?.name;
        this.cart = this.cart.filter(item => item.id !== itemId);
        
        await this.saveCart();
        this.updateCartCount();
        
        if (itemName && window.showToast) {
            window.showToast(`${itemName} removed from cart`, 'info');
        }
        
        console.log('🗑️ Removed from cart:', itemId);
    }

    async updateQuantity(itemId, quantity) {
        const item = this.cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            if (quantity <= 0) {
                await this.removeFromCart(itemId);
            } else {
                item.quantity = quantity;
                item.updatedAt = new Date().toISOString();
                await this.saveCart();
                this.updateCartCount();
            }
        }
    }

    async clearCart() {
        this.cart = [];
        await this.saveCart();
        this.updateCartCount();
        
        if (window.showToast) {
            window.showToast('🛒 Cart cleared', 'info');
        }
        
        console.log('🧹 Cart cleared');
    }

    getCart() {
        return this.cart;
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cart-count, .cart-count');
        const count = this.getCartItemCount();
        
        cartCountElements.forEach(element => {
            if (element) {
                element.textContent = count;
                
                // Add animation for count changes
                if (count > 0) {
                    element.style.animation = 'bounce 0.3s ease';
                    setTimeout(() => {
                        element.style.animation = '';
                    }, 300);
                }
            }
        });
    }

    // Local Storage Methods
    loadCartFromLocalStorage() {
        try {
            const savedCart = localStorage.getItem('targstar_cart');
            if (savedCart) {
                this.cart = JSON.parse(savedCart);
                console.log('📦 Loaded cart from localStorage:', this.cart.length, 'items');
            }
        } catch (error) {
            console.error('❌ Error loading cart from localStorage:', error);
            this.cart = [];
        }
    }

    saveCartToLocalStorage() {
        try {
            localStorage.setItem('targstar_cart', JSON.stringify(this.cart));
            localStorage.setItem('targstar_cart_updated', new Date().toISOString());
        } catch (error) {
            console.error('❌ Error saving cart to localStorage:', error);
        }
    }

    // Firebase Methods
    async syncWithFirebase() {
        if (this.syncInProgress || !window.SimpleFirebase?.isReady()) {
            return;
        }

        if (!window.authManager?.isAuthenticated()) {
            return;
        }

        this.syncInProgress = true;
        
        try {
            const user = window.authManager.getCurrentUser();
            console.log('🔄 Syncing cart with Firebase for user:', user.email);
            
            // Try to load cart from Firebase
            const firebaseCart = await this.loadCartFromFirebase();
            
            if (firebaseCart && firebaseCart.length > 0) {
                // Merge carts (Firebase takes precedence for conflicts)
                this.mergeCartData(firebaseCart);
            }
            
            // Save current cart to Firebase
            await this.saveCartToFirebase();
            
            console.log('✅ Cart synced with Firebase');
            
        } catch (error) {
            console.error('❌ Error syncing cart with Firebase:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    async loadCartFromFirebase() {
        if (!window.SimpleFirebase?.isReady() || !window.authManager?.isAuthenticated()) {
            return null;
        }

        try {
            const user = window.authManager.getCurrentUser();
            const doc = await window.db.collection('users').doc(user.uid).get();
            
            if (doc.exists && doc.data().cart) {
                console.log('📥 Loaded cart from Firebase:', doc.data().cart.length, 'items');
                return doc.data().cart;
            }
            
            return null;
        } catch (error) {
            console.error('❌ Error loading cart from Firebase:', error);
            return null;
        }
    }

    async saveCartToFirebase() {
        if (!window.SimpleFirebase?.isReady() || !window.authManager?.isAuthenticated()) {
            return false;
        }

        try {
            const user = window.authManager.getCurrentUser();
            
            await window.db.collection('users').doc(user.uid).set({
                cart: this.cart,
                cartUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                cartItemCount: this.getCartItemCount(),
                cartTotal: this.getCartTotal()
            }, { merge: true });
            
            console.log('📤 Cart saved to Firebase');
            return true;
            
        } catch (error) {
            console.error('❌ Error saving cart to Firebase:', error);
            return false;
        }
    }

    mergeCartData(firebaseCart) {
        // Simple merge strategy: combine items, Firebase quantities take precedence
        const mergedCart = [...this.cart];
        
        firebaseCart.forEach(firebaseItem => {
            const existingIndex = mergedCart.findIndex(item => item.id === firebaseItem.id);
            
            if (existingIndex >= 0) {
                // Update existing item with Firebase data
                mergedCart[existingIndex] = {
                    ...mergedCart[existingIndex],
                    ...firebaseItem,
                    syncedAt: new Date().toISOString()
                };
            } else {
                // Add new item from Firebase
                mergedCart.push({
                    ...firebaseItem,
                    syncedAt: new Date().toISOString()
                });
            }
        });
        
        this.cart = mergedCart;
        this.saveCartToLocalStorage();
        this.updateCartCount();
        
        console.log('🔄 Cart data merged');
    }

    // Combined save method
    async saveCart() {
        // Always save to localStorage immediately
        this.saveCartToLocalStorage();
        
        // Try to save to Firebase if available
        if (window.SimpleFirebase?.isReady() && window.authManager?.isAuthenticated()) {
            await this.saveCartToFirebase();
        }
    }

    // Order Management
    async saveOrder(orderData) {
        try {
            const enhancedOrderData = {
                ...orderData,
                id: 'order-' + Date.now(),
                createdAt: new Date().toISOString(),
                status: 'completed'
            };

            // Save to localStorage
            const orders = this.getOrderHistory();
            orders.push(enhancedOrderData);
            localStorage.setItem('targstar_orders', JSON.stringify(orders));

            // Save to Firebase if available
            if (window.SimpleFirebase?.isReady()) {
                if (window.authManager?.isAuthenticated()) {
                    const user = window.authManager.getCurrentUser();
                    enhancedOrderData.userId = user.uid;
                    enhancedOrderData.userEmail = user.email;
                    
                    // Save order to Firebase
                    await window.db.collection('orders').add(enhancedOrderData);
                    
                    // Update user profile
                    await window.db.collection('users').doc(user.uid).update({
                        lastOrderDate: firebase.firestore.FieldValue.serverTimestamp(),
                        totalOrders: firebase.firestore.FieldValue.increment(1),
                        totalSpent: firebase.firestore.FieldValue.increment(orderData.total),
                        orders: firebase.firestore.FieldValue.arrayUnion(enhancedOrderData.id)
                    });
                    
                    console.log('📦 Order saved to Firebase');
                } else {
                    // Save to Firebase as guest order
                    await window.db.collection('guest-orders').add(enhancedOrderData);
                    console.log('📦 Guest order saved to Firebase');
                }
            }

            console.log('✅ Order saved successfully:', enhancedOrderData.id);
            return enhancedOrderData;
            
        } catch (error) {
            console.error('❌ Error saving order:', error);
            throw error;
        }
    }

    getOrderHistory() {
        try {
            return JSON.parse(localStorage.getItem('targstar_orders') || '[]');
        } catch (error) {
            console.error('❌ Error loading order history:', error);
            return [];
        }
    }

    // Notification System
    showAddToCartNotification(itemName) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.cart-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${itemName} added to cart!</span>
                <button class="view-cart-btn" onclick="window.location.href='cart.html'">
                    View Cart (${this.getCartItemCount()})
                </button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
            z-index: 10000;
            animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 350px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        // Add notification styles if not already added
        if (!document.getElementById('cart-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'cart-notification-styles';
            style.textContent = `
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
                
                @keyframes bounce {
                    0%, 20%, 60%, 100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-10px);
                    }
                    80% {
                        transform: translateY(-5px);
                    }
                }
                
                .cart-notification .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                
                .cart-notification .view-cart-btn {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-left: auto;
                }
                
                .cart-notification .view-cart-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-1px);
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-hide notification
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 4000);

        // Show toast as well
        if (window.showToast) {
            window.showToast(`🛒 ${itemName} added to cart!`, 'success');
        }
    }

    // Analytics and Insights
    getCartAnalytics() {
        const cart = this.getCart();
        const total = this.getCartTotal();
        const itemCount = this.getCartItemCount();
        
        return {
            totalItems: itemCount,
            totalValue: total,
            averageItemPrice: itemCount > 0 ? total / itemCount : 0,
            categories: this.getCategoriesInCart(),
            mostExpensiveItem: this.getMostExpensiveItem(),
            estimatedTax: total * 0.1,
            estimatedTotal: total * 1.1,
            cartAge: this.getCartAge(),
            lastUpdated: localStorage.getItem('targstar_cart_updated')
        };
    }

    getCategoriesInCart() {
        const cart = this.getCart();
        const categories = {};
        
        cart.forEach(item => {
            let category = 'General';
            const name = item.name.toLowerCase();
            
            if (name.includes('machine learning') || name.includes('ml')) {
                category = 'Machine Learning';
            } else if (name.includes('deep learning') || name.includes('dl')) {
                category = 'Deep Learning';
            } else if (name.includes('nlp') || name.includes('natural language')) {
                category = 'Natural Language Processing';
            } else if (name.includes('computer vision') || name.includes('cv')) {
                category = 'Computer Vision';
            } else if (name.includes('ai') || name.includes('artificial intelligence')) {
                category = 'Artificial Intelligence';
            } else if (name.includes('data')) {
                category = 'Data Science';
            } else if (name.includes('python') || name.includes('programming')) {
                category = 'Programming';
            }
            
            categories[category] = (categories[category] || 0) + item.quantity;
        });
        
        return categories;
    }

    getMostExpensiveItem() {
        const cart = this.getCart();
        if (cart.length === 0) return null;
        
        return cart.reduce((max, item) => 
            item.price > max.price ? item : max
        );
    }

    getCartAge() {
        const lastUpdated = localStorage.getItem('targstar_cart_updated');
        if (!lastUpdated) return 0;
        
        const now = new Date();
        const updated = new Date(lastUpdated);
        return Math.floor((now - updated) / (1000 * 60 * 60 * 24)); // Days
    }

    // Status and Health Check
    getStatus() {
        return {
            initialized: this.isInitialized,
            itemCount: this.getCartItemCount(),
            totalValue: this.getCartTotal(),
            firebaseReady: window.SimpleFirebase?.isReady() || false,
            userAuthenticated: window.authManager?.isAuthenticated() || false,
            syncInProgress: this.syncInProgress,
            lastSync: localStorage.getItem('targstar_cart_updated')
        };
    }
}

// Initialize the Firebase Cart Manager
document.addEventListener('DOMContentLoaded', () => {
    window.firebaseCartManager = new FirebaseCartManager();
    
    // Make it available as the main cart manager for compatibility
    window.cartManager = window.firebaseCartManager;
    
    console.log('🛒 Firebase Cart Manager loaded and ready!');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseCartManager;
}
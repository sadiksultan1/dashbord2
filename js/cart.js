// Shopping Cart functionality
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.setupEventListeners();
        this.updateCartCount();
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
    }

    generateId(name) {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    addToCart(item) {
        const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(item);
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showAddToCartNotification(item.name);
        
        // Save to Firebase if user is logged in
        if (window.authManager && window.authManager.isAuthenticated()) {
            this.saveCartToFirebase();
        }
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartCount();
        
        if (window.authManager && window.authManager.isAuthenticated()) {
            this.saveCartToFirebase();
        }
    }

    updateQuantity(itemId, quantity) {
        const item = this.cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartCount();
                
                if (window.authManager && window.authManager.isAuthenticated()) {
                    this.saveCartToFirebase();
                }
            }
        }
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

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
        
        if (window.authManager && window.authManager.isAuthenticated()) {
            this.saveCartToFirebase();
        }
    }

    updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = this.getCartItemCount();
        }
    }

    saveCart() {
        localStorage.setItem('targstar_cart', JSON.stringify(this.cart));
    }

    loadCart() {
        const savedCart = localStorage.getItem('targstar_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    async saveCartToFirebase() {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            return;
        }

        try {
            const user = window.authManager.getCurrentUser();
            if (typeof db !== 'undefined') {
                await db.collection('users').doc(user.uid).update({
                    cart: this.cart,
                    cartUpdated: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Error saving cart to Firebase:', error);
        }
    }

    async loadCartFromFirebase() {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            return;
        }

        try {
            const user = window.authManager.getCurrentUser();
            if (typeof db !== 'undefined') {
                const doc = await db.collection('users').doc(user.uid).get();
                
                if (doc.exists && doc.data().cart) {
                    this.cart = doc.data().cart;
                    this.saveCart(); // Sync with localStorage
                    this.updateCartCount();
                }
            }
        } catch (error) {
            console.error('Error loading cart from Firebase:', error);
        }
    }

    showAddToCartNotification(itemName) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${itemName} added to cart!</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(45deg, #00b894, #00a085);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 184, 148, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Add animation styles to document if not already added
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
                
                .cart-notification .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Order Management Functions
    async saveOrder(orderData) {
        try {
            // Save to localStorage for all users
            const orders = this.getOrderHistory();
            orders.push(orderData);
            localStorage.setItem('orderHistory', JSON.stringify(orders));
            
            // Save to Firebase if user is authenticated
            if (window.authManager && window.authManager.isAuthenticated()) {
                const user = window.authManager.getCurrentUser();
                orderData.userId = user.uid;
                orderData.userEmail = user.email;
                
                if (typeof db !== 'undefined') {
                    await db.collection('orders').add(orderData);
                    
                    // Update user profile with order
                    await db.collection('users').doc(user.uid).update({
                        lastOrderDate: firebase.firestore.FieldValue.serverTimestamp(),
                        totalOrders: firebase.firestore.FieldValue.increment(1),
                        totalSpent: firebase.firestore.FieldValue.increment(orderData.total)
                    });
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error saving order:', error);
            return false;
        }
    }

    getOrderHistory() {
        return JSON.parse(localStorage.getItem('orderHistory') || '[]');
    }

    getOrderByNumber(orderNumber) {
        const orders = this.getOrderHistory();
        return orders.find(order => order.orderNumber === orderNumber);
    }

    // Enhanced cart analytics
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
            estimatedTotal: total * 1.1
        };
    }

    getCategoriesInCart() {
        const cart = this.getCart();
        const categories = {};
        
        cart.forEach(item => {
            // Determine category based on item name
            let category = 'General';
            if (item.name.toLowerCase().includes('machine learning') || item.name.toLowerCase().includes('ml')) {
                category = 'Machine Learning';
            } else if (item.name.toLowerCase().includes('ai') || item.name.toLowerCase().includes('artificial intelligence')) {
                category = 'Artificial Intelligence';
            } else if (item.name.toLowerCase().includes('data')) {
                category = 'Data Science';
            } else if (item.name.toLowerCase().includes('python') || item.name.toLowerCase().includes('programming')) {
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

    // Wishlist functionality
    addToWishlist(item) {
        const wishlist = this.getWishlist();
        const existingItem = wishlist.find(wishItem => wishItem.id === item.id);
        
        if (!existingItem) {
            wishlist.push(item);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            if (window.showToast) {
                window.showToast(`${item.name} added to wishlist!`, 'success');
            }
        } else {
            if (window.showToast) {
                window.showToast(`${item.name} is already in your wishlist`, 'info');
            }
        }
    }

    getWishlist() {
        return JSON.parse(localStorage.getItem('wishlist') || '[]');
    }

    removeFromWishlist(itemId) {
        const wishlist = this.getWishlist();
        const updatedWishlist = wishlist.filter(item => item.id !== itemId);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    }

    moveWishlistToCart(itemId) {
        const wishlist = this.getWishlist();
        const item = wishlist.find(item => item.id === itemId);
        
        if (item) {
            this.addToCart(item);
            this.removeFromWishlist(itemId);
            if (window.showToast) {
                window.showToast(`${item.name} moved to cart!`, 'success');
            }
        }
    }

    // Recently viewed items
    addToRecentlyViewed(item) {
        const recentItems = this.getRecentlyViewed();
        const existingIndex = recentItems.findIndex(recent => recent.id === item.id);
        
        if (existingIndex > -1) {
            recentItems.splice(existingIndex, 1);
        }
        
        recentItems.unshift(item);
        
        // Keep only last 10 items
        if (recentItems.length > 10) {
            recentItems.pop();
        }
        
        localStorage.setItem('recentlyViewed', JSON.stringify(recentItems));
    }

    getRecentlyViewed() {
        return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    }

    // Cart recommendations based on current items
    getRecommendations() {
        const categories = this.getCategoriesInCart();
        
        // Simple recommendation logic based on categories
        const recommendations = [];
        
        if (categories['Machine Learning']) {
            recommendations.push({
                id: 'deep-learning-course',
                name: 'Deep Learning Fundamentals',
                price: 199,
                image: 'images/deep-learning.jpg',
                reason: 'Complements your Machine Learning courses'
            });
        }
        
        if (categories['Programming']) {
            recommendations.push({
                id: 'advanced-python',
                name: 'Advanced Python for AI',
                price: 149,
                image: 'images/python-ai.jpg',
                reason: 'Perfect for your programming journey'
            });
        }
        
        return recommendations;
    }

    // Method to render cart items (for cart page)
    renderCartItems(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Browse our courses and add them to your cart.</p>
                    <a href="lessons.html" class="cta-btn">Browse Courses</a>
                </div>
            `;
            return;
        }

        const cartHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvdXJzZTwvdGV4dD48L3N2Zz4='">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="window.cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="window.cartManager.removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');

        container.innerHTML = cartHTML;
    }

    // Method to render cart summary (for checkout)
    renderCartSummary(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const subtotal = this.getCartTotal();
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;

        container.innerHTML = `
            <div class="cart-summary">
                <h3>Order Summary</h3>
                <div class="summary-line">
                    <span>Subtotal (${this.getCartItemCount()} items)</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-line">
                    <span>Tax</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                <div class="summary-line total">
                    <span>Total</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            </div>
        `;
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
    
    // Load cart from Firebase when user logs in
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged((user) => {
            if (user && window.cartManager) {
                window.cartManager.loadCartFromFirebase();
            }
        });
    }
});
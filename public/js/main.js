const API_BASE = '/api';

let currentUser = null;
let cart = [];

function showMessage(message, type = 'success') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message-popup');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-popup ${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
        ${type === 'success' ? 'background-color: #4CAF50;' : 'background-color: #f44336;'}
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 4000);
}

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

async function getCurrentUser() {
    try {
        const data = await apiCall('/auth/me');
        currentUser = data.user;
        return currentUser;
    } catch (error) {
        currentUser = null;
        return null;
    }
}

async function login(email, password) {
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        currentUser = data.user;
        showMessage('Login successful!');
        updateAuthUI();
        return data;
    } catch (error) {
        showMessage(error.message, 'error');
        throw error;
    }
}

async function register(name, email, password) {
    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        
        currentUser = data.user;
        showMessage('Registration successful!');
        updateAuthUI();
        return data;
    } catch (error) {
        showMessage(error.message, 'error');
        throw error;
    }
}

async function logout() {
    try {
        await apiCall('/auth/logout', { method: 'POST' });
        currentUser = null;
        cart = [];
        localStorage.removeItem('cart');
        showMessage('Logged out successfully!');
        updateAuthUI();
        updateCartCount();
        window.location.href = 'index.html';
    } catch (error) {
        showMessage('Logout failed', 'error');
    }
}

async function loadFeaturedProducts() {
    try {
        const products = await apiCall('/products/featured');
        displayFeaturedProducts(products);
    } catch (error) {
        console.error('Failed to load featured products:', error);
        showMessage('Failed to load products', 'error');
    }
}

async function loadAllProducts() {
    try {
        const products = await apiCall('/products');
        displayAllProducts(products);
    } catch (error) {
        console.error('Failed to load products:', error);
        showMessage('Failed to load products', 'error');
    }
}

function displayFeaturedProducts(products) {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='public/images/placeholder.jpg'">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="price">$${product.price}</div>
            <div class="product-actions">
                <input type="number" value="1" min="1" max="10" class="quantity-input">
                <button class="btn" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, this)">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function displayAllProducts(products) {
    const container = document.getElementById('all-products');
    if (!container) return;
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='public/images/placeholder.jpg'">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="price">$${product.price}</div>
            <div class="product-actions">
                <input type="number" value="1" min="1" max="10" class="quantity-input">
                <button class="btn" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, this)">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function getCart() {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
}

function saveCart(cartData) {
    localStorage.setItem('cart', JSON.stringify(cartData));
    cart = cartData;
}

function addToCart(productId, name, price, buttonElement) {
    let quantity = 1;
    if (buttonElement) {
        const quantityInput = buttonElement.parentElement.querySelector('.quantity-input');
        if (quantityInput) {
            quantity = parseInt(quantityInput.value) || 1;
        }
    }
    
    price = parseFloat(price);
    quantity = parseInt(quantity);
    
    if (!productId || !name || isNaN(price) || isNaN(quantity)) {
        showMessage('Invalid product data', 'error');
        return;
    }
    
    let currentCart = getCart();
    const existingItem = currentCart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        currentCart.push({
            productId: productId.toString(),
            name: name,
            price: price,
            quantity: quantity
        });
    }
    
    saveCart(currentCart);
    updateCartCount();
    showMessage(`${name} added to cart!`);
}
function removeFromCart(productId) {
    let currentCart = getCart();
    currentCart = currentCart.filter(item => item.productId !== productId);
    saveCart(currentCart);
    updateCartCount();
    loadCart();
    showMessage('Item removed from cart');
}

function updateCartCount() {
    const currentCart = getCart();
    const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function loadCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    
    const currentCart = getCart();
    
    if (currentCart.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">Your cart is empty</p>';
        document.getElementById('cart-total').innerHTML = '';
        document.getElementById('checkout-section').style.display = 'none';
        return;
    }
    
    let total = 0;
    container.innerHTML = currentCart.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        return `
            <div class="cart-item">
                <img src="public/images/placeholder.jpg" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: $${item.price} each</p>
                    <p><strong>Subtotal: $${subtotal.toFixed(2)}</strong></p>
                </div>
                <button class="btn" style="background: #e74c3c;" onclick="removeFromCart('${item.productId}')">Remove</button>
            </div>
        `;
    }).join('');
    
    document.getElementById('cart-total').innerHTML = `
        <h2 style="text-align: center; color: #e74c3c; margin: 30px 0;">Total: $${total.toFixed(2)}</h2>
    `;
    
    const checkoutSection = document.getElementById('checkout-section');
    if (checkoutSection) {
        checkoutSection.style.display = 'block';
        checkoutSection.innerHTML = currentUser ? 
            '<button class="btn" style="width: 100%; font-size: 18px; padding: 15px;" onclick="proceedToCheckout()">Proceed to Checkout</button>' :
            '<p style="text-align: center;">Please <a href="login.html">login</a> to checkout</p>';
    }
}

function proceedToCheckout() {
    const currentCart = getCart();
    
    if (!currentUser) {
        showMessage('Please login to checkout', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    if (currentCart.length === 0) {
        showMessage('Your cart is empty', 'error');
        return;
    }
    
    window.location.href = 'checkout.html';
}

function loadCheckout() {
    const currentCart = getCart();
    const container = document.getElementById('order-summary');
    
    if (!container || currentCart.length === 0) {
        showMessage('Your cart is empty', 'error');
        window.location.href = 'cart.html';
        return;
    }
    
    let total = 0;
    const itemsHtml = currentCart.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        return `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>Qty: ${item.quantity} × $${item.price}</small>
                </div>
                <div><strong>$${subtotal.toFixed(2)}</strong></div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        ${itemsHtml}
        <div style="border-top: 2px solid #333; padding-top: 15px; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
    `;
}

async function handleCheckout(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showMessage('Please login to place an order', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    const currentCart = getCart();
    if (currentCart.length === 0) {
        showMessage('Your cart is empty', 'error');
        window.location.href = 'cart.html';
        return;
    }
    
    const formData = new FormData(event.target);
    const orderData = {
        items: currentCart,
        totalAmount: currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shippingAddress: formData.get('address'),
        phone: formData.get('phone'),
        paymentMethod: formData.get('paymentMethod')
    };
    
    try {
        const response = await apiCall('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        
        saveCart([]);
        updateCartCount();
        
        window.location.href = `order-confirmation.html?orderId=${response.order.orderId}`;
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function loadOrderConfirmation() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (!orderId) {
        showMessage('Order not found', 'error');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const order = await apiCall(`/orders/${orderId}`);
        displayOrderConfirmation(order);
    } catch (error) {
        showMessage('Failed to load order details', 'error');
        window.location.href = 'index.html';
    }
}

function displayOrderConfirmation(order) {
    const container = document.getElementById('order-details');
    if (!container) return;
    
    const itemsHtml = order.items.map(item => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>${item.name}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
        <div style="font-size: 14px; color: #666; margin-bottom: 15px;">
            Qty: ${item.quantity} × $${item.price}
        </div>
    `).join('');
    
    container.innerHTML = `
        <h2>Order Details</h2>
       
        <p><strong>Total:</strong> $${order.totalAmount}</p>
        
        <h3>Items Ordered:</h3>
        ${itemsHtml}
        
        <h3>Shipping Information:</h3>
        <p><strong>Address:</strong> ${order.shippingAddress}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
    `;
}

async function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    try {
        const response = await apiCall('/contact', {
            method: 'POST',
            body: JSON.stringify()
        });
        
        showMessage(response.message);
        event.target.reset();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
        await login(email, password);
        window.location.href = 'index.html';
    } catch (error) {
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    try {
        await register(name, email, password);
        window.location.href = 'index.html';
    } catch (error) {
    }
}

function updateAuthUI() {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const userName = document.getElementById('user-name');
    
    if (currentUser) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'inline';
        if (userName) {
            userName.style.display = 'inline';
            userName.textContent = `Welcome, ${currentUser.name}`;
        }
    } else {
        if (loginLink) loginLink.style.display = 'inline';
        if (registerLink) registerLink.style.display = 'inline';
        if (logoutLink) logoutLink.style.display = 'none';
        if (userName) userName.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    await getCurrentUser();
    updateAuthUI();
    updateCartCount();
    
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/') {
        loadFeaturedProducts();
    } else if (path.includes('products.html')) {
        loadAllProducts();
    } else if (path.includes('cart.html')) {
        loadCart();
    } else if (path.includes('checkout.html')) {
        loadCheckout();
    } else if (path.includes('order-confirmation.html')) {
        loadOrderConfirmation();
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
});


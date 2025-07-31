const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Import models
const Product = require('./models/Product');
const User = require('./models/User');
const Contact = require('./models/Contact');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'flowers-coffee-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Serve static files
app.use(express.static('.'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
// Routes

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({ inStock: true });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get featured products
app.get('/api/products/featured', async (req, res) => {
    try {
        const products = await Product.find({ featured: true, inStock: true }).limit(6);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch featured products' });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// User registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        
        // Create new user
        const user = new User({ name, email, password });
        await user.save();
        
        // Set session
        req.session.userId = user._id;
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };
        
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Set session
        req.session.userId = user._id;
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };
        
        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// User logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        const contact = new Contact({ name, email, message });
        await contact.save();
        
        res.status(201).json({ message: 'Message sent successfully! We will get back to you soon.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Place order
app.post('/api/orders', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Please login to place an order' });
        }
        
        const { items, totalAmount, shippingAddress, phone, paymentMethod } = req.body;
        
        // Generate unique order ID
        const orderId = 'ORDER_' + Date.now();
        
        const order = new Order({
            orderId,
            userId: req.session.user.id,
            items,
            totalAmount,
            shippingAddress,
            phone,
            paymentMethod
        });
        
        await order.save();
        
        res.status(201).json({
            message: 'Order placed successfully',
            order: {
                orderId: order.orderId,
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// Get order details
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId })
            .populate('items.productId', 'name image');
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, `${page}.html`);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

// Start server
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server running on http://0.0.0.0:${PORT}`);
// });
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}


module.exports = app;

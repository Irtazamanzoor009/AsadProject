# Simple Flowers & Coffee Store - MongoDB Integrated

A complete e-commerce website for flowers and coffee with MongoDB backend integration.

## Features

✅ **MongoDB Integration**
- Product data stored and retrieved from MongoDB
- User registration and authentication with MongoDB
- Contact form submissions saved to MongoDB
- Order management with MongoDB storage

✅ **Complete E-commerce Functionality**
- Product catalog with featured items
- Shopping cart with persistent storage
- User registration and login system
- Secure checkout process
- Order confirmation and tracking
- Contact form with database storage

✅ **Technical Stack**
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Session-based with bcrypt password hashing
- **CORS**: Enabled for cross-origin requests

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.0 or higher)
- npm or yarn package manager

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
```bash
# On Ubuntu/Linux
sudo systemctl start mongod
sudo systemctl enable mongod

# On macOS with Homebrew
brew services start mongodb-community

# On Windows
net start MongoDB
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Access the Application
Open your browser and navigate to: `http://localhost:3000`

## Database Schema

### Products Collection
```javascript
{
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String, // 'flowers' or 'coffee'
  inStock: Boolean,
  featured: Boolean
}
```

### Users Collection
```javascript
{
  name: String,
  email: String, // unique
  password: String, // bcrypt hashed
  isActive: Boolean
}
```

### Contact Messages Collection
```javascript
{
  name: String,
  email: String,
  message: String,
  status: String // 'new', 'read', 'replied'
}
```

### Orders Collection
```javascript
{
  orderId: String, // unique
  userId: ObjectId,
  items: Array,
  totalAmount: Number,
  shippingAddress: String,
  phone: String,
  paymentMethod: String,
  status: String // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
}
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Contact
- `POST /api/contact` - Submit contact form

### Orders
- `POST /api/orders` - Place new order
- `GET /api/orders/:orderId` - Get order details

## Testing

The application has been thoroughly tested with the following scenarios:

### ✅ Product Management
- Products are loaded from MongoDB and displayed correctly
- Featured products appear on homepage
- All products visible on products page

### ✅ User Authentication
- User registration with password confirmation
- User login with email and password
- Session management and logout functionality
- Password hashing with bcrypt

### ✅ Shopping Cart
- Add products to cart with quantity
- Cart persistence using localStorage
- Cart count updates in real-time
- Remove items from cart

### ✅ Checkout Process
- User authentication required for checkout
- Order form validation
- Order placement with MongoDB storage
- Order confirmation with unique order ID

### ✅ Contact Form
- Form submission with validation
- Data stored in MongoDB
- Success message display
- Form reset after submission

## Sample Data

The application comes with pre-seeded data including:

**Products:**
- Red Roses Bouquet ($29.99)
- Premium Coffee Beans ($19.99)
- Mixed Flower Arrangement ($39.99)
- Sunflower Bouquet ($24.99)
- Espresso Blend ($22.99)
- White Lilies ($34.99)
- Colombian Coffee ($26.99)
- Pink Tulips ($28.99)
- French Roast Coffee ($21.99)
- Orchid Plant ($45.99)

**Test Users:**
- test@example.com / password123
- john@example.com / password123
- jane@example.com / password123

## Configuration

### Environment Variables (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/flowers_coffee_store
SESSION_SECRET=flowers-coffee-secret-key
```

### Package.json Scripts
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed": "node seedData.js"
}
```

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Input validation and sanitization
- CORS configuration for secure cross-origin requests
- Environment variable configuration

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Responsive

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Troubleshooting

### MongoDB Connection Issues
1. Ensure MongoDB is running: `sudo systemctl status mongod`
2. Check MongoDB logs: `sudo journalctl -u mongod`
3. Verify connection string in .env file

### Port Already in Use
1. Change PORT in .env file
2. Or kill existing process: `sudo lsof -ti:3000 | xargs kill -9`

### Dependencies Issues
1. Delete node_modules: `rm -rf node_modules`
2. Clear npm cache: `npm cache clean --force`
3. Reinstall: `npm install`

## Development

### Adding New Features
1. Create new routes in server.js
2. Add corresponding frontend JavaScript
3. Update database models if needed
4. Test thoroughly

### Database Management
- View data: Use MongoDB Compass or mongo shell
- Backup: `mongodump --db flowers_coffee_store`
- Restore: `mongorestore --db flowers_coffee_store`

## License

MIT License - Feel free to use this project for learning and development purposes.

## Support

For issues and questions, please check the troubleshooting section or create an issue in the project repository.


const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri =  process.env.MONGODB_URI;
        
        if (!mongoUri) {
            throw new Error('MongoDB connection string not found');
        }
        
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;



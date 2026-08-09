const mongoose = require('mongoose');

let cachedConnection = null;

async function connectDB() {
    if (cachedConnection && cachedConnection.readyState === 1) {
        return cachedConnection;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is not set.');
    }

    try {
        const conn = await mongoose.connect(uri, {
            bufferCommands: false,
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        cachedConnection = conn.connection;
        console.log('MongoDB connected successfully.');
        return cachedConnection;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;
    }
}

module.exports = { connectDB };

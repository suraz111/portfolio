const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is not configured.');
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
            console.log('MongoDB connected successfully.');
            return mongooseInstance;
        }).catch((err) => {
            cached.promise = null;
            console.error('MongoDB connection error:', err.message);
            throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = { connectDB };


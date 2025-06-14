const mongoose = require("mongoose");
const dotenv = require("dotenv");
const debug = require("debug")("app:mongoose");

// Load .env
dotenv.config();

// Load config from .env or fallback
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/peekbi";
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

console.log("Connecting to MongoDB...");

// Global mongoose connection cache
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectWithRetry(retries = MAX_RETRIES) {
    try {
        if (cached.conn) {
            return cached.conn;
        }

        if (!cached.promise) {
            const opts = {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
                minPoolSize: 5,
                retryWrites: true,
                retryReads: true
            };

            cached.promise = mongoose.connect(mongoUri, opts)
                .then((mongoose) => {
                    debug("✅ MongoDB connected successfully");
                    return mongoose;
                })
                .catch((err) => {
                    debug("❌ MongoDB connection error:", err);
                    throw err;
                });
        }

        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        if (retries > 0) {
            debug(`Connection failed. Retrying in ${RETRY_INTERVAL/1000} seconds... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
            return connectWithRetry(retries - 1);
        }
        throw error;
    }
}

// Handle connection events
mongoose.connection.on('error', (err) => {
    debug('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    debug('MongoDB disconnected. Attempting to reconnect...');
    cached.conn = null;
    cached.promise = null;
    connectWithRetry();
});

mongoose.connection.on('reconnected', () => {
    debug('MongoDB reconnected successfully');
});

// Initial connection
connectWithRetry().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});

module.exports = mongoose.connection;

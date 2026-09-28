const mongoose = require('mongoose');

// Cache database connection across serverless lambda executions
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If connection is already open and ready (readyState: 1 = connected)
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '';

  if (!uri) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error('MONGODB_URI environment variable is missing.');
    }

    // Local dev fallback only
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      if (!global.__mongoMemoryServer) {
        global.__mongoMemoryServer = await MongoMemoryServer.create();
      }
      const memUri = global.__mongoMemoryServer.getUri();
      console.log(`ℹ️  In-memory MongoDB started at: ${memUri}`);
      const conn = await mongoose.connect(memUri);
      cached.conn = conn;
      return conn;
    } catch (memErr) {
      throw new Error(`MONGODB_URI is required: ${memErr.message}`);
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset promise so subsequent requests can retry
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }

  return cached.conn;
}

module.exports = connectDB;
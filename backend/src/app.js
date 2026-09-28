const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const seedData = require('./utils/seedAdmin');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

const app = express();

let seedInitialized = false;

// Enable CORS for all incoming requests and preflight OPTIONS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoints (placed before DB connection check for instant status reporting)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Zam Zam Cafe API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : (mongoose.connection.readyState === 2 ? 'connecting' : 'disconnected')
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Database initialization middleware for serverless requests
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    await connectDB();

    // Trigger seed in background on initial boot without stalling incoming requests
    if (!seedInitialized) {
      seedInitialized = true;
      seedData().catch((err) => {
        console.warn('Initial seed note:', err.message);
      });
    }

    next();
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message
    });
  }
});

// API Routes - registered with both /api prefix and root for full Vercel compatibility
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);

app.use('/api/upload', uploadRoutes);
app.use('/upload', uploadRoutes);

app.use('/api/delivery-fee', deliveryRoutes);
app.use('/delivery-fee', deliveryRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  const status = err.status || 500;

  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
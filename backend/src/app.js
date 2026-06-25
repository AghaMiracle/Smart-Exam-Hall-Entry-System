const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { corsMiddleware } = require('./config/cors');
const { generalLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// ==========================================
// Security Middleware
// ==========================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploaded files
}));

// ==========================================
// CORS
// ==========================================
app.use(corsMiddleware);

// ==========================================
// Compression
// ==========================================
app.use(compression());

// ==========================================
// Rate Limiting
// ==========================================
app.use('/api', generalLimiter);

// ==========================================
// Body Parsers
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// Static Files (uploads)
// ==========================================
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ==========================================
// Socket.io reference middleware
// ==========================================
app.use((req, res, next) => {
  req.io = app.get('io');
  next();
});

// ==========================================
// Request Logging (development)
// ==========================================
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// ==========================================
// API Routes
// ==========================================
app.use('/api', routes);

// ==========================================
// 404 Handler
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ==========================================
// Global Error Handler
// ==========================================
app.use(errorHandler);

module.exports = app;

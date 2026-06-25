const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-hall-entry',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',

  // AES-256
  AES_SECRET_KEY: process.env.AES_SECRET_KEY,
  AES_IV: process.env.AES_IV,

  // Resend (Email)
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || 'onboarding@resend.dev',

  // Client URLs
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  STUDENT_CLIENT_URL: process.env.STUDENT_CLIENT_URL || 'http://localhost:5174',

  // Security
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
  LOCK_TIME_MINUTES: parseInt(process.env.LOCK_TIME_MINUTES, 10) || 30,

  // QR Code
  QR_EXPIRY_HOURS: parseInt(process.env.QR_EXPIRY_HOURS, 10) || 24,

  // Helpers
  isDev() {
    return this.NODE_ENV === 'development';
  },
  isProd() {
    return this.NODE_ENV === 'production';
  },
};

// Validate required env vars in production
if (env.isProd()) {
  const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'AES_SECRET_KEY', 'AES_IV', 'MONGODB_URI'];
  const missing = required.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = env;

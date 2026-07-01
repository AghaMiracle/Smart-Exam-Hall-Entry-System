const mongoose = require('mongoose');
const logger = require('../utils/logger');
const env = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      // 5s is too short for Atlas: with a 10s heartbeat interval, the driver
      // can time out before it finishes discovering the replica-set primary
      // (especially across regions / during a brief failover). 30s is the
      // Mongoose default and gives the topology time to settle.
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      // Keep idle sockets alive so we don't repeatedly re-handshake.
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    // Log the full error so the caller (startServer) gets the real cause,
    // not just an empty `.message` string.
    logger.error('MongoDB connection failed:', error);
    throw error;
  }
};

module.exports = connectDB;

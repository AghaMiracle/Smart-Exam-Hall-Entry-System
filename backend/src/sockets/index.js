const logger = require('../utils/logger');

/**
 * Initialize Socket.io event handlers
 * @param {import('socket.io').Server} io
 */
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join institution room
    socket.on('join:institution', (institutionId) => {
      if (institutionId) {
        const room = `institution:${institutionId}`;
        socket.join(room);
        logger.debug(`Socket ${socket.id} joined room: ${room}`);
      }
    });

    // Leave institution room
    socket.on('leave:institution', (institutionId) => {
      if (institutionId) {
        const room = `institution:${institutionId}`;
        socket.leave(room);
        logger.debug(`Socket ${socket.id} left room: ${room}`);
      }
    });

    // Ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error: ${socket.id}`, error);
    });
  });

  logger.info('Socket.io initialized');
};

module.exports = initializeSocket;

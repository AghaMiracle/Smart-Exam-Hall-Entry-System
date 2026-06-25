const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const institutionRoutes = require('./institutionRoutes');
const studentRoutes = require('./studentRoutes');
const examRoutes = require('./examRoutes');
const qrCodeRoutes = require('./qrCodeRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const auditLogRoutes = require('./auditLogRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Hall Entry System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/institutions', institutionRoutes);
router.use('/students', studentRoutes);
router.use('/exams', examRoutes);
router.use('/qrcodes', qrCodeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;

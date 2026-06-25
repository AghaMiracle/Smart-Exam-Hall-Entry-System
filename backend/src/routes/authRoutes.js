const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authenticateStudent } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimiter');
const {
  registerValidation,
  loginValidation,
  studentLoginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('../validations/authValidation');

// Public routes (with auth rate limiting)
router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/student/login', authLimiter, studentLoginValidation, validate, authController.studentLogin);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidation, validate, authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.post('/student/logout', authenticateStudent, authController.logout);

module.exports = router;


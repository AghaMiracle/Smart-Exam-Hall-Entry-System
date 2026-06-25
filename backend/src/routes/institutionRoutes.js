const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');
const { authenticate, authorize } = require('../middlewares/auth');
const { uploadLogo } = require('../middlewares/upload');

// All routes require authentication
router.use(authenticate);

// Institution profile
router.get('/profile', authorize('institution_admin', 'exam_officer'), institutionController.getProfile);
router.put('/profile', authorize('institution_admin'), uploadLogo, institutionController.updateProfile);

// Super Admin routes
router.get('/', authorize('super_admin'), institutionController.listInstitutions);
router.patch('/:id/status', authorize('super_admin'), institutionController.updateStatus);

module.exports = router;

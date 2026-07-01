const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/qrCodeController');
const { authenticate, authenticateStudent, authorize } = require('../middlewares/auth');
const { verifyLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { generateQRValidation, bulkGenerateQRValidation, verifyQRValidation } = require('../validations/qrCodeValidation');

// ==========================================
// Student QR routes (Student JWT)
// ==========================================
router.get('/student/active', authenticateStudent, qrCodeController.getStudentActiveQR);
router.post('/student/verify', authenticateStudent, qrCodeController.studentVerifyQR);

// ==========================================
// Institution routes (Admin/Officer JWT)
// ==========================================
router.use(authenticate);

router.post('/generate', authorize('institution_admin', 'exam_officer'), generateQRValidation, validate, qrCodeController.generateQR);
router.post('/bulk-generate', authorize('institution_admin', 'exam_officer'), bulkGenerateQRValidation, validate, qrCodeController.bulkGenerateQR);
router.post('/exam-qr', authorize('institution_admin', 'exam_officer'), bulkGenerateQRValidation, validate, qrCodeController.generateExamQR);
router.get('/exam/:examId', authorize('institution_admin', 'exam_officer'), qrCodeController.getExamQRCodes);
router.post('/verify', authorize('institution_admin', 'exam_officer'), verifyLimiter, verifyQRValidation, validate, qrCodeController.verifyQR);
router.get('/:id', authorize('institution_admin', 'exam_officer'), qrCodeController.getQRCode);
router.patch('/:id/regenerate', authorize('institution_admin', 'exam_officer'), qrCodeController.regenerateQR);

module.exports = router;

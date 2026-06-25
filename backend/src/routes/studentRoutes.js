const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, authenticateStudent, authorize } = require('../middlewares/auth');
const { uploadPassport, uploadImport } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const { createStudentValidation, updateStudentValidation } = require('../validations/studentValidation');

// ==========================================
// Student self-service routes (Student JWT)
// ==========================================
router.get('/me/profile', authenticateStudent, studentController.getMyProfile);
router.put('/me/profile', authenticateStudent, studentController.updateMyProfile);
router.put('/me/passport', authenticateStudent, uploadPassport, studentController.uploadPassport);

// ==========================================
// Institution admin routes (Admin/Officer JWT)
// ==========================================
router.use(authenticate); // All routes below require institution auth

router.post('/', authorize('institution_admin', 'exam_officer'), createStudentValidation, validate, studentController.createStudent);
router.post('/bulk-import', authorize('institution_admin'), uploadImport, studentController.bulkImport);
router.get('/export', authorize('institution_admin'), studentController.exportStudents);
router.get('/filter-options', authorize('institution_admin', 'exam_officer'), studentController.getFilterOptions);
router.get('/', authorize('institution_admin', 'exam_officer'), studentController.getStudents);
router.get('/:id', authorize('institution_admin', 'exam_officer'), studentController.getStudent);
router.put('/:id', authorize('institution_admin'), updateStudentValidation, validate, studentController.updateStudent);
router.patch('/:id/status', authorize('institution_admin'), studentController.updateStatus);

module.exports = router;

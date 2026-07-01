const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticate, authenticateStudent, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createExamValidation, updateExamValidation } = require('../validations/examValidation');

// ==========================================
// Student exam routes (Student JWT)
// ==========================================
router.get('/student/active', authenticateStudent, examController.getActiveExams);
router.get('/student/upcoming', authenticateStudent, examController.getUpcomingExams);
router.get('/student/history', authenticateStudent, examController.getExamHistory);
router.get('/student/available', authenticateStudent, examController.getAvailableExams);
router.post('/student/:id/register', authenticateStudent, examController.registerForExam);
router.delete('/student/:id/register', authenticateStudent, examController.unregisterFromExam);

// ==========================================
// Institution routes (Admin/Officer JWT)
// ==========================================
router.use(authenticate);

router.post('/', authorize('institution_admin'), createExamValidation, validate, examController.createExam);
router.get('/', authorize('institution_admin', 'exam_officer'), examController.getExams);
router.get('/:id', authorize('institution_admin', 'exam_officer'), examController.getExam);
router.put('/:id', authorize('institution_admin'), updateExamValidation, validate, examController.updateExam);
router.delete('/:id', authorize('institution_admin'), examController.deleteExam);
router.patch('/:id/status', authorize('institution_admin'), examController.updateStatus);
router.patch('/:id/officers', authorize('institution_admin'), examController.assignOfficers);

module.exports = router;

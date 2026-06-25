const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authenticateStudent, authorize } = require('../middlewares/auth');

// ==========================================
// Student attendance routes (Student JWT)
// ==========================================
router.get('/student/history', authenticateStudent, attendanceController.getStudentHistory);

// ==========================================
// Institution routes (Admin/Officer JWT)
// ==========================================
router.use(authenticate);

router.get('/', authorize('institution_admin', 'exam_officer'), attendanceController.getAttendance);
router.get('/exam/:examId', authorize('institution_admin', 'exam_officer'), attendanceController.getAttendanceByExam);
router.get('/exam/:examId/stats', authorize('institution_admin', 'exam_officer'), attendanceController.getExamStats);
router.get('/export/:examId', authorize('institution_admin', 'exam_officer'), attendanceController.exportAttendance);
router.post('/offline-sync', authorize('institution_admin', 'exam_officer'), attendanceController.offlineSync);

module.exports = router;

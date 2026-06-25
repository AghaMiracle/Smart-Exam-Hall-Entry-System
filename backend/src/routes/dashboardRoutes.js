const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authenticateStudent, authorize } = require('../middlewares/auth');

// Student dashboard (Student JWT)
router.get('/student', authenticateStudent, dashboardController.getStudentDashboard);

// Institution dashboard (Admin/Officer JWT)
router.get('/institution', authenticate, authorize('institution_admin', 'exam_officer'), dashboardController.getInstitutionDashboard);
router.get('/trends', authenticate, authorize('institution_admin'), dashboardController.getAttendanceTrends);

module.exports = router;

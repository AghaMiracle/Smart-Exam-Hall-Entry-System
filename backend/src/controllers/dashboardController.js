const dashboardService = require('../services/dashboardService');
const { successResponse } = require('../utils/helpers');

class DashboardController {
  async getInstitutionDashboard(req, res, next) {
    try {
      const stats = await dashboardService.getInstitutionStats(req.user.institutionId);
      return successResponse(res, 'Dashboard stats retrieved.', stats);
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceTrends(req, res, next) {
    try {
      const trends = await dashboardService.getAttendanceTrends(
        req.user.institutionId,
        req.query
      );
      return successResponse(res, 'Attendance trends retrieved.', trends);
    } catch (error) {
      next(error);
    }
  }

  async getStudentDashboard(req, res, next) {
    try {
      const data = await dashboardService.getStudentDashboard(
        req.user.id,
        req.user.institutionId
      );
      return successResponse(res, 'Student dashboard retrieved.', data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();

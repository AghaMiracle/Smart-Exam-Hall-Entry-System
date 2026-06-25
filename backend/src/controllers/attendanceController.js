const attendanceService = require('../services/attendanceService');
const { successResponse } = require('../utils/helpers');

class AttendanceController {
  async getAttendance(req, res, next) {
    try {
      const result = await attendanceService.getAttendance(req.user.institutionId, req.query);
      return successResponse(res, 'Attendance records retrieved.', result.records, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceByExam(req, res, next) {
    try {
      const result = await attendanceService.getAttendanceByExam(req.params.examId, req.query);
      return successResponse(res, 'Attendance records retrieved.', result.records, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getExamStats(req, res, next) {
    try {
      const stats = await attendanceService.getExamAttendanceStats(req.params.examId);
      return successResponse(res, 'Attendance stats retrieved.', stats);
    } catch (error) {
      next(error);
    }
  }

  async exportAttendance(req, res, next) {
    try {
      const format = req.query.format || 'csv';
      const result = await attendanceService.exportAttendance(req.params.examId, format);

      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.send(result.buffer);
    } catch (error) {
      next(error);
    }
  }

  async getStudentHistory(req, res, next) {
    try {
      const result = await attendanceService.getStudentHistory(req.user.id, req.query);
      return successResponse(res, 'Attendance history retrieved.', result.records, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async offlineSync(req, res, next) {
    try {
      const { records } = req.body;
      if (!Array.isArray(records)) {
        return res.status(400).json({ success: false, message: 'Records must be an array.' });
      }
      const result = await attendanceService.syncOfflineRecords(
        records,
        req.user.institutionId,
        req.user.id
      );
      return successResponse(res, 'Offline sync completed.', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttendanceController();

const attendanceRepository = require('../repositories/attendanceRepository');
const { AppError, getPaginationMeta, parsePaginationQuery } = require('../utils/helpers');
const { generateCSV, generateExcel } = require('../utils/csvParser');

class AttendanceService {
  /**
   * Get attendance records for an institution
   */
  async getAttendance(institutionId, queryParams) {
    const { page, limit, sort } = parsePaginationQuery(queryParams);

    const query = { institutionId };
    if (queryParams.examId) query.examId = queryParams.examId;
    if (queryParams.status) query.verificationStatus = queryParams.status;

    const { data, total } = await attendanceRepository.findPaginated(query, page, limit, sort);

    return {
      records: data,
      pagination: getPaginationMeta(page, limit, total),
    };
  }

  /**
   * Get attendance records for a specific exam
   */
  async getAttendanceByExam(examId, queryParams) {
    const { page, limit, sort } = parsePaginationQuery(queryParams);

    const query = { examId };
    if (queryParams.status) query.verificationStatus = queryParams.status;

    const { data, total } = await attendanceRepository.findPaginated(query, page, limit, sort);

    return {
      records: data,
      pagination: getPaginationMeta(page, limit, total),
    };
  }

  /**
   * Get attendance stats for an exam
   */
  async getExamAttendanceStats(examId) {
    return attendanceRepository.getExamStats(examId);
  }

  /**
   * Export attendance for an exam
   */
  async exportAttendance(examId, format = 'csv') {
    const records = await attendanceRepository.getAllByExam(examId);

    const exportData = records.map((r) => ({
      'Student Name': r.studentId
        ? `${r.studentId.firstName} ${r.studentId.lastName}`
        : 'N/A',
      'Matric Number': r.studentId?.matricNumber || 'N/A',
      Department: r.studentId?.department || 'N/A',
      Level: r.studentId?.level || 'N/A',
      Status: r.verificationStatus,
      'Rejection Reason': r.rejectionReason || '',
      'Verified By': r.verifiedBy
        ? `${r.verifiedBy.firstName} ${r.verifiedBy.lastName}`
        : 'N/A',
      'Verified At': r.verifiedAt ? new Date(r.verifiedAt).toLocaleString() : '',
    }));

    if (format === 'excel' || format === 'xlsx') {
      return {
        buffer: generateExcel(exportData, 'Attendance'),
        filename: `attendance_${examId}_${Date.now()}.xlsx`,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }

    const columns = Object.keys(exportData[0] || {}).map((key) => ({
      key,
      header: key,
    }));
    return {
      buffer: generateCSV(exportData, columns),
      filename: `attendance_${examId}_${Date.now()}.csv`,
      contentType: 'text/csv',
    };
  }

  /**
   * Get student's attendance history
   */
  async getStudentHistory(studentId, queryParams) {
    const { page, limit } = parsePaginationQuery(queryParams);
    const { data, total } = await attendanceRepository.getStudentHistory(studentId, page, limit);

    return {
      records: data,
      pagination: getPaginationMeta(page, limit, total),
    };
  }

  /**
   * Sync offline attendance records
   */
  async syncOfflineRecords(records, institutionId, userId) {
    const results = { total: records.length, synced: 0, failed: 0, errors: [] };

    for (const record of records) {
      try {
        await attendanceRepository.create({
          ...record,
          institutionId,
          verifiedBy: userId,
          isOfflineSync: true,
        });
        results.synced++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          record,
          error: error.message,
        });
      }
    }

    return results;
  }
}

module.exports = new AttendanceService();

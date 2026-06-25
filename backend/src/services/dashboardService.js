const studentRepository = require('../repositories/studentRepository');
const examRepository = require('../repositories/examRepository');
const attendanceRepository = require('../repositories/attendanceRepository');
const qrCodeRepository = require('../repositories/qrCodeRepository');

class DashboardService {
  /**
   * Get institution dashboard statistics
   */
  async getInstitutionStats(institutionId) {
    const [
      totalStudents,
      activeStudents,
      suspendedStudents,
      totalExams,
      activeExams,
      upcomingExams,
      completedExams,
      totalAttendance,
      verifiedAttendance,
      rejectedAttendance,
      totalQRCodes,
    ] = await Promise.all([
      studentRepository.count({ institutionId }),
      studentRepository.count({ institutionId, status: 'active' }),
      studentRepository.count({ institutionId, status: 'suspended' }),
      examRepository.count({ institutionId }),
      examRepository.count({ institutionId, status: 'active' }),
      examRepository.count({ institutionId, status: 'upcoming' }),
      examRepository.count({ institutionId, status: 'completed' }),
      attendanceRepository.count({ institutionId }),
      attendanceRepository.count({ institutionId, verificationStatus: 'verified' }),
      attendanceRepository.count({ institutionId, verificationStatus: 'rejected' }),
      qrCodeRepository.count({ institutionId }),
    ]);

    // Recent activities (last 10 attendance records)
    const { data: recentActivity } = await attendanceRepository.findPaginated(
      { institutionId },
      1,
      10,
      '-verifiedAt'
    );

    return {
      students: {
        total: totalStudents,
        active: activeStudents,
        suspended: suspendedStudents,
      },
      exams: {
        total: totalExams,
        active: activeExams,
        upcoming: upcomingExams,
        completed: completedExams,
      },
      attendance: {
        total: totalAttendance,
        verified: verifiedAttendance,
        rejected: rejectedAttendance,
        verificationRate:
          totalAttendance > 0
            ? Math.round((verifiedAttendance / totalAttendance) * 100)
            : 0,
      },
      qrCodes: {
        total: totalQRCodes,
      },
      recentActivity,
    };
  }

  /**
   * Get attendance trend data for charts
   */
  async getAttendanceTrends(institutionId, queryParams = {}) {
    const dateRange = {};
    if (queryParams.from) dateRange.from = queryParams.from;
    if (queryParams.to) dateRange.to = queryParams.to;

    // Default to last 30 days
    if (!dateRange.from) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateRange.from = thirtyDaysAgo.toISOString();
    }

    const stats = await attendanceRepository.getInstitutionStats(institutionId, dateRange);

    // Transform aggregation results into chart-friendly format
    const trendMap = {};
    stats.forEach((item) => {
      const date = item._id.date;
      if (!trendMap[date]) {
        trendMap[date] = { date, verified: 0, rejected: 0 };
      }
      trendMap[date][item._id.status] = item.count;
    });

    return Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get student dashboard data
   */
  async getStudentDashboard(studentId, institutionId, department, level) {
    // Get active and upcoming exams
    const [activeExams, upcomingExams] = await Promise.all([
      examRepository.findActiveForStudent(institutionId, department, level),
      examRepository.findUpcomingForStudent(institutionId, department, level),
    ]);

    // Get attendance history
    const { data: attendanceHistory, total: totalAttendance } =
      await attendanceRepository.getStudentHistory(studentId, 1, 5);

    // Get active QR codes
    const activeQRCodes = await qrCodeRepository.findActiveForStudent(studentId);

    // Calculate attendance stats
    const verifiedCount = await attendanceRepository.count({
      studentId,
      verificationStatus: 'verified',
    });

    return {
      activeExams,
      upcomingExams,
      attendanceHistory,
      activeQRCodes,
      stats: {
        totalExamsAttended: verifiedCount,
        totalAttendanceRecords: totalAttendance,
      },
    };
  }
}

module.exports = new DashboardService();

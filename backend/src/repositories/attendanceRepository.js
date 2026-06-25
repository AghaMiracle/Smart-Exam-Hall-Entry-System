const Attendance = require('../models/Attendance');

class AttendanceRepository {
  async create(data) {
    return Attendance.create(data);
  }

  async findById(id) {
    return Attendance.findById(id)
      .populate('studentId', 'firstName lastName matricNumber department level passportPhoto')
      .populate('examId', 'title courseCode examDate venue')
      .populate('verifiedBy', 'firstName lastName');
  }

  async findOne(query) {
    return Attendance.findOne(query);
  }

  async findByExam(examId, filters = {}) {
    const query = { examId };
    if (filters.status) query.verificationStatus = filters.status;
    if (filters.search) {
      // Need to do a separate lookup or use aggregate for search on populated fields
    }
    return query;
  }

  async findPaginated(query = {}, page = 1, limit = 20, sort = '-verifiedAt') {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Attendance.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('studentId', 'firstName lastName matricNumber department level passportPhoto')
        .populate('examId', 'title courseCode examDate venue')
        .populate('verifiedBy', 'firstName lastName'),
      Attendance.countDocuments(query),
    ]);
    return { data, total };
  }

  async findByStudentAndExam(studentId, examId) {
    return Attendance.findOne({
      studentId,
      examId,
      verificationStatus: 'verified',
    });
  }

  async getExamStats(examId) {
    const stats = await Attendance.aggregate([
      { $match: { examId: require('mongoose').Types.ObjectId.createFromHexString(examId) } },
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 },
        },
      },
    ]);
    return stats.reduce(
      (acc, s) => {
        acc[s._id] = s.count;
        return acc;
      },
      { verified: 0, rejected: 0 }
    );
  }

  async getStudentHistory(studentId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Attendance.find({ studentId })
        .sort('-verifiedAt')
        .skip(skip)
        .limit(limit)
        .populate('examId', 'title courseCode examDate venue startTime endTime'),
      Attendance.countDocuments({ studentId }),
    ]);
    return { data, total };
  }

  async getInstitutionStats(institutionId, dateRange = {}) {
    const match = { institutionId: require('mongoose').Types.ObjectId.createFromHexString(institutionId.toString()) };
    if (dateRange.from || dateRange.to) {
      match.verifiedAt = {};
      if (dateRange.from) match.verifiedAt.$gte = new Date(dateRange.from);
      if (dateRange.to) match.verifiedAt.$lte = new Date(dateRange.to);
    }

    return Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            status: '$verificationStatus',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$verifiedAt' } },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);
  }

  async count(query = {}) {
    return Attendance.countDocuments(query);
  }

  async getAllByExam(examId) {
    return Attendance.find({ examId })
      .populate('studentId', 'firstName lastName matricNumber department level')
      .populate('verifiedBy', 'firstName lastName')
      .sort('-verifiedAt');
  }
}

module.exports = new AttendanceRepository();

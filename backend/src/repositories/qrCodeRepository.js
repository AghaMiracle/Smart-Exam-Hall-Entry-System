const QRCode = require('../models/QRCode');

class QRCodeRepository {
  async create(data) {
    return QRCode.create(data);
  }

  async createMany(dataArray) {
    return QRCode.insertMany(dataArray);
  }

  async findById(id) {
    return QRCode.findById(id)
      .populate('studentId', 'firstName lastName matricNumber department level')
      .populate('examId', 'title courseCode examDate venue');
  }

  async findOne(query) {
    return QRCode.findOne(query);
  }

  async findByStudentAndExam(studentId, examId) {
    return QRCode.findOne({
      studentId,
      examId,
      status: { $in: ['active'] },
    });
  }

  async findActiveForStudent(studentId) {
    return QRCode.find({
      studentId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    })
      .populate('examId', 'title courseCode examDate startTime endTime venue status')
      .sort('-createdAt');
  }

  async findByExam(examId) {
    return QRCode.find({ examId })
      .populate('studentId', 'firstName lastName matricNumber')
      .sort('-createdAt');
  }

  async findPaginated(query = {}, page = 1, limit = 20, sort = '-createdAt') {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      QRCode.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('studentId', 'firstName lastName matricNumber')
        .populate('examId', 'title courseCode examDate'),
      QRCode.countDocuments(query),
    ]);
    return { data, total };
  }

  async update(id, data) {
    return QRCode.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async markUsed(id) {
    return QRCode.findByIdAndUpdate(
      id,
      {
        isUsed: true,
        usedAt: new Date(),
        status: 'used',
      },
      { new: true }
    );
  }

  async revokeByStudentAndExam(studentId, examId) {
    return QRCode.updateMany(
      { studentId, examId, status: 'active' },
      { status: 'revoked' }
    );
  }

  async findActiveExamQR(examId) {
    return QRCode.findOne({ examId, type: 'exam', status: 'active' });
  }

  async revokeExamQRs(examId) {
    return QRCode.updateMany(
      { examId, type: 'exam', status: 'active' },
      { status: 'revoked' }
    );
  }

  async expireOld() {
    return QRCode.updateMany(
      { expiresAt: { $lt: new Date() }, status: 'active' },
      { status: 'expired' }
    );
  }

  async count(query = {}) {
    return QRCode.countDocuments(query);
  }
}

module.exports = new QRCodeRepository();

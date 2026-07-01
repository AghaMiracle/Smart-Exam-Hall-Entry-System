const Exam = require('../models/Exam');

class ExamRepository {
  async create(data) {
    return Exam.create(data);
  }

  async findById(id) {
    return Exam.findById(id)
      .populate('assignedOfficers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');
  }

  async findOne(query) {
    return Exam.findOne(query);
  }

  async findMany(query = {}, options = {}) {
    const { sort = '-examDate', populate = '' } = options;
    return Exam.find(query).sort(sort).populate(populate);
  }

  async findPaginated(query = {}, page = 1, limit = 20, sort = '-examDate') {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Exam.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('assignedOfficers', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName'),
      Exam.countDocuments(query),
    ]);
    return { data, total };
  }

  async findByInstitution(institutionId, filters = {}) {
    const query = { institutionId };
    if (filters.status) query.status = filters.status;
    if (filters.department) query.department = filters.department;
    if (filters.level) query.level = filters.level;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { courseCode: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return query;
  }

  async findActiveForStudent(institutionId, studentId) {
    return Exam.find({
      institutionId,
      registeredStudents: studentId,
      status: 'active',
    }).sort('examDate');
  }

  async findUpcomingForStudent(institutionId, studentId) {
    return Exam.find({
      institutionId,
      registeredStudents: studentId,
      status: 'upcoming',
      examDate: { $gte: new Date() },
    }).sort('examDate');
  }

  async findHistoryForStudent(institutionId, studentId) {
    return Exam.find({
      institutionId,
      registeredStudents: studentId,
      status: { $in: ['completed', 'archived'] },
    }).sort('-examDate');
  }

  async findAvailableForStudent(institutionId, studentId, department, level) {
    // Exams the student is *eligible* to register for: same institution,
    // department + level match, still open (upcoming or active), not past,
    // and the student hasn't already registered.
    return Exam.find({
      institutionId,
      department,
      level,
      status: { $in: ['upcoming', 'active'] },
      examDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      registeredStudents: { $ne: studentId },
    }).sort('examDate');
  }

  async findRegisteredForStudent(institutionId, studentId) {
    return Exam.find({
      institutionId,
      registeredStudents: studentId,
    }).sort('-examDate');
  }

  async isStudentRegistered(examId, studentId) {
    const exists = await Exam.exists({ _id: examId, registeredStudents: studentId });
    return !!exists;
  }

  async registerStudent(examId, studentId) {
    return Exam.findByIdAndUpdate(
      examId,
      { $addToSet: { registeredStudents: studentId } },
      { new: true }
    );
  }

  async unregisterStudent(examId, studentId) {
    return Exam.findByIdAndUpdate(
      examId,
      { $pull: { registeredStudents: studentId } },
      { new: true }
    );
  }

  async update(id, data) {
    return Exam.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return Exam.findByIdAndDelete(id);
  }

  async count(query = {}) {
    return Exam.countDocuments(query);
  }
}

module.exports = new ExamRepository();

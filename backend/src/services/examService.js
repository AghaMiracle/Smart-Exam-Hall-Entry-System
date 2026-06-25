const examRepository = require('../repositories/examRepository');
const auditLogService = require('./auditLogService');
const { AppError, getPaginationMeta, parsePaginationQuery } = require('../utils/helpers');

class ExamService {
  async createExam(data, institutionId, userId) {
    const exam = await examRepository.create({
      ...data,
      institutionId,
      createdBy: userId,
    });

    await auditLogService.log({
      userId,
      userType: 'user',
      action: 'EXAM_CREATED',
      resource: 'Exam',
      resourceId: exam._id,
      institutionId,
      details: { title: exam.title, courseCode: exam.courseCode },
    });

    return exam;
  }

  async getExams(institutionId, queryParams) {
    const { page, limit, sort } = parsePaginationQuery(queryParams);

    const query = await examRepository.findByInstitution(institutionId, {
      status: queryParams.status,
      department: queryParams.department,
      level: queryParams.level,
      search: queryParams.search,
    });

    const { data, total } = await examRepository.findPaginated(query, page, limit, sort);

    return {
      exams: data,
      pagination: getPaginationMeta(page, limit, total),
    };
  }

  async getExamById(examId, institutionId) {
    const exam = await examRepository.findById(examId);
    if (!exam) {
      throw new AppError('Exam not found.', 404);
    }

    if (exam.institutionId.toString() !== institutionId.toString()) {
      throw new AppError('Exam not found.', 404);
    }

    return exam;
  }

  async updateExam(examId, data, institutionId, userId) {
    await this.getExamById(examId, institutionId);

    delete data.institutionId;
    delete data.createdBy;

    const updated = await examRepository.update(examId, data);

    await auditLogService.log({
      userId,
      userType: 'user',
      action: 'EXAM_UPDATED',
      resource: 'Exam',
      resourceId: examId,
      institutionId,
      details: { updatedFields: Object.keys(data) },
    });

    return updated;
  }

  async deleteExam(examId, institutionId, userId) {
    const exam = await this.getExamById(examId, institutionId);

    await examRepository.delete(examId);

    await auditLogService.log({
      userId,
      userType: 'user',
      action: 'EXAM_DELETED',
      resource: 'Exam',
      resourceId: examId,
      institutionId,
      details: { title: exam.title },
    });

    return exam;
  }

  async updateExamStatus(examId, status, institutionId, userId) {
    if (!['upcoming', 'active', 'completed', 'archived'].includes(status)) {
      throw new AppError('Invalid status.', 400);
    }

    await this.getExamById(examId, institutionId);

    const updated = await examRepository.update(examId, { status });

    await auditLogService.log({
      userId,
      userType: 'user',
      action: `EXAM_STATUS_${status.toUpperCase()}`,
      resource: 'Exam',
      resourceId: examId,
      institutionId,
    });

    return updated;
  }

  async assignOfficers(examId, officerIds, institutionId, userId) {
    await this.getExamById(examId, institutionId);

    const updated = await examRepository.update(examId, {
      assignedOfficers: officerIds,
    });

    await auditLogService.log({
      userId,
      userType: 'user',
      action: 'EXAM_OFFICERS_ASSIGNED',
      resource: 'Exam',
      resourceId: examId,
      institutionId,
      details: { officerCount: officerIds.length },
    });

    return updated;
  }

  // Student-facing methods
  async getActiveExamsForStudent(institutionId, department, level) {
    return examRepository.findActiveForStudent(institutionId, department, level);
  }

  async getUpcomingExamsForStudent(institutionId, department, level) {
    return examRepository.findUpcomingForStudent(institutionId, department, level);
  }

  async getExamHistory(institutionId, department, level) {
    const query = {
      institutionId,
      department,
      level,
      status: { $in: ['completed', 'archived'] },
    };
    return examRepository.findMany(query, { sort: '-examDate' });
  }
}

module.exports = new ExamService();

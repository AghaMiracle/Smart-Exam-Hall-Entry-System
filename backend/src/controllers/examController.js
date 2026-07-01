const examService = require('../services/examService');
const { successResponse } = require('../utils/helpers');

class ExamController {
  async createExam(req, res, next) {
    try {
      const exam = await examService.createExam(req.body, req.user.institutionId, req.user.id);
      return successResponse(res, 'Exam created successfully.', exam, null, 201);
    } catch (error) {
      next(error);
    }
  }

  async getExams(req, res, next) {
    try {
      const result = await examService.getExams(req.user.institutionId, req.query);
      return successResponse(res, 'Exams retrieved.', result.exams, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getExam(req, res, next) {
    try {
      const exam = await examService.getExamById(req.params.id, req.user.institutionId);
      return successResponse(res, 'Exam retrieved.', exam);
    } catch (error) {
      next(error);
    }
  }

  async updateExam(req, res, next) {
    try {
      const exam = await examService.updateExam(
        req.params.id,
        req.body,
        req.user.institutionId,
        req.user.id
      );
      return successResponse(res, 'Exam updated successfully.', exam);
    } catch (error) {
      next(error);
    }
  }

  async deleteExam(req, res, next) {
    try {
      await examService.deleteExam(req.params.id, req.user.institutionId, req.user.id);
      return successResponse(res, 'Exam deleted successfully.');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const exam = await examService.updateExamStatus(
        req.params.id,
        req.body.status,
        req.user.institutionId,
        req.user.id
      );
      return successResponse(res, 'Exam status updated.', exam);
    } catch (error) {
      next(error);
    }
  }

  async assignOfficers(req, res, next) {
    try {
      const exam = await examService.assignOfficers(
        req.params.id,
        req.body.officerIds,
        req.user.institutionId,
        req.user.id
      );
      return successResponse(res, 'Officers assigned.', exam);
    } catch (error) {
      next(error);
    }
  }

  // Student endpoints
  async getActiveExams(req, res, next) {
    try {
      const exams = await examService.getActiveExamsForStudent(
        req.user.institutionId,
        req.user.id
      );
      return successResponse(res, 'Active exams retrieved.', exams);
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingExams(req, res, next) {
    try {
      const exams = await examService.getUpcomingExamsForStudent(
        req.user.institutionId,
        req.user.id
      );
      return successResponse(res, 'Upcoming exams retrieved.', exams);
    } catch (error) {
      next(error);
    }
  }

  async getExamHistory(req, res, next) {
    try {
      const exams = await examService.getExamHistory(
        req.user.institutionId,
        req.user.id
      );
      return successResponse(res, 'Exam history retrieved.', exams);
    } catch (error) {
      next(error);
    }
  }

  async getAvailableExams(req, res, next) {
    try {
      const exams = await examService.getAvailableExamsForStudent(
        req.user.institutionId,
        req.user.id,
        req.user.department,
        req.user.level
      );
      return successResponse(res, 'Available exams retrieved.', exams);
    } catch (error) {
      next(error);
    }
  }

  async registerForExam(req, res, next) {
    try {
      const result = await examService.registerStudentForExam(
        req.user.id,
        req.params.id,
        req.user.institutionId,
        req.user.department,
        req.user.level
      );
      const message = result.alreadyRegistered
        ? 'You are already registered for this exam.'
        : 'Registration successful.';
      return successResponse(res, message, { registered: true, exam: result.exam });
    } catch (error) {
      next(error);
    }
  }

  async unregisterFromExam(req, res, next) {
    try {
      const result = await examService.unregisterStudentFromExam(
        req.user.id,
        req.params.id,
        req.user.institutionId
      );
      const message = result.wasRegistered
        ? 'You have been unregistered from this exam.'
        : 'You were not registered for this exam.';
      return successResponse(res, message, { registered: false, exam: result.exam });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExamController();

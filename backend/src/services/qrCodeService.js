const qrCodeRepository = require('../repositories/qrCodeRepository');
const studentRepository = require('../repositories/studentRepository');
const examRepository = require('../repositories/examRepository');
const attendanceRepository = require('../repositories/attendanceRepository');
const auditLogService = require('./auditLogService');
const { encrypt, decrypt } = require('../utils/encryption');
const { generateQRImage } = require('../utils/qrGenerator');
const { AppError } = require('../utils/helpers');
const env = require('../config/env');
const logger = require('../utils/logger');
const crypto = require('crypto');

class QRCodeService {
  /**
   * Generate QR code for a student + exam pair
   */
  async generateQR(studentId, examId, institutionId, generatedBy) {
    // Verify student exists and is active
    const student = await studentRepository.findById(studentId);
    if (!student) throw new AppError('Student not found.', 404);
    if (student.status !== 'active') throw new AppError('Student account is not active.', 400);

    // Verify exam exists
    const exam = await examRepository.findById(examId);
    if (!exam) throw new AppError('Exam not found.', 404);
    if (exam.institutionId.toString() !== institutionId.toString()) {
      throw new AppError('Exam does not belong to your institution.', 403);
    }

    // Check for existing active QR
    const existingQR = await qrCodeRepository.findByStudentAndExam(studentId, examId);
    if (existingQR && !existingQR.isExpired && existingQR.status === 'active') {
      // Return existing QR
      return existingQR;
    }

    // Revoke any old active QRs
    await qrCodeRepository.revokeByStudentAndExam(studentId, examId);

    // Create encrypted payload
    const payload = {
      studentId: studentId.toString(),
      examId: examId.toString(),
      institutionId: institutionId.toString(),
      matricNumber: student.matricNumber,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(8).toString('hex'),
    };

    const encryptedPayload = encrypt(payload);

    // Set expiry
    const expiresAt = new Date(Date.now() + env.QR_EXPIRY_HOURS * 60 * 60 * 1000);

    // Generate QR image
    const filename = `qr_${studentId}_${examId}_${Date.now()}`;
    const qrImage = await generateQRImage(encryptedPayload, filename);

    // Save QR code record
    const qrCode = await qrCodeRepository.create({
      studentId,
      examId,
      institutionId,
      encryptedPayload,
      qrImagePath: qrImage.filePath,
      qrBase64: qrImage.base64,
      expiresAt,
      generatedBy,
    });

    // Log audit
    await auditLogService.log({
      userId: generatedBy,
      userType: 'user',
      action: 'QR_GENERATED',
      resource: 'QRCode',
      resourceId: qrCode._id,
      institutionId,
      details: {
        studentMatric: student.matricNumber,
        examTitle: exam.title,
      },
    });

    logger.info(`QR generated for student ${student.matricNumber} - exam ${exam.courseCode}`);

    return qrCode;
  }

  /**
   * Bulk generate QR codes for all eligible students for an exam
   */
  async bulkGenerateQR(examId, institutionId, generatedBy) {
    const exam = await examRepository.findById(examId);
    if (!exam) throw new AppError('Exam not found.', 404);

    // Find active students whose department + level match the exam.
    // Matching is normalized (case/whitespace-insensitive, and level falls back
    // to its numeric part) so minor formatting differences like
    // "Computer Science" vs "computer science" or "400 Level" vs "400" don't
    // silently exclude eligible students.
    const norm = (v) => (v || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
    const digits = (v) => (v || '').toString().replace(/\D/g, '');
    const examDept = norm(exam.department);
    const examLevel = norm(exam.level);
    const examLevelDigits = digits(exam.level);

    const activeStudents = await studentRepository.findMany({
      institutionId,
      status: 'active',
    });

    const students = activeStudents.filter((s) => {
      const deptMatch = norm(s.department) === examDept;
      const levelMatch =
        norm(s.level) === examLevel ||
        (!!examLevelDigits && digits(s.level) === examLevelDigits);
      return deptMatch && levelMatch;
    });

    if (students.length === 0) {
      throw new AppError('No eligible students found for this exam.', 400);
    }

    const results = { total: students.length, generated: 0, skipped: 0, errors: [] };

    for (const student of students) {
      try {
        // Check if QR already exists
        const existing = await qrCodeRepository.findByStudentAndExam(student._id, examId);
        if (existing && existing.status === 'active' && !existing.isExpired) {
          results.skipped++;
          continue;
        }

        await this.generateQR(student._id, examId, institutionId, generatedBy);
        results.generated++;
      } catch (error) {
        results.errors.push({
          studentId: student._id,
          matricNumber: student.matricNumber,
          error: error.message,
        });
      }
    }

    await auditLogService.log({
      userId: generatedBy,
      userType: 'user',
      action: 'QR_BULK_GENERATED',
      resource: 'QRCode',
      institutionId,
      details: {
        examId,
        examTitle: exam.title,
        ...results,
      },
    });

    logger.info(`Bulk QR generation: ${results.generated}/${results.total} for exam ${exam.courseCode}`);

    return results;
  }

  /**
   * List all QR codes generated for an exam (used for printing bulk passes)
   */
  async getQRCodesByExam(examId, institutionId) {
    const exam = await examRepository.findById(examId);
    if (!exam) throw new AppError('Exam not found.', 404);
    if (exam.institutionId.toString() !== institutionId.toString()) {
      throw new AppError('Exam does not belong to your institution.', 403);
    }

    return qrCodeRepository.findByExam(examId);
  }

  /**
   * Generate a single shared "exam hall" QR code for an exam. Any eligible
   * student can scan it; the backend identifies the student from their session
   * and checks they are registered for this exam.
   */
  async generateExamQR(examId, institutionId, generatedBy) {
    const exam = await examRepository.findById(examId);
    if (!exam) throw new AppError('Exam not found.', 404);
    if (exam.institutionId.toString() !== institutionId.toString()) {
      throw new AppError('Exam does not belong to your institution.', 403);
    }

    // Reuse an existing active exam QR if one is still valid (idempotent).
    const existing = await qrCodeRepository.findActiveExamQR(examId);
    if (existing && !existing.isExpired) {
      return existing;
    }

    // Revoke any older exam QRs so only one shared code is active per exam.
    await qrCodeRepository.revokeExamQRs(examId);

    const payload = {
      examId: examId.toString(),
      institutionId: institutionId.toString(),
      type: 'exam',
      timestamp: Date.now(),
      nonce: crypto.randomBytes(8).toString('hex'),
    };

    const encryptedPayload = encrypt(payload);
    const expiresAt = new Date(Date.now() + env.QR_EXPIRY_HOURS * 60 * 60 * 1000);

    const filename = `examqr_${examId}_${Date.now()}`;
    const qrImage = await generateQRImage(encryptedPayload, filename);

    const qrCode = await qrCodeRepository.create({
      examId,
      institutionId,
      type: 'exam',
      encryptedPayload,
      qrImagePath: qrImage.filePath,
      qrBase64: qrImage.base64,
      expiresAt,
      generatedBy,
    });

    await auditLogService.log({
      userId: generatedBy,
      userType: 'user',
      action: 'EXAM_QR_GENERATED',
      resource: 'QRCode',
      resourceId: qrCode._id,
      institutionId,
      details: { examTitle: exam.title, courseCode: exam.courseCode },
    });

    logger.info(`Exam-hall QR generated for ${exam.courseCode}`);
    return qrCode;
  }

  /**
   * Verify a scanned QR code payload
   */
  async verifyQR(encryptedPayload, verifiedBy, institutionId) {
    let payload;

    // Step 1: Decrypt
    try {
      payload = decrypt(encryptedPayload);
    } catch (error) {
      logger.warn(`QR verification failed: decryption error`);
      return {
        verified: false,
        reason: 'Invalid QR code. Could not decrypt payload.',
        status: 'INVALID',
      };
    }

    // Step 2: Find QR code record
    const qrCode = await qrCodeRepository.findOne({ encryptedPayload });
    if (!qrCode) {
      return {
        verified: false,
        reason: 'QR code not found in system.',
        status: 'NOT_FOUND',
      };
    }

    // Step 3: Check if already used
    if (qrCode.isUsed || qrCode.status === 'used') {
      return {
        verified: false,
        reason: 'This QR code has already been used.',
        status: 'ALREADY_USED',
        usedAt: qrCode.usedAt,
      };
    }

    // Step 4: Check expiry
    if (qrCode.expiresAt < new Date() || qrCode.status === 'expired') {
      return {
        verified: false,
        reason: 'This QR code has expired.',
        status: 'EXPIRED',
      };
    }

    // Step 5: Check if revoked
    if (qrCode.status === 'revoked') {
      return {
        verified: false,
        reason: 'This QR code has been revoked.',
        status: 'REVOKED',
      };
    }

    // Step 6: Check institution match
    if (qrCode.institutionId.toString() !== institutionId.toString()) {
      return {
        verified: false,
        reason: 'QR code does not belong to your institution.',
        status: 'WRONG_INSTITUTION',
      };
    }

    // Step 7: Check student status
    const student = await studentRepository.findById(payload.studentId);
    if (!student) {
      return {
        verified: false,
        reason: 'Student not found.',
        status: 'STUDENT_NOT_FOUND',
      };
    }
    if (student.status !== 'active') {
      return {
        verified: false,
        reason: `Student account is ${student.status}.`,
        status: 'STUDENT_INACTIVE',
        student: { name: student.fullName, matricNumber: student.matricNumber },
      };
    }

    // Step 8: Check exam status
    const exam = await examRepository.findById(payload.examId);
    if (!exam) {
      return {
        verified: false,
        reason: 'Exam not found.',
        status: 'EXAM_NOT_FOUND',
      };
    }

    // Step 9: Check for duplicate attendance
    const existingAttendance = await attendanceRepository.findByStudentAndExam(
      payload.studentId,
      payload.examId
    );
    if (existingAttendance) {
      return {
        verified: false,
        reason: 'Student has already been verified for this exam.',
        status: 'ALREADY_VERIFIED',
        student: {
          name: student.fullName,
          matricNumber: student.matricNumber,
          photo: student.passportPhoto,
        },
      };
    }

    // Step 10: All checks passed — mark QR as used
    await qrCodeRepository.markUsed(qrCode._id);

    // Step 11: Record attendance
    const attendance = await attendanceRepository.create({
      studentId: student._id,
      examId: exam._id,
      institutionId,
      qrCodeId: qrCode._id,
      verifiedBy,
      verificationStatus: 'verified',
      verifiedAt: new Date(),
    });

    // Log audit
    await auditLogService.log({
      userId: verifiedBy,
      userType: 'user',
      action: 'QR_VERIFIED',
      resource: 'Attendance',
      resourceId: attendance._id,
      institutionId,
      details: {
        studentMatric: student.matricNumber,
        examTitle: exam.title,
      },
    });

    logger.info(`QR verified: ${student.matricNumber} for ${exam.courseCode}`);

    return {
      verified: true,
      status: 'VERIFIED',
      student: {
        id: student._id,
        name: student.fullName,
        matricNumber: student.matricNumber,
        department: student.department,
        level: student.level,
        photo: student.passportPhoto,
      },
      exam: {
        id: exam._id,
        title: exam.title,
        courseCode: exam.courseCode,
        venue: exam.venue,
      },
      attendance: attendance.toJSON(),
    };
  }

  /**
   * Student-initiated QR verification (student scans institution QR at exam hall)
   */
  async studentVerifyQR(encryptedPayload, studentId) {
    let payload;

    // Step 1: Decrypt
    try {
      payload = decrypt(encryptedPayload);
    } catch (error) {
      logger.warn(`Student QR verification failed: decryption error`);
      return {
        verified: false,
        reason: 'Invalid QR code. Could not decrypt payload.',
        status: 'INVALID',
      };
    }

    // Step 2: Find QR code record
    const qrCode = await qrCodeRepository.findOne({ encryptedPayload });
    if (!qrCode) {
      return {
        verified: false,
        reason: 'QR code not found in system.',
        status: 'NOT_FOUND',
      };
    }

    // An exam-hall QR is shared by all eligible students.
    const isExamQR = qrCode.type === 'exam' || !qrCode.studentId;

    // Step 3: For per-student QRs, verify the QR belongs to this student.
    if (!isExamQR) {
      const qrStudentId = qrCode.studentId?._id || qrCode.studentId;
      if (qrStudentId.toString() !== studentId.toString()) {
        return {
          verified: false,
          reason: 'This QR code does not belong to you.',
          status: 'WRONG_STUDENT',
        };
      }
    }

    // Step 4: Per-student QRs are single-use; exam-hall QRs stay reusable.
    if (!isExamQR && (qrCode.isUsed || qrCode.status === 'used')) {
      return {
        verified: false,
        reason: 'This QR code has already been used.',
        status: 'ALREADY_USED',
        usedAt: qrCode.usedAt,
      };
    }

    // Step 5: Check expiry
    if (qrCode.expiresAt < new Date() || qrCode.status === 'expired') {
      return {
        verified: false,
        reason: 'This QR code has expired.',
        status: 'EXPIRED',
      };
    }

    // Step 6: Check if revoked
    if (qrCode.status === 'revoked') {
      return {
        verified: false,
        reason: 'This QR code has been revoked.',
        status: 'REVOKED',
      };
    }

    // Step 7: Check student status
    const student = await studentRepository.findById(studentId);
    if (!student) {
      return {
        verified: false,
        reason: 'Student not found.',
        status: 'STUDENT_NOT_FOUND',
      };
    }
    if (student.status !== 'active') {
      return {
        verified: false,
        reason: `Your account is ${student.status}. Contact administration.`,
        status: 'STUDENT_INACTIVE',
      };
    }

    // Step 8: Check exam
    const exam = await examRepository.findById(payload.examId);
    if (!exam) {
      return {
        verified: false,
        reason: 'Exam not found.',
        status: 'EXAM_NOT_FOUND',
      };
    }

    // Step 8b: For exam-hall QRs, confirm the student has registered for this
    // exam. Per-student QRs are already scoped to a specific studentId so this
    // check only applies to the shared exam-hall QR flow.
    if (isExamQR) {
      const registered = Array.isArray(exam.registeredStudents)
        && exam.registeredStudents.some((id) => id.toString() === student._id.toString());
      if (!registered) {
        return {
          verified: false,
          reason: 'You are not registered for this exam.',
          status: 'NOT_ELIGIBLE',
          student: {
            name: student.fullName,
            matricNumber: student.matricNumber,
          },
        };
      }
    }

    // Step 9: Check for duplicate attendance
    const existingAttendance = await attendanceRepository.findByStudentAndExam(
      studentId,
      payload.examId
    );
    if (existingAttendance) {
      return {
        verified: false,
        reason: 'You have already been verified for this exam.',
        status: 'ALREADY_VERIFIED',
        student: {
          name: student.fullName,
          matricNumber: student.matricNumber,
          photo: student.passportPhoto,
        },
        exam: {
          title: exam.title,
          courseCode: exam.courseCode,
          venue: exam.venue,
        },
      };
    }

    const institutionId = qrCode.institutionId;

    // Step 10: All checks passed — mark QR as used
    await qrCodeRepository.markUsed(qrCode._id);

    // Step 11: Record attendance
    const attendance = await attendanceRepository.create({
      studentId: student._id,
      examId: exam._id,
      institutionId,
      qrCodeId: qrCode._id,
      verifiedBy: studentId,
      verificationStatus: 'verified',
      verifiedAt: new Date(),
    });

    // Log audit
    await auditLogService.log({
      userId: studentId,
      userType: 'student',
      action: 'QR_STUDENT_VERIFIED',
      resource: 'Attendance',
      resourceId: attendance._id,
      institutionId,
      details: {
        studentMatric: student.matricNumber,
        examTitle: exam.title,
      },
    });

    logger.info(`Student self-verified: ${student.matricNumber} for ${exam.courseCode}`);

    return {
      verified: true,
      status: 'VERIFIED',
      message: 'Student Verified',
      student: {
        id: student._id,
        name: student.fullName,
        matricNumber: student.matricNumber,
        department: student.department,
        level: student.level,
        photo: student.passportPhoto,
      },
      exam: {
        id: exam._id,
        title: exam.title,
        courseCode: exam.courseCode,
        venue: exam.venue,
      },
      attendance: attendance.toJSON(),
    };
  }

  /**
   * Regenerate QR code (revoke old, create new)
   */
  async regenerateQR(qrCodeId, institutionId, userId) {
    const qrCode = await qrCodeRepository.findById(qrCodeId);
    if (!qrCode) throw new AppError('QR code not found.', 404);

    // Revoke old
    await qrCodeRepository.update(qrCodeId, { status: 'revoked' });

    // Generate new
    return this.generateQR(
      qrCode.studentId._id || qrCode.studentId,
      qrCode.examId._id || qrCode.examId,
      institutionId,
      userId
    );
  }

  /**
   * Get QR code details
   */
  async getQRCodeById(qrCodeId) {
    const qrCode = await qrCodeRepository.findById(qrCodeId);
    if (!qrCode) throw new AppError('QR code not found.', 404);
    return qrCode;
  }

  /**
   * Get student's active QR codes (for student-ui)
   */
  async getStudentActiveQR(studentId) {
    return qrCodeRepository.findActiveForStudent(studentId);
  }
}

module.exports = new QRCodeService();

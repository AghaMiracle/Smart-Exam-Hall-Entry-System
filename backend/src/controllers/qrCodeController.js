const qrCodeService = require('../services/qrCodeService');
const { successResponse } = require('../utils/helpers');

class QRCodeController {
  /**
   * POST /api/qrcodes/generate
   */
  async generateQR(req, res, next) {
    try {
      const { studentId, examId } = req.body;
      const qrCode = await qrCodeService.generateQR(
        studentId,
        examId,
        req.user.institutionId,
        req.user.id
      );
      return successResponse(res, 'QR code generated.', qrCode, null, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/qrcodes/bulk-generate
   */
  async bulkGenerateQR(req, res, next) {
    try {
      const { examId } = req.body;
      const result = await qrCodeService.bulkGenerateQR(
        examId,
        req.user.institutionId,
        req.user.id
      );
      return successResponse(res, 'Bulk QR generation completed.', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/qrcodes/verify
   */
  async verifyQR(req, res, next) {
    try {
      const { encryptedPayload } = req.body;
      const result = await qrCodeService.verifyQR(
        encryptedPayload,
        req.user.id,
        req.user.institutionId
      );

      // Emit socket event
      if (req.io) {
        const room = `institution:${req.user.institutionId}`;
        if (result.verified) {
          req.io.to(room).emit('verification:success', {
            student: result.student,
            exam: result.exam,
            timestamp: new Date(),
          });
          req.io.to(room).emit('attendance:update', {
            examId: result.exam?.id,
            timestamp: new Date(),
          });
        } else {
          req.io.to(room).emit('verification:rejected', {
            reason: result.reason,
            status: result.status,
            timestamp: new Date(),
          });
        }
      }

      const statusCode = result.verified ? 200 : 400;
      const message = result.verified ? 'Verification successful.' : result.reason;
      return res.status(statusCode).json({
        success: result.verified,
        message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/qrcodes/:id
   */
  async getQRCode(req, res, next) {
    try {
      const qrCode = await qrCodeService.getQRCodeById(req.params.id);
      return successResponse(res, 'QR code retrieved.', qrCode);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/qrcodes/:id/regenerate
   */
  async regenerateQR(req, res, next) {
    try {
      const qrCode = await qrCodeService.regenerateQR(
        req.params.id,
        req.user.institutionId,
        req.user.id
      );
      return successResponse(res, 'QR code regenerated.', qrCode);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/qrcodes/student/active (Student)
   */
  async getStudentActiveQR(req, res, next) {
    try {
      const qrCodes = await qrCodeService.getStudentActiveQR(req.user.id);
      return successResponse(res, 'Active QR codes retrieved.', qrCodes);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QRCodeController();

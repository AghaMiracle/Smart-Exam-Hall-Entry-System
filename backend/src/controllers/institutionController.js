const institutionService = require('../services/institutionService');
const { successResponse } = require('../utils/helpers');

class InstitutionController {
  /**
   * GET /api/institutions/profile
   */
  async getProfile(req, res, next) {
    try {
      const institution = await institutionService.getProfile(req.user.institutionId);
      return successResponse(res, 'Institution profile retrieved.', institution);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/institutions/profile
   */
  async updateProfile(req, res, next) {
    try {
      const data = req.body;
      // Handle logo upload
      if (req.file) {
        data.logo = `/uploads/logos/${req.file.filename}`;
      }
      const institution = await institutionService.updateProfile(
        req.user.institutionId,
        data,
        req.user.id
      );
      return successResponse(res, 'Profile updated successfully.', institution);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/institutions (Super Admin only)
   */
  async listInstitutions(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const result = await institutionService.listInstitutions(page, limit);
      return successResponse(res, 'Institutions retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/institutions/:id/status
   */
  async updateStatus(req, res, next) {
    try {
      const institution = await institutionService.updateStatus(
        req.params.id,
        req.body.status,
        req.user.id
      );
      return successResponse(res, 'Institution status updated.', institution);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InstitutionController();

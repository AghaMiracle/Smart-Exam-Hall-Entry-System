const institutionRepository = require('../repositories/institutionRepository');
const auditLogService = require('./auditLogService');
const { AppError } = require('../utils/helpers');

class InstitutionService {
  async getProfile(institutionId) {
    const institution = await institutionRepository.findById(institutionId);
    if (!institution) {
      throw new AppError('Institution not found.', 404);
    }
    return institution;
  }

  async updateProfile(institutionId, data, userId) {
    const institution = await institutionRepository.update(institutionId, data);
    if (!institution) {
      throw new AppError('Institution not found.', 404);
    }

    await auditLogService.log({
      userId,
      userType: 'user',
      action: 'INSTITUTION_UPDATED',
      resource: 'Institution',
      resourceId: institutionId,
      institutionId,
      details: { updatedFields: Object.keys(data) },
    });

    return institution;
  }

  async listInstitutions(page, limit) {
    return institutionRepository.findPaginated({}, page, limit);
  }

  async updateStatus(institutionId, status, userId) {
    if (!['active', 'suspended'].includes(status)) {
      throw new AppError('Invalid status. Must be "active" or "suspended".', 400);
    }

    const institution = await institutionRepository.update(institutionId, { status });
    if (!institution) {
      throw new AppError('Institution not found.', 404);
    }

    await auditLogService.log({
      userId,
      userType: 'user',
      action: `INSTITUTION_${status.toUpperCase()}`,
      resource: 'Institution',
      resourceId: institutionId,
      institutionId,
    });

    return institution;
  }
}

module.exports = new InstitutionService();

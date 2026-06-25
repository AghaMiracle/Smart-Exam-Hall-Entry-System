const auditLogService = require('../services/auditLogService');
const { successResponse } = require('../utils/helpers');

class AuditLogController {
  async getLogs(req, res, next) {
    try {
      const result = await auditLogService.getLogs(req.user.institutionId, req.query);
      return successResponse(res, 'Audit logs retrieved.', result.logs, result.pagination);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditLogController();

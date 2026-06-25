const auditLogRepository = require('../repositories/auditLogRepository');
const { getPaginationMeta, parsePaginationQuery } = require('../utils/helpers');

class AuditLogService {
  /**
   * Create an audit log entry
   */
  async log(data) {
    try {
      return await auditLogRepository.create(data);
    } catch (error) {
      // Audit logging should never break the main flow
      console.error('Audit log error:', error.message);
      return null;
    }
  }

  /**
   * Get audit logs for an institution
   */
  async getLogs(institutionId, queryParams) {
    const { page, limit } = parsePaginationQuery(queryParams);

    const query = { institutionId };
    if (queryParams.action) query.action = queryParams.action;
    if (queryParams.resource) query.resource = queryParams.resource;

    const { data, total } = await auditLogRepository.findPaginated(query, page, limit);

    return {
      logs: data,
      pagination: getPaginationMeta(page, limit, total),
    };
  }
}

module.exports = new AuditLogService();

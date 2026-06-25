const AuditLog = require('../models/AuditLog');

class AuditLogRepository {
  async create(data) {
    return AuditLog.create(data);
  }

  async findPaginated(query = {}, page = 1, limit = 20, sort = '-createdAt') {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      AuditLog.find(query).sort(sort).skip(skip).limit(limit),
      AuditLog.countDocuments(query),
    ]);
    return { data, total };
  }

  async findByInstitution(institutionId, page = 1, limit = 20) {
    return this.findPaginated({ institutionId }, page, limit);
  }

  async findByUser(userId, page = 1, limit = 20) {
    return this.findPaginated({ userId }, page, limit);
  }

  async count(query = {}) {
    return AuditLog.countDocuments(query);
  }
}

module.exports = new AuditLogRepository();

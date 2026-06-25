const User = require('../models/User');

class UserRepository {
  async create(data) {
    return User.create(data);
  }

  async findById(id, includeSecrets = false) {
    const query = User.findById(id);
    if (includeSecrets) {
      query.select('+passwordHash +refreshToken +passwordResetToken +passwordResetExpires');
    }
    return query;
  }

  async findByEmail(email, includeSecrets = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includeSecrets) {
      query.select('+passwordHash +refreshToken +passwordResetToken +passwordResetExpires');
    }
    return query;
  }

  async findOne(query) {
    return User.findOne(query);
  }

  async findMany(query = {}, options = {}) {
    const { sort = '-createdAt', populate = '' } = options;
    return User.find(query).sort(sort).populate(populate);
  }

  async findPaginated(query = {}, page = 1, limit = 20, sort = '-createdAt') {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);
    return { data, total };
  }

  async findByInstitution(institutionId, role = null) {
    const query = { institutionId };
    if (role) query.role = role;
    return User.find(query).sort('-createdAt');
  }

  async update(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async updateRefreshToken(id, token) {
    return User.findByIdAndUpdate(id, { refreshToken: token });
  }

  async delete(id) {
    return User.findByIdAndDelete(id);
  }

  async count(query = {}) {
    return User.countDocuments(query);
  }
}

module.exports = new UserRepository();

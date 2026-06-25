const Institution = require('../models/Institution');

class InstitutionRepository {
  async create(data) {
    return Institution.create(data);
  }

  async findById(id) {
    return Institution.findById(id);
  }

  async findByEmail(email) {
    return Institution.findOne({ email: email.toLowerCase() });
  }

  async findOne(query) {
    return Institution.findOne(query);
  }

  async findMany(query = {}, options = {}) {
    const { sort = '-createdAt', populate = '' } = options;
    return Institution.find(query).sort(sort).populate(populate);
  }

  async findPaginated(query = {}, page = 1, limit = 20, sort = '-createdAt') {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Institution.find(query).sort(sort).skip(skip).limit(limit),
      Institution.countDocuments(query),
    ]);
    return { data, total };
  }

  async update(id, data) {
    return Institution.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return Institution.findByIdAndDelete(id);
  }

  async count(query = {}) {
    return Institution.countDocuments(query);
  }
}

module.exports = new InstitutionRepository();

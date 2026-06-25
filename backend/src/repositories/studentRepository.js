const Student = require('../models/Student');

class StudentRepository {
  async create(data) {
    return Student.create(data);
  }

  async createMany(dataArray) {
    return Student.insertMany(dataArray, { ordered: false });
  }

  async findById(id, includeSecrets = false) {
    const query = Student.findById(id).populate('institutionId', 'name email logo');
    if (includeSecrets) {
      query.select('+passwordHash +refreshToken');
    }
    return query;
  }

  async findByUsername(username, includeSecrets = false) {
    const query = Student.findOne({ username: username.toLowerCase() });
    if (includeSecrets) {
      query.select('+passwordHash +refreshToken +passwordResetToken +passwordResetExpires');
    }
    return query;
  }

  async findByMatricNumber(matricNumber, institutionId) {
    return Student.findOne({
      matricNumber,
      institutionId,
    });
  }

  async findOne(query) {
    return Student.findOne(query);
  }

  async findMany(query = {}, options = {}) {
    const { sort = '-createdAt', populate = '' } = options;
    return Student.find(query).sort(sort).populate(populate);
  }

  async findPaginated(query = {}, page = 1, limit = 20, sort = '-createdAt') {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Student.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('institutionId', 'name'),
      Student.countDocuments(query),
    ]);
    return { data, total };
  }

  async findByInstitution(institutionId, filters = {}) {
    const query = { institutionId };
    if (filters.department) query.department = filters.department;
    if (filters.level) query.level = filters.level;
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { matricNumber: { $regex: filters.search, $options: 'i' } },
        { username: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return query;
  }

  async update(id, data) {
    return Student.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async updateRefreshToken(id, token) {
    return Student.findByIdAndUpdate(id, { refreshToken: token });
  }

  async delete(id) {
    return Student.findByIdAndDelete(id);
  }

  async count(query = {}) {
    return Student.countDocuments(query);
  }

  async getDistinctDepartments(institutionId) {
    return Student.distinct('department', { institutionId });
  }

  async getDistinctLevels(institutionId) {
    return Student.distinct('level', { institutionId });
  }
}

module.exports = new StudentRepository();

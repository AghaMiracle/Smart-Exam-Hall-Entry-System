const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');
const studentRepository = require('../repositories/studentRepository');
const { errorResponse } = require('../utils/helpers');

/**
 * Authenticate JWT token for institution users (Admin/Officer/SuperAdmin)
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Check if user exists and is active
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'User not found. Token invalid.', 401);
    }

    if (user.status !== 'active') {
      return errorResponse(res, 'Account is suspended. Contact administrator.', 403);
    }

    // Attach user info to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please refresh or login again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token.', 401);
    }
    return errorResponse(res, 'Authentication failed.', 401);
  }
};

/**
 * Authenticate JWT token for students
 */
const authenticateStudent = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (decoded.role !== 'student') {
      return errorResponse(res, 'Invalid token type.', 401);
    }

    // Check if student exists and is active
    const student = await studentRepository.findById(decoded.id);
    if (!student) {
      return errorResponse(res, 'Student not found. Token invalid.', 401);
    }

    if (student.status !== 'active') {
      return errorResponse(res, 'Account is suspended. Contact your institution.', 403);
    }

    // Attach student info to request
    req.user = {
      id: student._id,
      username: student.username,
      role: 'student',
      institutionId: student.institutionId._id || student.institutionId,
      firstName: student.firstName,
      lastName: student.lastName,
      department: student.department,
      level: student.level,
      matricNumber: student.matricNumber,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please refresh or login again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token.', 401);
    }
    return errorResponse(res, 'Authentication failed.', 401);
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        'You do not have permission to perform this action.',
        403
      );
    }

    next();
  };
};

module.exports = { authenticate, authenticateStudent, authorize };

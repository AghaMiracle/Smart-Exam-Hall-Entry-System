/**
 * Create a standardized API response
 */
const apiResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

/**
 * Success response helper
 */
const successResponse = (res, message, data = null, meta = null, statusCode = 200) => {
  return apiResponse(res, statusCode, true, message, data, meta);
};

/**
 * Error response helper
 */
const errorResponse = (res, message, statusCode = 400, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Custom API error class
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Calculate pagination metadata
 */
const getPaginationMeta = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Parse query params for pagination
 */
const parsePaginationQuery = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const sort = query.sort || '-createdAt';
  return { page, limit, sort, skip: (page - 1) * limit };
};

module.exports = {
  apiResponse,
  successResponse,
  errorResponse,
  AppError,
  getPaginationMeta,
  parsePaginationQuery,
};

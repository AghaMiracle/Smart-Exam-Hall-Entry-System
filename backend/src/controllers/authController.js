const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/helpers');

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const result = await authService.registerInstitution(req.body);
      return successResponse(res, 'Institution registered successfully.', result, null, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginUser(email, password);
      return successResponse(res, 'Login successful.', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/student/login
   */
  async studentLogin(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await authService.loginStudent(username, password);
      return successResponse(res, 'Login successful.', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh-token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return errorResponse(res, 'Refresh token is required.', 400);
      }
      const result = await authService.refreshToken(refreshToken);
      return successResponse(res, 'Token refreshed.', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email, userType } = req.body;
      const result = await authService.forgotPassword(email, userType);
      return successResponse(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password, userType } = req.body;
      const result = await authService.resetPassword(token, password, userType);
      return successResponse(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const userType = req.user.role === 'student' ? 'student' : 'user';
      const result = await authService.logout(req.user.id, userType);
      return successResponse(res, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

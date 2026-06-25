const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');
const studentRepository = require('../repositories/studentRepository');
const institutionRepository = require('../repositories/institutionRepository');
const auditLogService = require('./auditLogService');
const emailService = require('./emailService');
const { AppError } = require('../utils/helpers');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Generate JWT access token
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE });
  }

  /**
   * Generate JWT refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRE });
  }

  /**
   * Register a new institution + admin user
   */
  async registerInstitution(data) {
    // Check if institution email already exists
    const existingInstitution = await institutionRepository.findByEmail(data.email);
    if (existingInstitution) {
      throw new AppError('An institution with this email already exists.', 409);
    }

    // Check if user email already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('A user with this email already exists.', 409);
    }

    // Create institution
    const institution = await institutionRepository.create({
      name: data.institutionName,
      email: data.email,
      phone: data.phone || '',
      address: data.address || '',
    });

    // Create admin user
    const user = await userRepository.create({
      institutionId: institution._id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash: data.password, // Will be hashed by pre-save hook
      role: 'institution_admin',
    });

    // Generate tokens
    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
      institutionId: institution._id,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    // Store refresh token
    await userRepository.updateRefreshToken(user._id, refreshToken);

    // Log audit
    await auditLogService.log({
      userId: user._id,
      userType: 'user',
      action: 'INSTITUTION_REGISTERED',
      resource: 'Institution',
      resourceId: institution._id,
      institutionId: institution._id,
      details: { institutionName: institution.name },
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.firstName, institution.name);

    logger.info(`Institution registered: ${institution.name} (${institution.email})`);

    return {
      user: user.toJSON(),
      institution: institution.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login institution user (admin/officer)
   */
  async loginUser(email, password) {
    // Find user with password hash
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new AppError(
        `Account is locked due to too many failed attempts. Try again after ${Math.ceil((user.lockUntil - Date.now()) / 60000)} minutes.`,
        423
      );
    }

    // Check if suspended
    if (user.status !== 'active') {
      throw new AppError('Account is suspended. Contact administrator.', 403);
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts(env.MAX_LOGIN_ATTEMPTS, env.LOCK_TIME_MINUTES);
      throw new AppError('Invalid email or password.', 401);
    }

    // Reset login attempts on success
    await user.resetLoginAttempts();

    // Generate tokens
    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    // Store refresh token
    await userRepository.updateRefreshToken(user._id, refreshToken);

    // Get institution info
    const institution = await institutionRepository.findById(user.institutionId);

    // Log audit
    await auditLogService.log({
      userId: user._id,
      userType: 'user',
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user._id,
      institutionId: user.institutionId,
    });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: user.toJSON(),
      institution: institution ? institution.toJSON() : null,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login student
   */
  async loginStudent(username, password) {
    const student = await studentRepository.findByUsername(username, true);
    if (!student) {
      throw new AppError('Invalid username or password.', 401);
    }

    // Check if account is locked
    if (student.isLocked) {
      throw new AppError(
        `Account is locked due to too many failed attempts. Try again after ${Math.ceil((student.lockUntil - Date.now()) / 60000)} minutes.`,
        423
      );
    }

    // Check if suspended
    if (student.status !== 'active') {
      throw new AppError('Account is suspended. Contact your institution.', 403);
    }

    // Verify password
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      await student.incrementLoginAttempts(env.MAX_LOGIN_ATTEMPTS, env.LOCK_TIME_MINUTES);
      throw new AppError('Invalid username or password.', 401);
    }

    // Reset login attempts on success
    await student.resetLoginAttempts();

    // Generate tokens
    const tokenPayload = {
      id: student._id,
      username: student.username,
      role: 'student',
      institutionId: student.institutionId,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    // Store refresh token
    await studentRepository.updateRefreshToken(student._id, refreshToken);

    // Get institution info
    const institution = await institutionRepository.findById(student.institutionId);

    // Log audit
    await auditLogService.log({
      userId: student._id,
      userType: 'student',
      action: 'STUDENT_LOGIN',
      resource: 'Student',
      resourceId: student._id,
      institutionId: student.institutionId,
    });

    logger.info(`Student logged in: ${student.username}`);

    return {
      student: student.toJSON(),
      institution: institution ? { name: institution.name, logo: institution.logo } : null,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

      let entity;
      if (decoded.role === 'student') {
        entity = await studentRepository.findByUsername(decoded.username, true);
      } else {
        entity = await userRepository.findByEmail(decoded.email, true);
      }

      if (!entity) {
        throw new AppError('Invalid refresh token.', 401);
      }

      // Generate new access token
      const tokenPayload = {
        id: decoded.id,
        role: decoded.role,
        institutionId: decoded.institutionId,
      };

      if (decoded.role === 'student') {
        tokenPayload.username = decoded.username;
      } else {
        tokenPayload.email = decoded.email;
      }

      const accessToken = this.generateAccessToken(tokenPayload);

      return { accessToken };
    } catch (error) {
      throw new AppError('Invalid or expired refresh token.', 401);
    }
  }

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(email, userType = 'user') {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    let entity;
    if (userType === 'student') {
      // For students, search by email
      entity = await studentRepository.findOne({ email });
      if (entity) {
        await studentRepository.update(entity._id, {
          passwordResetToken: hashedToken,
          passwordResetExpires: expires,
        });
      }
    } else {
      entity = await userRepository.findByEmail(email);
      if (entity) {
        await userRepository.update(entity._id, {
          passwordResetToken: hashedToken,
          passwordResetExpires: expires,
        });
      }
    }

    // Always return success to prevent email enumeration
    if (entity) {
      const resetUrl = userType === 'student'
        ? `${env.STUDENT_CLIENT_URL}/reset-password?token=${resetToken}`
        : `${env.CLIENT_URL}/reset-password?token=${resetToken}`;

      await emailService.sendPasswordResetEmail(email, entity.firstName, resetUrl);

      logger.info(`Password reset requested for: ${email}`);
    }

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword, userType = 'user') {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    let entity;
    if (userType === 'student') {
      entity = await studentRepository.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      });

      if (!entity) {
        throw new AppError('Invalid or expired reset token.', 400);
      }

      entity.passwordHash = newPassword; // Will be hashed by pre-save
      entity.passwordResetToken = null;
      entity.passwordResetExpires = null;
      await entity.save();
    } else {
      entity = await userRepository.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      });

      if (!entity) {
        throw new AppError('Invalid or expired reset token.', 400);
      }

      entity.passwordHash = newPassword;
      entity.passwordResetToken = null;
      entity.passwordResetExpires = null;
      await entity.save();
    }

    logger.info(`Password reset completed for: ${entity.email || entity.username}`);

    return { message: 'Password reset successful. You can now login with your new password.' };
  }

  /**
   * Logout - invalidate refresh token
   */
  async logout(userId, userType = 'user') {
    if (userType === 'student') {
      await studentRepository.updateRefreshToken(userId, null);
    } else {
      await userRepository.updateRefreshToken(userId, null);
    }

    return { message: 'Logged out successfully.' };
  }
}

module.exports = new AuthService();

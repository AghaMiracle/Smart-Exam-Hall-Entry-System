const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      // Optional: exam-hall QRs are shared and not tied to a single student.
      required: false,
      default: null,
    },
    type: {
      type: String,
      enum: ['student', 'exam'],
      default: 'student',
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    encryptedPayload: {
      type: String,
      required: true,
    },
    qrImagePath: {
      type: String,
      default: null,
    },
    qrBase64: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'used', 'revoked'],
      default: 'active',
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
qrCodeSchema.index({ studentId: 1, examId: 1 });
qrCodeSchema.index({ institutionId: 1, examId: 1 });
qrCodeSchema.index({ status: 1 });
qrCodeSchema.index({ expiresAt: 1 });

// Virtual: check if expired
qrCodeSchema.virtual('isExpired').get(function () {
  return this.expiresAt < new Date();
});

module.exports = mongoose.model('QRCode', qrCodeSchema);

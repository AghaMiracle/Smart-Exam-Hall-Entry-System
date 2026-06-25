const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
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
    qrCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QRCode',
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'rejected'],
      required: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    scanLocation: {
      type: String,
      default: null,
    },
    isOfflineSync: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
attendanceSchema.index({ examId: 1, studentId: 1 });
attendanceSchema.index({ institutionId: 1, examId: 1 });
attendanceSchema.index({ studentId: 1, verificationStatus: 1 });
attendanceSchema.index({ verifiedAt: -1 });

// Prevent duplicate verified entries for same student+exam
attendanceSchema.index(
  { studentId: 1, examId: 1, verificationStatus: 1 },
  {
    unique: true,
    partialFilterExpression: { verificationStatus: 'verified' },
  }
);

module.exports = mongoose.model('Attendance', attendanceSchema);

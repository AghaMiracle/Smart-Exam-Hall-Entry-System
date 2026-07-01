const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
      maxlength: 300,
    },
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    faculty: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      trim: true,
    },
    examDate: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
      default: '',
    },
    session: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'archived'],
      default: 'upcoming',
    },
    assignedOfficers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    registeredStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
examSchema.index({ institutionId: 1, status: 1 });
examSchema.index({ institutionId: 1, examDate: 1 });
examSchema.index({ institutionId: 1, department: 1, level: 1 });
examSchema.index({ courseCode: 1, institutionId: 1 });
examSchema.index({ registeredStudents: 1 });

module.exports = mongoose.model('Exam', examSchema);

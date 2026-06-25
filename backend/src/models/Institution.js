const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      maxlength: 200,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    logo: {
      type: String, // file path
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes (email index created automatically by unique: true)
institutionSchema.index({ status: 1 });

// Virtual: count of users under this institution
institutionSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'institutionId',
});

institutionSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'institutionId',
});

module.exports = mongoose.model('Institution', institutionSchema);

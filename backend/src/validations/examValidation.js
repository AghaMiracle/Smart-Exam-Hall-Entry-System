const { body } = require('express-validator');

const createExamValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Exam title is required')
    .isLength({ max: 300 }),
  body('courseCode')
    .trim()
    .notEmpty()
    .withMessage('Course code is required'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('faculty')
    .trim()
    .notEmpty()
    .withMessage('Faculty is required'),
  body('level')
    .trim()
    .notEmpty()
    .withMessage('Level is required'),
  body('examDate')
    .notEmpty()
    .withMessage('Exam date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('startTime')
    .trim()
    .notEmpty()
    .withMessage('Start time is required'),
  body('endTime')
    .trim()
    .notEmpty()
    .withMessage('End time is required'),
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Venue is required'),
  body('semester')
    .optional()
    .trim(),
  body('session')
    .optional()
    .trim(),
];

const updateExamValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 300 }),
  body('courseCode')
    .optional()
    .trim(),
  body('department')
    .optional()
    .trim(),
  body('faculty')
    .optional()
    .trim(),
  body('level')
    .optional()
    .trim(),
  body('examDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('startTime')
    .optional()
    .trim(),
  body('endTime')
    .optional()
    .trim(),
  body('venue')
    .optional()
    .trim(),
  body('semester')
    .optional()
    .trim(),
  body('session')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['upcoming', 'active', 'completed', 'archived'])
    .withMessage('Invalid exam status'),
];

module.exports = { createExamValidation, updateExamValidation };

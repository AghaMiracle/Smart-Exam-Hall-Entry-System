const { body } = require('express-validator');

const createStudentValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 100 })
    .withMessage('First name must be under 100 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 100 })
    .withMessage('Last name must be under 100 characters'),
  body('otherName')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('matricNumber')
    .trim()
    .notEmpty()
    .withMessage('Matric number is required'),
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
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),
  body('phone')
    .optional()
    .trim(),
  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

const updateStudentValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('otherName')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('department')
    .optional()
    .trim(),
  body('faculty')
    .optional()
    .trim(),
  body('level')
    .optional()
    .trim(),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),
  body('phone')
    .optional()
    .trim(),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other']),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

module.exports = { createStudentValidation, updateStudentValidation };

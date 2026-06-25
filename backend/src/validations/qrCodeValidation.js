const { body } = require('express-validator');

const generateQRValidation = [
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('examId')
    .notEmpty()
    .withMessage('Exam ID is required')
    .isMongoId()
    .withMessage('Invalid exam ID'),
];

const bulkGenerateQRValidation = [
  body('examId')
    .notEmpty()
    .withMessage('Exam ID is required')
    .isMongoId()
    .withMessage('Invalid exam ID'),
];

const verifyQRValidation = [
  body('encryptedPayload')
    .notEmpty()
    .withMessage('Encrypted QR payload is required'),
];

module.exports = {
  generateQRValidation,
  bulkGenerateQRValidation,
  verifyQRValidation,
};

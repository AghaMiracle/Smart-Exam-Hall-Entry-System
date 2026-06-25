const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'qrcodes');

// Ensure directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Generate QR code image from encrypted payload
 * @param {string} data - The encrypted data to encode
 * @param {string} filename - Output filename (without extension)
 * @returns {Object} { filePath, base64, dataUrl }
 */
const generateQRImage = async (data, filename) => {
  const filePath = path.join(uploadsDir, `${filename}.png`);

  // Generate PNG file
  await QRCode.toFile(filePath, data, {
    type: 'png',
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H', // High error correction
  });

  // Also generate base64 for API response
  const base64 = await QRCode.toDataURL(data, {
    type: 'image/png',
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'H',
  });

  return {
    filePath: `/uploads/qrcodes/${filename}.png`,
    base64,
    dataUrl: base64,
  };
};

/**
 * Generate QR code as base64 only (no file)
 * @param {string} data - The data to encode
 * @returns {string} Base64 data URL
 */
const generateQRBase64 = async (data) => {
  return QRCode.toDataURL(data, {
    type: 'image/png',
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'H',
  });
};

module.exports = { generateQRImage, generateQRBase64 };

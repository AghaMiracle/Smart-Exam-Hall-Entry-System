const crypto = require('crypto');
const env = require('../config/env');

const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt data using AES-256-CBC
 * @param {Object|string} data - Data to encrypt
 * @returns {string} Encrypted string (hex iv:encrypted)
 */
const encrypt = (data) => {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  
  // Use configured key or generate from secret
  const key = Buffer.from(env.AES_SECRET_KEY, 'hex');
  // Generate a random IV for each encryption for better security
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return iv:encrypted so we can decrypt later
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt AES-256-CBC encrypted string
 * @param {string} encryptedText - Format: "iv_hex:encrypted_hex"
 * @returns {Object|string} Decrypted data
 */
const decrypt = (encryptedText) => {
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const key = Buffer.from(env.AES_SECRET_KEY, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  // Try to parse as JSON, fall back to string
  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
};

module.exports = { encrypt, decrypt };

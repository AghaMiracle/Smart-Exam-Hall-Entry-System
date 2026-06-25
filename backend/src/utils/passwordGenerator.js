const crypto = require('crypto');

/**
 * Generate a username from student details
 * Format: firstname_lastname_XXXX (4 random digits)
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string} Generated username
 */
const generateUsername = (firstName, lastName) => {
  const clean = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const suffix = crypto.randomInt(1000, 9999);
  return `${clean(firstName)}_${clean(lastName)}_${suffix}`;
};

/**
 * Generate a random temporary password
 * @param {number} length - Password length (default 10)
 * @returns {string} Random password with mixed chars
 */
const generateTempPassword = (length = 10) => {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$!';
  const all = uppercase + lowercase + digits + special;

  // Ensure at least one of each type
  let password = '';
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += digits[crypto.randomInt(digits.length)];
  password += special[crypto.randomInt(special.length)];

  // Fill remaining
  for (let i = password.length; i < length; i++) {
    password += all[crypto.randomInt(all.length)];
  }

  // Shuffle
  return password
    .split('')
    .sort(() => crypto.randomInt(3) - 1)
    .join('');
};

module.exports = { generateUsername, generateTempPassword };

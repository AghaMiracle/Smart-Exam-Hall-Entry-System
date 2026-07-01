const { parse } = require('csv-parse');
const XLSX = require('xlsx');

/**
 * Parse CSV buffer into array of objects
 * @param {Buffer} buffer - CSV file buffer
 * @returns {Promise<Array>} Parsed records
 */
const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const records = [];
    const parser = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      // NOTE: do NOT enable `cast` — it coerces "07012345678" to a Number
      // (losing the leading zero) and turns "true"/"false" strings into
      // booleans, corrupting student records on import.
      cast: false,
    });

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(normalizeStudentRecord(record));
      }
    });

    parser.on('error', (err) => reject(err));
    parser.on('end', () => resolve(records));
  });
};

/**
 * Parse Excel buffer into array of objects
 * @param {Buffer} buffer - Excel file buffer
 * @returns {Array} Parsed records
 */
const parseExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRecords = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  return rawRecords.map(normalizeStudentRecord);
};

/**
 * Normalize CSV/Excel column names to schema field names
 * Handles common variations like "First Name", "first_name", "FirstName"
 */
const normalizeStudentRecord = (record) => {
  const normalized = {};
  const mapping = {
    firstname: 'firstName',
    first_name: 'firstName',
    'first name': 'firstName',
    lastname: 'lastName',
    last_name: 'lastName',
    'last name': 'lastName',
    othername: 'otherName',
    other_name: 'otherName',
    'other name': 'otherName',
    middlename: 'otherName',
    middle_name: 'otherName',
    matricnumber: 'matricNumber',
    matric_number: 'matricNumber',
    'matric number': 'matricNumber',
    'matric no': 'matricNumber',
    matricno: 'matricNumber',
    department: 'department',
    dept: 'department',
    faculty: 'faculty',
    level: 'level',
    email: 'email',
    phone: 'phone',
    'phone number': 'phone',
    phonenumber: 'phone',
    gender: 'gender',
    dateofbirth: 'dateOfBirth',
    date_of_birth: 'dateOfBirth',
    'date of birth': 'dateOfBirth',
    dob: 'dateOfBirth',
  };

  for (const [key, value] of Object.entries(record)) {
    const normalizedKey = key.toLowerCase().trim();
    const mappedKey = mapping[normalizedKey] || normalizedKey;
    normalized[mappedKey] = typeof value === 'string' ? value.trim() : value;
  }

  return normalized;
};

/**
 * Generate CSV buffer from data
 * @param {Array} data - Array of objects
 * @param {Array} columns - Column definitions [{key, header}]
 * @returns {string} CSV string
 */
const generateCSV = (data, columns) => {
  const headers = columns.map((c) => c.header).join(',');
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key] ?? '';
        // Escape commas and quotes in CSV
        const str = String(val);
        return str.includes(',') || str.includes('"')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      })
      .join(',')
  );
  return [headers, ...rows].join('\n');
};

/**
 * Generate Excel buffer from data
 * @param {Array} data - Array of objects
 * @param {string} sheetName - Sheet name
 * @returns {Buffer} Excel buffer
 */
const generateExcel = (data, sheetName = 'Sheet1') => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = { parseCSV, parseExcel, generateCSV, generateExcel };

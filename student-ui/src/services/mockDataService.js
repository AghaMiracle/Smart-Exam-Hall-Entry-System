// Mock Database Service for Smart Exam Hall Entry Verification System

const STORAGE_KEYS = {
  INSTITUTIONS: 'exam_hall_institutions',
  STUDENTS: 'exam_hall_students',
  EXAMS: 'exam_hall_exams',
  ATTENDANCE: 'exam_hall_attendance',
  AUDIT_LOGS: 'exam_hall_audit_logs',
  CURRENT_USER: 'exam_hall_current_user',
  MOCK_INIT: 'exam_hall_mock_initialized'
};

// Cryptographic / Base64 simulation helpers
export const encodeQR = (payload) => {
  const jsonStr = JSON.stringify(payload);
  // Simple obfuscated Base64 to mimic encryption
  return btoa(unescape(encodeURIComponent(jsonStr)));
};

export const decodeQR = (obfuscatedString) => {
  try {
    const jsonStr = decodeURIComponent(escape(atob(obfuscatedString)));
    return JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Invalid QR Code format or corrupt data');
  }
};

// Seed Data
const seedData = () => {
  const initialInstitutions = [
    {
      id: 'INST-001',
      name: 'Apex Technical University',
      email: 'admin@apex.edu',
      phone: '+234 812 345 6789',
      address: '12 University Road, Yaba, Lagos',
      password: 'password123'
    }
  ];

  const initialStudents = [
    {
      id: 'STUD-001',
      firstName: 'Jane',
      lastName: 'Doe',
      otherName: 'Mary',
      matricNumber: 'U2018/302001',
      department: 'Computer Science',
      faculty: 'Science',
      level: '400 Level',
      phoneNumber: '+234 801 111 2222',
      email: 'jane.doe@apex.edu',
      passportPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      gender: 'Female',
      dateOfBirth: '2004-05-12',
      status: 'Active', // Active, Suspended
      username: 'jane.doe',
      password: 'student123',
      institutionId: 'INST-001'
    },
    {
      id: 'STUD-002',
      firstName: 'John',
      lastName: 'Smith',
      otherName: 'David',
      matricNumber: 'U2018/302002',
      department: 'Computer Science',
      faculty: 'Science',
      level: '400 Level',
      phoneNumber: '+234 802 222 3333',
      email: 'john.smith@apex.edu',
      passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      gender: 'Male',
      dateOfBirth: '2003-08-20',
      status: 'Suspended', // Active, Suspended
      username: 'john.smith',
      password: 'student123',
      institutionId: 'INST-001'
    },
    {
      id: 'STUD-003',
      firstName: 'Chioma',
      lastName: 'Nwachukwu',
      otherName: 'Blessing',
      matricNumber: 'U2018/302003',
      department: 'Mathematics',
      faculty: 'Science',
      level: '300 Level',
      phoneNumber: '+234 803 333 4444',
      email: 'chioma.n@apex.edu',
      passportPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      gender: 'Female',
      dateOfBirth: '2005-01-15',
      status: 'Active',
      username: 'chioma.n',
      password: 'student123',
      institutionId: 'INST-001'
    }
  ];

  const initialExams = [
    {
      id: 'EXAM-001',
      courseCode: 'CSC 401',
      courseTitle: 'Artificial Intelligence',
      examDate: '2026-06-26', // Tomorrow
      examTime: '09:00 AM',
      venue: 'Main Examination Hall A',
      department: 'Computer Science',
      level: '400 Level',
      status: 'Active' // Active, Archived
    },
    {
      id: 'EXAM-002',
      courseCode: 'CSC 403',
      courseTitle: 'Software Engineering II',
      examDate: '2026-06-27',
      examTime: '02:00 PM',
      venue: 'E-Learning Centre Suite B',
      department: 'Computer Science',
      level: '400 Level',
      status: 'Active'
    },
    {
      id: 'EXAM-003',
      courseCode: 'MTH 301',
      courseTitle: 'Abstract Algebra II',
      examDate: '2026-06-28',
      examTime: '11:00 AM',
      venue: 'Faculty Lecture Theatre II',
      department: 'Mathematics',
      level: '300 Level',
      status: 'Active'
    }
  ];

  const initialAttendance = [
    {
      id: 'ATT-001',
      studentId: 'STUD-001',
      matricNumber: 'U2018/302001',
      studentName: 'Jane Doe',
      courseCode: 'CSC 401',
      courseTitle: 'Artificial Intelligence',
      timeVerified: '2026-06-25T10:15:30.000Z',
      venue: 'Main Examination Hall A',
      institutionId: 'INST-001'
    }
  ];

  const initialAuditLogs = [
    {
      id: 'LOG-001',
      activityType: 'Login Activity',
      description: 'Institution admin logged in successfully from IP 192.168.1.102',
      timestamp: '2026-06-25T09:00:00.000Z',
      userId: 'admin@apex.edu'
    },
    {
      id: 'LOG-002',
      activityType: 'Student Creation',
      description: 'Added student Jane Doe (Matric: U2018/302001)',
      timestamp: '2026-06-25T09:15:00.000Z',
      userId: 'admin@apex.edu'
    },
    {
      id: 'LOG-003',
      activityType: 'QR Verification',
      description: 'Entry Verified: Jane Doe checked in for CSC 401 at Main Examination Hall A',
      timestamp: '2026-06-25T10:15:30.000Z',
      userId: 'system_scanner'
    }
  ];

  localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(initialInstitutions));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));
  localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(initialExams));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(initialAttendance));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
  localStorage.setItem(STORAGE_KEYS.MOCK_INIT, 'true');
};

// Initialize
if (!localStorage.getItem(STORAGE_KEYS.MOCK_INIT)) {
  seedData();
}

// Database Helpers
const getItem = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setItem = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const mockDb = {
  // Syncing
  exportData: () => {
    const data = {};
    Object.keys(STORAGE_KEYS).forEach(k => {
      data[STORAGE_KEYS[k]] = localStorage.getItem(STORAGE_KEYS[k]);
    });
    return JSON.stringify(data);
  },

  importData: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      Object.keys(data).forEach(k => {
        if (data[k]) localStorage.setItem(k, data[k]);
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // Student Auth Operations
  loginStudent: (username, password) => {
    const students = getItem(STORAGE_KEYS.STUDENTS);
    const student = students.find(
      s => (s.username.toLowerCase() === username.toLowerCase() || s.matricNumber.toLowerCase() === username.toLowerCase()) && 
      s.password === password
    );
    if (!student) {
      throw new Error('Invalid username, matric number or password.');
    }
    if (student.status === 'Suspended') {
      throw new Error('Your account has been suspended. Please contact the administrator.');
    }
    
    const token = 'JWT_MOCK_TOKEN_STUDENT_' + student.id + '_' + Date.now();
    const userSession = {
      token,
      user: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        matricNumber: student.matricNumber,
        department: student.department,
        faculty: student.faculty,
        level: student.level,
        email: student.email,
        phone: student.phoneNumber,
        passportPhoto: student.passportPhoto,
        role: 'student',
        institutionId: student.institutionId
      }
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userSession));
    return userSession;
  },

  forgotPassword: (email) => {
    const students = getItem(STORAGE_KEYS.STUDENTS);
    const student = students.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (!student) {
      throw new Error('Student email address not found.');
    }
    return { message: 'Reset link simulated and logged.' };
  },

  resetPassword: (email, newPassword) => {
    const students = getItem(STORAGE_KEYS.STUDENTS);
    const sIdx = students.findIndex(s => s.email.toLowerCase() === email.toLowerCase());
    if (sIdx !== -1) {
      students[sIdx].password = newPassword;
      setItem(STORAGE_KEYS.STUDENTS, students);
      return true;
    }
    throw new Error('Student account not found.');
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  },

  getStudentExams: (department, level) => {
    const exams = getItem(STORAGE_KEYS.EXAMS);
    // Return active exams matches department and level
    return exams.filter(e => e.department === department && e.level === level && e.status === 'Active');
  },

  getStudentAttendance: (studentId) => {
    const all = getItem(STORAGE_KEYS.ATTENDANCE);
    return all.filter(a => a.studentId === studentId);
  },

  updateStudentProfile: (studentId, data) => {
    const students = getItem(STORAGE_KEYS.STUDENTS);
    const idx = students.findIndex(s => s.id === studentId);
    if (idx === -1) throw new Error('Student not found.');

    students[idx] = { ...students[idx], ...data };
    setItem(STORAGE_KEYS.STUDENTS, students);

    // Update current session user info too
    const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    if (current && current.user.id === studentId) {
      current.user = { ...current.user, ...data };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(current));
    }

    return students[idx];
  }
};

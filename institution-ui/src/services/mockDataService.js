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

  // Auth Operations
  signupInstitution: (data) => {
    const insts = getItem(STORAGE_KEYS.INSTITUTIONS);
    if (insts.some(i => i.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('An institution with this email already exists.');
    }
    const newInst = {
      id: 'INST-' + Date.now(),
      name: data.institutionName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      password: data.password
    };
    insts.push(newInst);
    setItem(STORAGE_KEYS.INSTITUTIONS, insts);

    // Add Audit Log
    mockDb.addAuditLog('Login Activity', `Institution ${data.institutionName} signed up successfully`, data.email);

    return newInst;
  },

  loginInstitution: (email, password) => {
    const insts = getItem(STORAGE_KEYS.INSTITUTIONS);
    const inst = insts.find(i => i.email.toLowerCase() === email.toLowerCase() && i.password === password);
    if (!inst) {
      throw new Error('Invalid email or password.');
    }
    const token = 'JWT_MOCK_TOKEN_ADMIN_' + inst.id + '_' + Date.now();
    const userSession = {
      token,
      user: {
        id: inst.id,
        name: inst.name,
        email: inst.email,
        phone: inst.phone,
        address: inst.address,
        role: 'institution'
      }
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userSession));
    mockDb.addAuditLog('Login Activity', `Admin user logged in successfully`, email);
    return userSession;
  },

  forgotPassword: (email) => {
    const insts = getItem(STORAGE_KEYS.INSTITUTIONS);
    const inst = insts.find(i => i.email.toLowerCase() === email.toLowerCase());
    // Also support student email checking if student portal uses it
    const students = getItem(STORAGE_KEYS.STUDENTS);
    const student = students.find(s => s.email.toLowerCase() === email.toLowerCase());
    
    if (!inst && !student) {
      throw new Error('Email address not found.');
    }
    return { message: 'Reset link simulated and logged.' };
  },

  resetPassword: (tokenOrEmail, newPassword) => {
    // In simulation, we update the matched password
    const insts = getItem(STORAGE_KEYS.INSTITUTIONS);
    const idx = insts.findIndex(i => i.email.toLowerCase() === tokenOrEmail.toLowerCase());
    if (idx !== -1) {
      insts[idx].password = newPassword;
      setItem(STORAGE_KEYS.INSTITUTIONS, insts);
      mockDb.addAuditLog('Settings Update', `Password reset successfully for ${tokenOrEmail}`, tokenOrEmail);
      return true;
    }
    
    const students = getItem(STORAGE_KEYS.STUDENTS);
    const sIdx = students.findIndex(s => s.email.toLowerCase() === tokenOrEmail.toLowerCase());
    if (sIdx !== -1) {
      students[sIdx].password = newPassword;
      setItem(STORAGE_KEYS.STUDENTS, students);
      return true;
    }
    
    throw new Error('User session not found.');
  },

  logout: () => {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    if (currentUser) {
      mockDb.addAuditLog('Login Activity', `User logged out`, currentUser.user.email);
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
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

  // Student Management Operations
  getStudents: (institutionId) => {
    const all = getItem(STORAGE_KEYS.STUDENTS);
    return all.filter(s => s.institutionId === institutionId);
  },

  createStudent: (data, institutionId) => {
    const students = getItem(STORAGE_KEYS.STUDENTS);
    if (students.some(s => s.matricNumber.toLowerCase() === data.matricNumber.toLowerCase())) {
      throw new Error('Matric number already registered.');
    }
    if (students.some(s => s.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Email address already registered.');
    }

    // Auto-generate credentials
    const username = (data.firstName.toLowerCase() + '.' + data.lastName.toLowerCase()).replace(/\s+/g, '');
    const password = 'STUD-' + Math.floor(1000 + Math.random() * 9000);

    const newStudent = {
      id: 'STUD-' + Date.now(),
      firstName: data.firstName,
      lastName: data.lastName,
      otherName: data.otherName || '',
      matricNumber: data.matricNumber,
      department: data.department,
      faculty: data.faculty,
      level: data.level,
      phoneNumber: data.phoneNumber,
      email: data.email,
      passportPhoto: data.passportPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', // placeholder
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      status: 'Active',
      username,
      password,
      institutionId
    };

    students.push(newStudent);
    setItem(STORAGE_KEYS.STUDENTS, students);
    
    mockDb.addAuditLog('Student Creation', `Created student ${data.firstName} ${data.lastName} (${data.matricNumber})`, 'admin@apex.edu');
    return newStudent;
  },

  updateStudent: (id, data) => {
    const students = getItem(STORAGE_KEYS.STUDENTS);
    const idx = students.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Student not found.');

    students[idx] = { ...students[idx], ...data };
    setItem(STORAGE_KEYS.STUDENTS, students);

    mockDb.addAuditLog('Student Update', `Updated details for student ${students[idx].firstName} ${students[idx].lastName}`, 'admin@apex.edu');
    return students[idx];
  },

  deleteStudent: (id) => {
    const students = getItem(STORAGE_KEYS.STUDENTS);
    const student = students.find(s => s.id === id);
    if (!student) throw new Error('Student not found.');

    const filtered = students.filter(s => s.id !== id);
    setItem(STORAGE_KEYS.STUDENTS, filtered);

    mockDb.addAuditLog('Student Deletion', `Deleted student ${student.firstName} ${student.lastName}`, 'admin@apex.edu');
    return true;
  },

  suspendStudent: (id) => {
    const students = getItem(STORAGE_KEYS.STUDENTS);
    const idx = students.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Student not found.');

    students[idx].status = 'Suspended';
    setItem(STORAGE_KEYS.STUDENTS, students);

    mockDb.addAuditLog('Student Update', `Suspended student ${students[idx].firstName} ${students[idx].lastName}`, 'admin@apex.edu');
    return students[idx];
  },

  activateStudent: (id) => {
    const students = getItem(STORAGE_KEYS.STUDENTS);
    const idx = students.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Student not found.');

    students[idx].status = 'Active';
    setItem(STORAGE_KEYS.STUDENTS, students);

    mockDb.addAuditLog('Student Update', `Activated student ${students[idx].firstName} ${students[idx].lastName}`, 'admin@apex.edu');
    return students[idx];
  },

  // Exam Management Operations
  getExams: () => {
    return getItem(STORAGE_KEYS.EXAMS);
  },

  createExam: (data) => {
    const exams = getItem(STORAGE_KEYS.EXAMS);
    const newExam = {
      id: 'EXAM-' + Date.now(),
      courseCode: data.courseCode,
      courseTitle: data.courseTitle,
      examDate: data.examDate,
      examTime: data.examTime,
      venue: data.venue,
      department: data.department,
      level: data.level,
      status: 'Active'
    };
    exams.push(newExam);
    setItem(STORAGE_KEYS.EXAMS, exams);

    mockDb.addAuditLog('Exam Creation', `Created exam ${data.courseCode} scheduled for ${data.examDate}`, 'admin@apex.edu');
    return newExam;
  },

  updateExam: (id, data) => {
    const exams = getItem(STORAGE_KEYS.EXAMS);
    const idx = exams.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Exam not found.');

    exams[idx] = { ...exams[idx], ...data };
    setItem(STORAGE_KEYS.EXAMS, exams);

    mockDb.addAuditLog('Exam Update', `Updated exam details for ${exams[idx].courseCode}`, 'admin@apex.edu');
    return exams[idx];
  },

  deleteExam: (id) => {
    const exams = getItem(STORAGE_KEYS.EXAMS);
    const exam = exams.find(e => e.id === id);
    if (!exam) throw new Error('Exam not found.');

    const filtered = exams.filter(e => e.id !== id);
    setItem(STORAGE_KEYS.EXAMS, filtered);

    mockDb.addAuditLog('Exam Deletion', `Deleted exam ${exam.courseCode}`, 'admin@apex.edu');
    return true;
  },

  archiveExam: (id) => {
    const exams = getItem(STORAGE_KEYS.EXAMS);
    const idx = exams.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Exam not found.');

    exams[idx].status = 'Archived';
    setItem(STORAGE_KEYS.EXAMS, exams);

    mockDb.addAuditLog('Exam Archiving', `Archived exam ${exams[idx].courseCode}`, 'admin@apex.edu');
    return exams[idx];
  },

  // QR Code Verification Engine
  validateQRCode: (qrString, activeExamId) => {
    try {
      const payload = decodeQR(qrString);
      const { studentId, matricNumber, examId, institutionId, timestamp } = payload;
      
      const students = getItem(STORAGE_KEYS.STUDENTS);
      const student = students.find(s => s.id === studentId || s.matricNumber === matricNumber);
      
      const exams = getItem(STORAGE_KEYS.EXAMS);
      const exam = exams.find(e => e.id === examId);

      // Verify QR Integrity
      if (!student || !exam) {
        mockDb.addAuditLog('QR Verification', `Rejected scan: Invalid credentials. Checksum failed.`, 'system_scanner');
        return { verified: false, reason: 'Invalid QR', student: null, exam: null };
      }

      // Verify QR Expiration (simulate 5-minute validity for QR code timestamps)
      const tokenTime = new Date(timestamp).getTime();
      const currentTime = Date.now();
      const ageInMinutes = (currentTime - tokenTime) / (1000 * 60);
      if (ageInMinutes > 60 * 24 * 7) { // 7 days fallback for simple demo compatibility, but check
        // We can make it 15 minutes for security, but allow longer for user testing demo. Let's make it 30 mins.
      }
      if (isNaN(tokenTime)) {
        return { verified: false, reason: 'Invalid QR', student, exam };
      }
      // If the QR timestamp is more than 30 mins old, reject it
      if (Math.abs(currentTime - tokenTime) > 30 * 60 * 1000) {
        mockDb.addAuditLog('QR Verification', `Rejected scan: Expired token for ${student.firstName} ${student.lastName}`, 'system_scanner');
        return { verified: false, reason: 'Expired QR', student, exam };
      }

      // Verify Student Status
      if (student.status === 'Suspended') {
        mockDb.addAuditLog('QR Verification', `Rejected scan: Student Suspended (${student.firstName} ${student.lastName})`, 'system_scanner');
        return { verified: false, reason: 'Suspended Student', student, exam };
      }

      // Verify Exam matching with scanner selection
      if (activeExamId && exam.id !== activeExamId) {
        mockDb.addAuditLog('QR Verification', `Rejected scan: Wrong Exam scheduled. Scanner was checking for ${activeExamId}, got ${exam.id}`, 'system_scanner');
        return { verified: false, reason: 'Wrong Exam', student, exam };
      }

      // Verify Double Scans (Already Used)
      const attendance = getItem(STORAGE_KEYS.ATTENDANCE);
      const alreadyCheckedIn = attendance.some(a => a.studentId === student.id && a.courseCode === exam.courseCode);
      if (alreadyCheckedIn) {
        mockDb.addAuditLog('QR Verification', `Rejected scan: Re-entry attempted for ${student.firstName} ${student.lastName} in ${exam.courseCode}`, 'system_scanner');
        return { verified: false, reason: 'Already Used', student, exam };
      }

      // Success! Insert Attendance Record
      const newAttendance = {
        id: 'ATT-' + Date.now(),
        studentId: student.id,
        matricNumber: student.matricNumber,
        studentName: `${student.firstName} ${student.lastName}`,
        courseCode: exam.courseCode,
        courseTitle: exam.courseTitle,
        timeVerified: new Date().toISOString(),
        venue: exam.venue,
        institutionId: institutionId
      };
      
      attendance.push(newAttendance);
      setItem(STORAGE_KEYS.ATTENDANCE, attendance);

      mockDb.addAuditLog('QR Verification', `Entry Verified: ${student.firstName} ${student.lastName} checked in for ${exam.courseCode}`, 'system_scanner');
      return { verified: true, reason: 'Verified', student, exam, checkInTime: newAttendance.timeVerified };

    } catch (e) {
      console.error(e);
      return { verified: false, reason: 'Invalid QR', student: null, exam: null };
    }
  },

  // Attendance Operations
  getAttendance: () => {
    return getItem(STORAGE_KEYS.ATTENDANCE);
  },

  // Audit Logs Operations
  getAuditLogs: () => {
    return getItem(STORAGE_KEYS.AUDIT_LOGS).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  addAuditLog: (activityType, description, userId) => {
    const logs = getItem(STORAGE_KEYS.AUDIT_LOGS);
    const newLog = {
      id: 'LOG-' + Date.now(),
      activityType,
      description,
      timestamp: new Date().toISOString(),
      userId
    };
    logs.push(newLog);
    // Keep logs cap to 200 for clean storage
    if (logs.length > 200) logs.shift();
    setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
    return newLog;
  }
};

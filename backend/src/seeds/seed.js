/**
 * Seed script - Creates Super Admin + Test Institution + Test Students + Test Exam
 * Run with: npm run seed
 */
const mongoose = require('mongoose');
const env = require('../config/env');
const Institution = require('../models/Institution');
const User = require('../models/User');
const Student = require('../models/Student');
const Exam = require('../models/Exam');
const logger = require('../utils/logger');

const seedData = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Connected to MongoDB for seeding');

    // ============================
    // 1. SUPER ADMIN
    // ============================
    const existingAdmin = await User.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      logger.info('Super Admin already exists. Skipping super admin creation.');
    } else {
      const systemInstitution = await Institution.create({
        name: 'System Administration',
        email: 'admin@smarthallentry.com',
        phone: '',
        address: '',
        status: 'active',
      });

      await User.create({
        institutionId: systemInstitution._id,
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@smarthallentry.com',
        passwordHash: 'Admin@123456', // Will be hashed by pre-save
        role: 'super_admin',
        status: 'active',
      });

      logger.info('Super Admin created: admin@smarthallentry.com / Admin@123456');
    }

    // ============================
    // 2. TEST INSTITUTION
    // ============================
    let testInstitution = await Institution.findOne({ email: 'admin@apex.edu' });
    if (testInstitution) {
      logger.info('Test institution already exists. Skipping.');
    } else {
      testInstitution = await Institution.create({
        name: 'Apex Technical University',
        email: 'admin@apex.edu',
        phone: '+234 812 345 6789',
        address: '12 University Road, Yaba, Lagos',
        status: 'active',
      });
      logger.info(`Test institution created: ${testInstitution.name}`);
    }

    // ============================
    // 3. INSTITUTION ADMIN USER
    // ============================
    let instAdmin = await User.findOne({ email: 'admin@apex.edu' });
    if (instAdmin) {
      logger.info('Institution admin already exists. Skipping.');
    } else {
      instAdmin = await User.create({
        institutionId: testInstitution._id,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@apex.edu',
        passwordHash: 'password123', // Will be hashed by pre-save
        role: 'institution_admin',
        status: 'active',
      });
      logger.info('Institution admin created: admin@apex.edu / password123');
    }

    // ============================
    // 4. TEST STUDENTS
    // ============================
    const studentsToCreate = [
      {
        firstName: 'Jane',
        lastName: 'Doe',
        otherName: 'Mary',
        matricNumber: 'U2018/302001',
        department: 'Computer Science',
        faculty: 'Science',
        level: '400 Level',
        email: 'jane.doe@apex.edu',
        phone: '+234 801 111 2222',
        gender: 'female',
        dateOfBirth: new Date('2004-05-12'),
        username: 'jane.doe',
        passwordHash: 'student123', // Will be hashed by pre-save
        status: 'active',
      },
      {
        firstName: 'John',
        lastName: 'Smith',
        otherName: 'David',
        matricNumber: 'U2018/302002',
        department: 'Computer Science',
        faculty: 'Science',
        level: '400 Level',
        email: 'john.smith@apex.edu',
        phone: '+234 802 222 3333',
        gender: 'male',
        dateOfBirth: new Date('2003-08-20'),
        username: 'john.smith',
        passwordHash: 'student123',
        status: 'active',
      },
      {
        firstName: 'Chioma',
        lastName: 'Nwachukwu',
        otherName: 'Blessing',
        matricNumber: 'U2018/302003',
        department: 'Mathematics',
        faculty: 'Science',
        level: '300 Level',
        email: 'chioma.n@apex.edu',
        phone: '+234 803 333 4444',
        gender: 'female',
        dateOfBirth: new Date('2005-01-15'),
        username: 'chioma.n',
        passwordHash: 'student123',
        status: 'active',
      },
    ];

    for (const studentData of studentsToCreate) {
      const existing = await Student.findOne({
        institutionId: testInstitution._id,
        matricNumber: studentData.matricNumber,
      });
      if (existing) {
        logger.info(`Student ${studentData.username} already exists. Skipping.`);
        continue;
      }
      await Student.create({
        institutionId: testInstitution._id,
        ...studentData,
      });
      logger.info(`Student created: ${studentData.username} / student123`);
    }

    // ============================
    // 5. TEST EXAMS
    // ============================
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    const examsToCreate = [
      {
        courseCode: 'CSC 401',
        title: 'Artificial Intelligence',
        examDate: tomorrow,
        startTime: '09:00 AM',
        endTime: '12:00 PM',
        venue: 'Main Examination Hall A',
        department: 'Computer Science',
        faculty: 'Science',
        level: '400 Level',
        semester: 'Second',
        session: '2025/2026',
        status: 'active',
      },
      {
        courseCode: 'CSC 403',
        title: 'Software Engineering II',
        examDate: dayAfter,
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        venue: 'E-Learning Centre Suite B',
        department: 'Computer Science',
        faculty: 'Science',
        level: '400 Level',
        semester: 'Second',
        session: '2025/2026',
        status: 'upcoming',
      },
      {
        courseCode: 'MTH 301',
        title: 'Abstract Algebra II',
        examDate: dayAfter,
        startTime: '11:00 AM',
        endTime: '02:00 PM',
        venue: 'Faculty Lecture Theatre II',
        department: 'Mathematics',
        faculty: 'Science',
        level: '300 Level',
        semester: 'Second',
        session: '2025/2026',
        status: 'upcoming',
      },
    ];

    for (const examData of examsToCreate) {
      const existing = await Exam.findOne({
        institutionId: testInstitution._id,
        courseCode: examData.courseCode,
      });
      if (existing) {
        logger.info(`Exam ${examData.courseCode} already exists. Skipping.`);
        continue;
      }
      await Exam.create({
        institutionId: testInstitution._id,
        createdBy: instAdmin._id,
        ...examData,
      });
      logger.info(`Exam created: ${examData.courseCode} - ${examData.title}`);
    }

    // ============================
    // SUMMARY
    // ============================
    logger.info('');
    logger.info('='.repeat(55));
    logger.info('  SEED COMPLETED SUCCESSFULLY');
    logger.info('='.repeat(55));
    logger.info('');
    logger.info('  SUPER ADMIN LOGIN:');
    logger.info('    Email:    admin@smarthallentry.com');
    logger.info('    Password: Admin@123456');
    logger.info('');
    logger.info('  INSTITUTION ADMIN LOGIN:');
    logger.info('    Email:    admin@apex.edu');
    logger.info('    Password: password123');
    logger.info('');
    logger.info('  TEST STUDENT LOGINS:');
    logger.info('    Username: jane.doe     Password: student123');
    logger.info('    Username: john.smith   Password: student123');
    logger.info('    Username: chioma.n     Password: student123');
    logger.info('');
    logger.info('='.repeat(55));

    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();

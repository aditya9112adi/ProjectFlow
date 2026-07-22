import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Admin } from '../models/Admin.model.js';
import { StudentData } from '../models/StudentData.model.js';

const seedDatabase = async () => {
  console.log('🌱 Seeding database...');
  await mongoose.connect(process.env.MONGODB_URI);

  const existingAdmin = await Admin.findOne({ email: 'admin@university.edu' });
  if (!existingAdmin) {
    await Admin.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@university.edu',
      password: 'admin123',
      role: 'admin',
      employeeId: 'ADM001',
      designation: 'Administrator',
      department: 'Management',
      isActive: true,
    });
    console.log('✅ Admin seeded successfully!');
  } else {
    console.log('✅ Admin already exists.');
  }

  const existingStudent = await StudentData.findOne({ prn: '252921001@sguk.ac.in' });
  if (!existingStudent) {
    await StudentData.create({
      studentName: 'Test Student',
      prn: '252921001@sguk.ac.in',
      department: 'Computer Science',
      academicYear: '2025',
      section: 'A',
      phoneNumber: '1234567890',
      role: 'student',
      isActive: true,
    });
    console.log('✅ Student seeded successfully!');
  } else {
    console.log('✅ Student already exists.');
  }

  await mongoose.disconnect();
  process.exit(0);
};

seedDatabase().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

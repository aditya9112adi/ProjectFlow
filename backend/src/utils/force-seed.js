import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User.model.js';
import bcrypt from 'bcryptjs';

const forceSeedAdmin = async () => {
  console.log('🌱 Force-seeding admin...');
  await mongoose.connect(process.env.MONGODB_URI);

  const email = 'kshirsagaraditya9112@gmail.com';
  const password = 'Aditya9112@@';

  // Find if user already exists
  let user = await User.findOne({ email });

  if (user) {
    console.log(`User found with email ${email}. Updating password and role to admin...`);
    user.password = password;
    user.role = 'admin';
    user.firstName = 'Aditya';
    user.lastName = 'Kshirsagar';
    user.employeeId = 'EMP001';
    user.designation = 'Professor';
    user.department = 'Computer Science';
    user.isActive = true;
    
    // Mongoose pre-save hook will hash the password if it's modified
    await user.save();
    console.log('✅ Admin updated successfully!');
  } else {
    console.log(`User not found. Creating new admin with email ${email}...`);
    await User.create({
      firstName: 'Aditya',
      lastName: 'Kshirsagar',
      email: email,
      password: password,
      role: 'admin',
      employeeId: 'EMP001',
      designation: 'Professor',
      department: 'Computer Science',
      isActive: true,
    });
    console.log('✅ Admin created successfully!');
  }

  console.log('   📧 Email:', email);
  console.log('   🔑 Password:', password);
  
  await mongoose.disconnect();
  process.exit(0);
};

forceSeedAdmin().catch((err) => {
  console.error('❌ Force-seed failed:', err);
  process.exit(1);
});

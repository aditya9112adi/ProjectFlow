import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Admin } from './src/models/Admin.model.js';
import { StudentData } from './src/models/StudentData.model.js';
import { authService } from './src/services/auth.service.js';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  try {
    const studentUser = await authService.loginStudentByPrn('252921001@sguk.ac.in');
    const { accessToken } = await authService.generateTokens(studentUser);
    const decoded = jwt.decode(accessToken);
    console.log('Student token decoded:', decoded);
  } catch (err) {
    console.error('Student login error:', err.message);
  }
  
  await mongoose.disconnect();
}
test();

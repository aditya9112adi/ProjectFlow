import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './src/config/database.js';
import { StudentData } from './src/models/StudentData.model.js';
import { TeamLeaderPrn } from './src/models/TeamLeaderPrn.model.js';

const attachLeaderFlag = async (user) => {
  if (user.role === 'admin') return user.toJSON ? user.toJSON() : user;
  const userObj = user.toJSON ? user.toJSON() : user;
  
  if (userObj.studentName && !userObj.firstName) {
    userObj.firstName = userObj.studentName.split(' ')[0] || '';
    userObj.lastName = userObj.studentName.split(' ').slice(1).join(' ') || '';
  }
  if (userObj.prn && !userObj.rollNumber) {
    userObj.rollNumber = userObj.prn.replace('@sguk.ac.in', '');
  }
  
  const barePrn = userObj.prn ? userObj.prn.split('@')[0] : '';
  
  const isLeader = await TeamLeaderPrn.exists({ prn: barePrn });
  return { ...userObj, isDesignatedLeader: !!isLeader };
};

const runTest = async () => {
  await connectDB();
  const student = await StudentData.findOne();
  console.log('Original student:', student);
  const result = await attachLeaderFlag(student);
  console.log('Result:', result);
  process.exit(0);
};

runTest();

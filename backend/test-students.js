import mongoose from 'mongoose';
import { StudentData } from './src/models/StudentData.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const student = await StudentData.findOne({ prn: '252921001@sguk.ac.in' }).lean();
  console.log("Student 001:", student ? student.prn : "Not found");
  process.exit(0);
});

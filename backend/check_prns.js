import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './src/config/database.js';
import { StudentData } from './src/models/StudentData.model.js';

const checkPRNs = async () => {
  await connectDB();
  const students = await StudentData.find({}, 'prn').limit(10);
  console.log('Sample PRNs:', students.map(s => s.prn));
  process.exit(0);
};

checkPRNs();
